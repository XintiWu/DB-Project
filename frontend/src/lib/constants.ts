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
export const REGIONS = [
  '全部',
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
