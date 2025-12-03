import { useState, useEffect } from 'react'
import { inventoryAPI } from '../services/api'
import type { InventoryItem } from '../lib/types'

/**
 * 物品庫資料 Hook
 */
export function useInventoryData() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await inventoryAPI.getItems()
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入物品資料失敗')
      console.error('Error fetching inventory items:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  return {
    items,
    loading,
    error,
    refetch: fetchItems
  }
}

/**
 * 借用物品 Hook
 */
export function useLendItem() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lendItem = async (data: {
    user_id: string
    item_id: string
    qty: number
    from_inventory_id: string
  }) => {
    try {
      setLoading(true)
      setError(null)
      const result = await inventoryAPI.lendItem(data)
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '借用物品失敗'
      setError(errorMsg)
      console.error('Error lending item:', err)
      return { success: false, message: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  return {
    lendItem,
    loading,
    error
  }
}

