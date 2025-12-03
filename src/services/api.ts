import type { Incident, InventoryItem, LendRecord, DonationRecord, ReportIncidentFormData } from '../lib/types'

/**
 * API 基礎配置
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false' // 預設使用 Mock 數據

/**
 * CSV 數據載入器
 */
async function loadCSV<T>(filename: string): Promise<T[]> {
  try {
    const response = await fetch(`/data/${filename}`)
    const text = await response.text()
    const lines = text.trim().split('\n')
    const headers = lines[0].split(',')
    
    return lines.slice(1).map(line => {
      const values = line.split(',')
      const obj: any = {}
      headers.forEach((header, index) => {
        obj[header.trim()] = values[index]?.trim() || ''
      })
      return obj as T
    })
  } catch (error) {
    console.error(`Error loading CSV ${filename}:`, error)
    return []
  }
}

/**
 * 災情 API
 */
export const incidentAPI = {
  /**
   * 獲取所有災情
   */
  async getAll(): Promise<Incident[]> {
    if (USE_MOCK_DATA) {
      const data = await loadCSV<any>('incidents.csv')
      return data.map(item => ({
        incident_id: item.incident_id,
        title: item.title,
        type: item.type,
        severity: parseInt(item.severity) || 0,
        area_id: item.area_id,
        reported_at: item.reported_at,
        reporter_id: item.reporter_id,
        address: item.address,
        status: item.status as 'Occurring' | 'Resolved' | 'Under Investigation',
        msg: item.msg,
        latitude: parseFloat(item.latitude) || 0,
        longitude: parseFloat(item.longitude) || 0,
        reviewed_at: item.reviewed_at,
        reviewer_id: item.reviewer_id,
        review_status: item.review_status as 'Verified' | 'Pending' | 'Rejected',
        review_note: item.review_note
      }))
    }
    
    const response = await fetch(`${API_BASE_URL}/incidents`)
    return response.json()
  },

  /**
   * 根據 ID 獲取單一災情
   */
  async getById(id: string): Promise<Incident | null> {
    if (USE_MOCK_DATA) {
      const incidents = await this.getAll()
      return incidents.find(i => i.incident_id === id) || null
    }
    
    const response = await fetch(`${API_BASE_URL}/incidents/${id}`)
    if (!response.ok) return null
    return response.json()
  },

  /**
   * 創建新災情通報
   */
  async create(data: ReportIncidentFormData): Promise<{ success: boolean; incident_id?: string; message?: string }> {
    if (USE_MOCK_DATA) {
      // Mock 創建成功
      return {
        success: true,
        incident_id: `INC${Date.now()}`,
        message: '災情通報已成功提交（模擬）'
      }
    }
    
    const response = await fetch(`${API_BASE_URL}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  }
}

/**
 * 物品庫 API
 */
export const inventoryAPI = {
  /**
   * 獲取所有物品（含庫存資訊）
   */
  async getItems(): Promise<InventoryItem[]> {
    if (USE_MOCK_DATA) {
      const [items, inventoryItems, inventories] = await Promise.all([
        loadCSV<any>('items.csv'),
        loadCSV<any>('inventory_items.csv'),
        loadCSV<any>('inventories.csv')
      ])
      
      // 合併資料
      const inventoryMap = new Map(inventories.map(inv => [inv.inventory_id, inv]))
      
      return inventoryItems.map(invItem => {
        const item = items.find(i => i.item_id === invItem.item_id)
        const inventory = inventoryMap.get(invItem.inventory_id)
        
        return {
          item_id: invItem.item_id,
          item_name: item?.item_name || '',
          category_id: item?.category_id || '',
          unit: item?.unit || '',
          available_qty: parseInt(invItem.qty) || 0,
          inventory_id: invItem.inventory_id,
          address: inventory?.address || '',
          status: invItem.status
        }
      })
    }
    
    const response = await fetch(`${API_BASE_URL}/inventory/items`)
    return response.json()
  },

  /**
   * 借用物品
   */
  async lendItem(data: {
    user_id: string
    item_id: string
    qty: number
    from_inventory_id: string
  }): Promise<{ success: boolean; lend_id?: string; message?: string }> {
    if (USE_MOCK_DATA) {
      return {
        success: true,
        lend_id: `LEND${Date.now()}`,
        message: '借用成功（模擬）'
      }
    }
    
    const response = await fetch(`${API_BASE_URL}/lends`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  },

  /**
   * 獲取使用者的借用記錄
   */
  async getMyLends(userId: string): Promise<LendRecord[]> {
    if (USE_MOCK_DATA) {
      const [lends, items] = await Promise.all([
        loadCSV<any>('lends.csv'),
        loadCSV<any>('items.csv')
      ])
      
      return lends
        .filter(lend => lend.user_id === userId)
        .map(lend => {
          const item = items.find(i => i.item_id === lend.item_id)
          return {
            lend_id: lend.lend_id,
            user_id: lend.user_id,
            item_id: lend.item_id,
            item_name: item?.item_name || '',
            qty: parseInt(lend.qty) || 0,
            from_inventory_id: lend.from_inventory_id,
            lend_at: lend.lend_at,
            returned_at: lend.returned_at
          }
        })
    }
    
    const response = await fetch(`${API_BASE_URL}/lends/user/${userId}`)
    return response.json()
  },

  /**
   * 歸還物品
   */
  async returnItem(lendId: string): Promise<{ success: boolean; message?: string }> {
    if (USE_MOCK_DATA) {
      return {
        success: true,
        message: '歸還成功（模擬）'
      }
    }
    
    const response = await fetch(`${API_BASE_URL}/lends/${lendId}/return`, {
      method: 'PATCH'
    })
    return response.json()
  }
}

/**
 * 捐款 API
 */
export const donationAPI = {
  /**
   * 獲取所有捐款記錄
   */
  async getAll(): Promise<DonationRecord[]> {
    if (USE_MOCK_DATA) {
      const data = await loadCSV<any>('financials.csv')
      return data.map(item => ({
        txn_id: item.txn_id,
        source: item.source,
        amount: parseFloat(item.amount) || 0,
        currency: item.currency,
        purpose: item.purpose,
        created_at: item.created_at
      }))
    }
    
    const response = await fetch(`${API_BASE_URL}/financials`)
    return response.json()
  },

  /**
   * 創建新捐款記錄
   */
  async create(data: Omit<DonationRecord, 'txn_id' | 'created_at'>): Promise<{ success: boolean; txn_id?: string; message?: string }> {
    if (USE_MOCK_DATA) {
      return {
        success: true,
        txn_id: `TXN${Date.now()}`,
        message: '捐款記錄已創建（模擬）'
      }
    }
    
    const response = await fetch(`${API_BASE_URL}/financials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  }
}

/**
 * 避難所 API（已有實現，這裡提供一致的介面）
 */
export const shelterAPI = {
  /**
   * 獲取所有避難所
   */
  async getAll(): Promise<any[]> {
    if (USE_MOCK_DATA) {
      return loadCSV('shelters.csv')
    }
    
    const response = await fetch(`${API_BASE_URL}/shelters`)
    return response.json()
  }
}

