import type { CategoryInfo, MaterialCategory, RescueCategory, Severity } from './types'

/**
 * 物資類別資訊
 */
export const MATERIAL_CATEGORIES: Record<MaterialCategory, CategoryInfo> = {
  food: {
    id: 'food',
    needType: 'material',
    name: '食物',
    icon: '🍚',
    description: '米、麵、罐頭、乾糧等',
    color: 'bg-amber-100 text-amber-700 border-amber-200'
  },
  water: {
    id: 'water',
    needType: 'material',
    name: '飲用水',
    icon: '💧',
    description: '瓶裝水、淨水設備',
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  medical_supply: {
    id: 'medical_supply',
    needType: 'material',
    name: '醫療物資',
    icon: '💊',
    description: '藥品、繃帶、消毒用品',
    color: 'bg-red-100 text-red-700 border-red-200'
  },
  clothing: {
    id: 'clothing',
    needType: 'material',
    name: '衣物',
    icon: '👕',
    description: '衣服、鞋子、雨具',
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  shelter_supply: {
    id: 'shelter_supply',
    needType: 'material',
    name: '住所物資',
    icon: '🏕️',
    description: '帳篷、睡袋、毛毯',
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  daily_necessities: {
    id: 'daily_necessities',
    needType: 'material',
    name: '日用品',
    icon: '🧴',
    description: '盥洗用品、衛生紙等',
    color: 'bg-teal-100 text-teal-700 border-teal-200'
  },
  other_material: {
    id: 'other_material',
    needType: 'material',
    name: '其他物資',
    icon: '📦',
    description: '其他物資需求',
    color: 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

/**
 * 救災類別資訊
 */
export const RESCUE_CATEGORIES: Record<RescueCategory, CategoryInfo> = {
  medical_staff: {
    id: 'medical_staff',
    needType: 'rescue',
    name: '醫護人員',
    icon: '👨‍⚕️',
    description: '醫生、護理師、緊急救護員',
    color: 'bg-rose-100 text-rose-700 border-rose-200'
  },
  labor: {
    id: 'labor',
    needType: 'rescue',
    name: '勞動人力',
    icon: '👷',
    description: '搬運、清理、重建人力',
    color: 'bg-orange-100 text-orange-700 border-orange-200'
  },
  equipment: {
    id: 'equipment',
    needType: 'rescue',
    name: '專業設備',
    icon: '🚜',
    description: '挖土機、發電機、救護車',
    color: 'bg-gray-100 text-gray-700 border-gray-200'
  },
  professional: {
    id: 'professional',
    needType: 'rescue',
    name: '專業服務',
    icon: '👔',
    description: '心理諮商、法律諮詢、翻譯',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200'
  },
  transport: {
    id: 'transport',
    needType: 'rescue',
    name: '運輸服務',
    icon: '🚚',
    description: '物資運輸、人員接送',
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200'
  },
  other_rescue: {
    id: 'other_rescue',
    needType: 'rescue',
    name: '其他救災',
    icon: '🔧',
    description: '其他救災需求',
    color: 'bg-zinc-100 text-zinc-700 border-zinc-200'
  }
}

/**
 * 所有類別資訊
 */
export const ALL_CATEGORIES = {
  ...MATERIAL_CATEGORIES,
  ...RESCUE_CATEGORIES
}

/**
 * 嚴重程度資訊
 */
export const SEVERITY_INFO: Record<Severity, { name: string; color: string; bgColor: string; badge: string }> = {
  critical: {
    name: '極緊急',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    badge: 'bg-red-500 text-white'
  },
  high: {
    name: '高度',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200',
    badge: 'bg-orange-500 text-white'
  },
  medium: {
    name: '中度',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50 border-yellow-200',
    badge: 'bg-yellow-500 text-white'
  },
  low: {
    name: '低度',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    badge: 'bg-green-500 text-white'
  }
}

/**
 * 區域選項
 */
export const REGIONS = ['全部', '北部', '中部', '南部', '東部', '離島']

/**
 * 需求狀態資訊
 */
export const STATUS_INFO = {
  urgent: { name: '急需', color: 'text-red-600', badge: 'bg-red-100 text-red-700' },
  ongoing: { name: '長期募集', color: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
  fulfilled: { name: '已滿足', color: 'text-green-600', badge: 'bg-green-100 text-green-700' },
  closed: { name: '已關閉', color: 'text-gray-600', badge: 'bg-gray-100 text-gray-700' }
}

/**
 * 需求類型資訊
 */
export const NEED_TYPE_INFO = {
  material: {
    name: '物資需求',
    icon: '📦',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  rescue: {
    name: '救災需求',
    icon: '🚨',
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  }
}

/**
 * 災情類型資訊
 */
export const INCIDENT_TYPES = {
  '土石流': { icon: '🌊', color: 'bg-brown-100 text-brown-700' },
  '水災': { icon: '💧', color: 'bg-blue-100 text-blue-700' },
  '道路災害': { icon: '🚧', color: 'bg-orange-100 text-orange-700' },
  '橋樑災害': { icon: '🌉', color: 'bg-gray-100 text-gray-700' },
  '公共設施': { icon: '🏗️', color: 'bg-yellow-100 text-yellow-700' },
  '堰塞湖': { icon: '🏞️', color: 'bg-teal-100 text-teal-700' },
  '避難需求': { icon: '🏠', color: 'bg-green-100 text-green-700' },
  '其他': { icon: '⚠️', color: 'bg-slate-100 text-slate-700' }
} as const

/**
 * 災情嚴重程度資訊
 */
export const INCIDENT_SEVERITY_INFO = {
  5: { name: '極嚴重', color: 'text-red-700', bgColor: 'bg-red-50', badge: 'bg-red-500 text-white' },
  4: { name: '嚴重', color: 'text-orange-700', bgColor: 'bg-orange-50', badge: 'bg-orange-500 text-white' },
  3: { name: '中等', color: 'text-yellow-700', bgColor: 'bg-yellow-50', badge: 'bg-yellow-500 text-white' },
  2: { name: '輕微', color: 'text-blue-700', bgColor: 'bg-blue-50', badge: 'bg-blue-500 text-white' },
  1: { name: '極輕微', color: 'text-green-700', bgColor: 'bg-green-50', badge: 'bg-green-500 text-white' }
} as const

/**
 * 災情狀態資訊
 */
export const INCIDENT_STATUS_INFO = {
  'Occurring': { name: '發生中', color: 'text-red-600', badge: 'bg-red-100 text-red-700' },
  'Resolved': { name: '已解決', color: 'text-green-600', badge: 'bg-green-100 text-green-700' },
  'Under Investigation': { name: '調查中', color: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-700' }
} as const

/**
 * 審核狀態資訊
 */
export const REVIEW_STATUS_INFO = {
  'Verified': { name: '已驗證', color: 'text-green-600', badge: 'bg-green-100 text-green-700', icon: '✓' },
  'Pending': { name: '待審核', color: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  'Rejected': { name: '已拒絕', color: 'text-red-600', badge: 'bg-red-100 text-red-700', icon: '✗' }
} as const

/**
 * 物品類別資訊（基於 CSV 資料）
 */
export const ITEM_CATEGORIES = {
  '1': { name: '食物', icon: '🍚', color: 'bg-amber-100 text-amber-700' },
  '2': { name: '飲用水', icon: '💧', color: 'bg-blue-100 text-blue-700' },
  '3': { name: '醫療物資', icon: '💊', color: 'bg-red-100 text-red-700' },
  '4': { name: '衣物', icon: '👕', color: 'bg-purple-100 text-purple-700' },
  '5': { name: '住所物資', icon: '🏕️', color: 'bg-green-100 text-green-700' },
  '6': { name: '日用品', icon: '🧴', color: 'bg-teal-100 text-teal-700' },
  '7': { name: '通訊設備', icon: '📱', color: 'bg-indigo-100 text-indigo-700' },
  '8': { name: '照明設備', icon: '💡', color: 'bg-yellow-100 text-yellow-700' },
  '9': { name: '淨水設備', icon: '🚰', color: 'bg-cyan-100 text-cyan-700' },
  '10': { name: '工具', icon: '🔧', color: 'bg-gray-100 text-gray-700' }
} as const

/**
 * 借用狀態資訊
 */
export const LEND_STATUS_INFO = {
  ongoing: { name: '借用中', color: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
  returned: { name: '已歸還', color: 'text-green-600', badge: 'bg-green-100 text-green-700' },
  overdue: { name: '逾期', color: 'text-red-600', badge: 'bg-red-100 text-red-700' }
} as const

/**
 * 幣別選項
 */
export const CURRENCY_OPTIONS = ['TWD', 'USD', 'JPY', 'EUR', 'CNY'] as const

/**
 * 捐款用途選項
 */
export const DONATION_PURPOSES = [
  '救災物資採購',
  '避難所維護',
  '醫療設備',
  '重建工程',
  '志工補助',
  '行政管理',
  '其他'
] as const

/**
 * 花蓮縣鄉鎮市選項
 */
export const HUALIEN_AREAS = [
  '花蓮市', '鳳林鎮', '玉里鎮', '新城鄉', '吉安鄉',
  '壽豐鄉', '光復鄉', '豐濱鄉', '瑞穗鄉', '富里鄉',
  '秀林鄉', '萬榮鄉', '卓溪鄉'
] as const
