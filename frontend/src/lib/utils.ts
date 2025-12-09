import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Need, MaterialNeed, ToolNeed, ManpowerNeed } from './types'
import { REGIONS } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const categoryMap: Record<string, string> = {
  '食物': 'food',
  '飲用水': 'water',
  '醫療用品': 'medical_supply',
  '衣物': 'clothing',
  '住所用品': 'shelter_supply',
  '日用品': 'daily_necessities',
  '其他物資': 'other_material',
  '挖土機': 'equipment',
  '發電機': 'equipment',
  '淨水設備': 'water',
  '運輸車輛': 'transport',
  '照明設備': 'equipment',
  '通訊設備': 'equipment',
  '其他工具': 'equipment'
}

const getCategoryKey = (name: string | null, type: string): any => {
  if (!name) return type === 'Item' ? 'other_material' : 'other_rescue'
  return categoryMap[name] || (type === 'Item' ? 'other_material' : 'other_rescue')
}

const mapUrgencyToSeverity = (urgency: number): 'critical' | 'high' | 'medium' | 'low' => {
  if (urgency >= 5) return 'critical'
  if (urgency === 4) return 'high'
  if (urgency === 3) return 'medium'
  return 'low'
}

/**
 * 從地址中提取鄉鎮名稱
 * 地址格式：花蓮縣XX鄉/鎮/市...
 */
function extractTownshipFromAddress(address: string | null | undefined): string {
  if (!address) return '全部'
  
  // 直接檢查地址是否包含各個鄉鎮名稱（從最長到最短，避免部分匹配）
  // 按照 REGIONS 的順序檢查，優先匹配完整的鄉鎮名稱
  const townshipNames = [
    '花蓮縣花蓮市',
    '花蓮縣鳳林鎮',
    '花蓮縣玉里鎮',
    '花蓮縣新城鄉',
    '花蓮縣吉安鄉',
    '花蓮縣壽豐鄉',
    '花蓮縣光復鄉',
    '花蓮縣豐濱鄉',
    '花蓮縣瑞穗鄉',
    '花蓮縣富里鄉',
    '花蓮縣秀林鄉',
    '花蓮縣萬榮鄉',
    '花蓮縣卓溪鄉'
  ]
  
  for (const township of townshipNames) {
    if (address.includes(township)) {
      return township
    }
  }
  
  // 如果沒有匹配到，嘗試匹配「花蓮縣」後面的鄉鎮名稱（市、鎮、鄉）
  const match = address.match(/花蓮縣([^縣市鎮鄉路街段號]+[市鎮鄉])/)
  if (match && match[1]) {
    const township = `花蓮縣${match[1]}`
    // 檢查是否在 REGIONS 列表中
    if (REGIONS.includes(township)) {
      return township
    }
  }
  
  return '全部' // 預設返回「全部」，這樣就不會被篩選掉
}

export function parseNeed(row: any): Need {
  // Parse Material Items
  const materialItems = (row.material_items || []).filter((i: any) => i !== null).map((i: any) => ({
    itemId: String(i.item_id),
    itemName: i.item_name,
    quantity: i.qty,
    unit: i.unit,
    category: i.category,
    isTool: i.is_tool,
    conditions: i.conditions,
    manufacturer: i.manufacturer,
    model: i.model,
    expiresIn: i.expires_in
  }))

  // Parse Rescue Details
  const skills = (row.required_skills || []).filter((s: any) => s !== null).map((s: any) => ({
    skillTagId: String(s.skill_tag_id),
    skillName: s.skill_name || `技能 ${s.skill_tag_id}`,
    quantity: s.qty
  }))

  const equipments = (row.required_equipments || []).filter((e: any) => e !== null).map((e: any) => ({
    equipmentId: String(e.equipment_id),
    equipmentName: e.equipment_name || `設備 ${e.equipment_id}`,
    quantity: e.qty
  }))

  // Determine main item name and quantity for summary display
  let mainItemName = row.item_name || ''
  let mainQty = 0
  let mainUnit = row.unit || ''

  if (materialItems.length > 0) {
    mainItemName = materialItems[0].itemName
    mainQty = materialItems[0].quantity
    mainUnit = materialItems[0].unit
    if (materialItems.length > 1) {
      mainItemName += ` 等 ${materialItems.length} 項物資`
    }
  } else if (row.headcount) {
    mainQty = row.headcount
    mainUnit = '人'
  } else if (equipments.length > 0) {
    mainQty = equipments[0].quantity
    mainUnit = '台'
    if (equipments.length > 1) {
      mainItemName = `${equipments[0].equipmentName} 等 ${equipments.length} 項設備`
    } else {
      mainItemName = equipments[0].equipmentName
    }
  } else if (skills.length > 0) {
    mainQty = skills.reduce((acc: number, s: any) => acc + (s.quantity || 1), 0)
    mainUnit = '人'
    if (skills.length > 1) {
      mainItemName = `${skills[0].skillName} 等 ${skills.length} 項技能`
    } else {
      mainItemName = skills[0].skillName
    }
  }

  // 從地址中提取鄉鎮資訊
  const extractedRegion = extractTownshipFromAddress(row.address)
  
  const baseNeed = {
    id: String(row.request_id),
    title: row.title || '未命名需求',
    location: row.address,
    region: row.region || extractedRegion,
    itemName: mainItemName,
    requiredQuantity: mainQty,
    currentQuantity: row.current_qty || 0,
    unit: mainUnit,
    severity: mapUrgencyToSeverity(row.urgency),
    deadline: row.deadline || '',
    description: row.description || '',
    publisherName: row.publisher_name || '',
    contactPhone: row.contact_phone || '',
    contactEmail: row.contact_email || '',
    status: row.status,
    createdAt: row.request_date,
    managementKey: 'N/A',
    incidentId: row.incident_id ? String(row.incident_id) : undefined
  }

  const type = row.type ? row.type.toLowerCase() : ''
  
  if (type === 'material') {
    return {
      ...baseNeed,
      needType: 'material',
      category: getCategoryKey(row.category, 'Item'),
      items: materialItems
    } as MaterialNeed
  } else if (type === 'tool') {
    return {
      ...baseNeed,
      needType: 'tool',
      category: getCategoryKey(row.category, 'Rescue'),
      timeSlots: row.time_slots || '',
      equipments: equipments,
      providedSupport: row.provided_support || ''
    } as ToolNeed
  } else if (type === 'humanpower') {
    return {
      ...baseNeed,
      needType: 'manpower',
      category: getCategoryKey(row.category, 'Rescue'),
      timeSlots: row.time_slots || '',
      skills: skills,
      providedSupport: row.provided_support || ''
    } as ManpowerNeed
  } else {
    // Fallback for legacy data or unknown types
    // If it has items, treat as material
    if (materialItems.length > 0) {
      return {
        ...baseNeed,
        needType: 'material',
        category: getCategoryKey(row.category, 'Item'),
        items: materialItems
      } as MaterialNeed
    }
    // If it has equipments, treat as tool
    if (equipments.length > 0) {
      return {
        ...baseNeed,
        needType: 'tool',
        category: getCategoryKey(row.category, 'Rescue'),
        timeSlots: row.time_slots || '',
        equipments: equipments,
        providedSupport: row.provided_support || ''
      } as ToolNeed
    }
    // Default to manpower (humanpower)
    return {
      ...baseNeed,
      needType: 'manpower',
      category: getCategoryKey(row.category, 'Rescue'),
      timeSlots: row.time_slots || '',
      skills: skills,
      providedSupport: row.provided_support || ''
    } as ManpowerNeed
  }
}
