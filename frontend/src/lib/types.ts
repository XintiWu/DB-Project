/**
 * 需求類型
 */
/**
 * 需求類型
 */
export type NeedType = 'material' | 'tool' | 'manpower' | 'rescue'

/**
 * 緊急程度
 */
export type Severity = 'critical' | 'high' | 'medium' | 'low'

/**
 * 需求狀態
 */
export type NeedStatus = 'urgent' | 'ongoing' | 'fulfilled' | 'closed'

/**
 * 物資類別
 */
export type MaterialCategory = 
  | 'food'              // 食物
  | 'water'             // 飲用水
  | 'medical_supply'    // 醫療物資
  | 'clothing'          // 衣物
  | 'shelter_supply'    // 住所物資
  | 'daily_necessities' // 日用品
  | 'other_material'    // 其他物資

/**
 * 救災類別
 */
export type RescueCategory = 
  | 'medical_staff'     // 醫護人員
  | 'labor'             // 勞動人力
  | 'equipment'         // 專業設備
  | 'professional'      // 專業服務
  | 'transport'         // 運輸服務
  | 'other_rescue'      // 其他救災

/**
 * 統一類別類型
 */
export type ResourceCategory = MaterialCategory | RescueCategory

/**
 * 物資項目細節
 */
export interface MaterialItem {
  itemId: string
  itemName: string
  quantity: number
  unit: string
  category: string
  isTool: boolean
  conditions?: string
  manufacturer?: string
  model?: string
  expiresIn?: number
}

/**
 * 救災技能
 */
export interface RescueSkill {
  skillTagId: string
  skillName: string
  quantity?: number
}

/**
 * 救災設備
 */
export interface RescueEquipment {
  equipmentId: string
  equipmentName: string
  quantity: number
}

/**
 * 基礎需求介面
 */
interface BaseNeed {
  id: string
  needType: NeedType          // 需求類型
  title: string               // 標題
  location: string            // 具體地點
  region: string              // 區域
  category: string            // 類別名稱
  itemName: string            // 項目名稱 (Summary)
  requiredQuantity: number    // 需求數量 (Summary)
  currentQuantity: number     // 已認領數量
  unit: string                // 單位
  severity: Severity          // 緊急程度
  deadline: string            // 截止時間
  description: string         // 詳細說明
  publisherName: string       // 發布者名稱
  contactPhone: string        // 聯絡電話
  contactEmail: string        // 聯絡信箱
  status: NeedStatus          // 狀態
  createdAt: string           // 建立時間
  managementKey: string       // 管理金鑰
  incidentId?: string         // 關聯災情 ID
}

/**
 * 物資需求 (DB Type: material)
 */
export interface MaterialNeed extends BaseNeed {
  needType: 'material'
  items: MaterialItem[]
  category: string
}

/**
 * 工具需求 (DB Type: tool)
 * Includes Equipments
 */
export interface ToolNeed extends BaseNeed {
  needType: 'tool'
  equipments: RescueEquipment[]
  timeSlots: string
  providedSupport: string
  category: string
}

/**
 * 人力需求 (DB Type: humanpower)
 * Includes Skills
 */
export interface ManpowerNeed extends BaseNeed {
  needType: 'manpower' // Mapped from 'humanpower'
  skills: RescueSkill[]
  timeSlots: string
  providedSupport: string
  category: string
}

/**
 * 統一需求類型
 */
export type Need = MaterialNeed | ToolNeed | ManpowerNeed

/**
 * 認領項目
 */
export interface ClaimItem {
  needId: string
  needType: NeedType
  title: string
  category: string
  quantity: number
  unit: string
  
  // Material/Tool
  estimatedDelivery?: string
  materialSource?: string
  
  // Manpower/Rescue
  availableTimeSlots?: string
  qualifications?: string
  
  note: string
}

/**
 * 認領記錄（已送出的記錄）
 */
export interface ClaimRecord {
  id: string                  // 認領編號
  items: ClaimItem[]          // 認領項目清單
  submittedAt: string         // 送出時間
  claimerName: string         // 認領者姓名
  claimerPhone: string        // 認領者電話
  claimerEmail: string        // 認領者信箱
  notes: string               // 整體備註
}

/**
 * 篩選條件
 */
export interface FilterOptions {
  needType: NeedType | 'all'            // 需求類型
  region: string | 'all'                // 地區
  category: ResourceCategory | 'all'    // 類別
  severity: Severity | 'all'            // 緊急程度
  status: NeedStatus | 'all'            // 狀態
  searchKeyword: string                 // 搜尋關鍵字
}

/**
 * 類別資訊
 */
export interface CategoryInfo {
  id: ResourceCategory
  needType: NeedType
  name: string
  icon: string
  description: string
  color: string
}

/**
 * 發布需求表單資料
 */
export interface PublishNeedFormData {
  needType: NeedType
  title: string
  location: string
  region: string
  category: ResourceCategory
  itemName: string
  requiredQuantity: number
  unit: string
  severity: Severity
  deadline: string
  description: string
  
  // 救災需求專用
  timeSlots?: string
  requiredSkills?: string
  providedSupport?: string
  
  // 發布者資訊
  publisherName: string
  contactPhone: string
  contactEmail: string
}

/**
 * 災情事件
 */
export interface Incident {
  incident_id: string
  title: string
  type: string
  severity: string
  area_id: number
  reporter_id: string
  address: string
  status: string
  msg: string
  latitude: number | null
  longitude: number | null
  created_at: string
  reported_at?: string
}

/**
 * 避難所
 */
export interface Shelter {
  shelter_id: string
  name: string
  address: string
  phone: string
  capacity: number
  type: string
  latitude: number | null
  longitude: number | null
  area_id: number
}

/**
 * 倉庫/庫存
 */
export interface Inventory {
  inventory_id: string
  name: string | null
  address: string
  status: string
  owner_id?: string // Optional, from join
}

/**
 * 財務交易
 */
export interface FinancialTransaction {
  txn_id: string
  source: string
  amount: number
  currency: string
  purpose: string
  admin_id: string
  created_at: string
}

/**
 * 物品
 */
export interface Item {
  item_id: string
  item_name: string
  unit: string
  category_name?: string
}
