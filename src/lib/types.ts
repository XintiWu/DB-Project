/**
 * 需求類型
 */
export type NeedType = 'material' | 'rescue'

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
 * 基礎需求介面
 */
interface BaseNeed {
  id: string
  needType: NeedType          // 需求類型
  title: string               // 標題
  location: string            // 具體地點
  region: string              // 區域（北部、中部、南部、東部）
  category: ResourceCategory  // 類別
  itemName: string            // 項目名稱
  requiredQuantity: number    // 需求數量
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
}

/**
 * 物資需求
 */
export interface MaterialNeed extends BaseNeed {
  needType: 'material'
  category: MaterialCategory
  source?: string             // 物資來源建議
}

/**
 * 救災需求
 */
export interface RescueNeed extends BaseNeed {
  needType: 'rescue'
  category: RescueCategory
  timeSlots: string           // 時間需求（例如：2024-10-15 08:00-17:00）
  requiredSkills: string      // 需要的技能/資格
  providedSupport?: string    // 提供的支援（例如：午餐、交通補助）
}

/**
 * 統一需求類型
 */
export type Need = MaterialNeed | RescueNeed

/**
 * 認領項目（使用者選擇的項目）
 */
export interface ClaimItem {
  needId: string              // 需求 ID
  needType: NeedType          // 需求類型
  title: string               // 需求標題
  category: ResourceCategory  // 類別
  quantity: number            // 認領數量
  unit: string                // 單位
  
  // 物資認領專用
  estimatedDelivery?: string  // 預計送達時間
  materialSource?: string     // 物資來源
  
  // 救災認領專用
  availableTimeSlots?: string // 可參與時間
  qualifications?: string     // 相關資格
  
  note: string                // 備註
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
