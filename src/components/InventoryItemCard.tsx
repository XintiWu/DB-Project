import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import type { InventoryItem } from '../lib/types'
import { ITEM_CATEGORIES } from '../lib/constants'

interface InventoryItemCardProps {
  item: InventoryItem
  onLend?: (item: InventoryItem) => void
}

export function InventoryItemCard({ item, onLend }: InventoryItemCardProps) {
  const categoryInfo = ITEM_CATEGORIES[item.category_id as keyof typeof ITEM_CATEGORIES] || {
    name: '其他',
    icon: '📦',
    color: 'bg-slate-100 text-slate-700'
  }

  const isAvailable = item.available_qty > 0
  const stockLevel = item.available_qty <= 5 ? 'low' : item.available_qty <= 20 ? 'medium' : 'high'

  const getStockColor = () => {
    if (!isAvailable) return 'text-red-600 dark:text-red-400'
    if (stockLevel === 'low') return 'text-orange-600 dark:text-orange-400'
    if (stockLevel === 'medium') return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-slate-700">
      {/* 物品名稱與類別 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{categoryInfo.icon}</span>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {item.item_name}
            </h3>
          </div>
          <Badge className={`${categoryInfo.color} border`}>
            {categoryInfo.name}
          </Badge>
        </div>
      </div>

      {/* 庫存數量 */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-400">可借數量</span>
          <div className={`text-2xl font-bold ${getStockColor()}`}>
            {item.available_qty}
            <span className="text-sm ml-1">{item.unit}</span>
          </div>
        </div>
        
        {/* 庫存狀態指示 */}
        <div className="mt-2">
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                !isAvailable ? 'bg-red-500' :
                stockLevel === 'low' ? 'bg-orange-500' :
                stockLevel === 'medium' ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, (item.available_qty / 50) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>
              {!isAvailable ? '無庫存' : 
               stockLevel === 'low' ? '庫存不足' :
               stockLevel === 'medium' ? '庫存中等' :
               '庫存充足'}
            </span>
          </div>
        </div>
      </div>

      {/* 倉庫位置 */}
      <div className="mb-3">
        <div className="flex items-start gap-2 text-sm">
          <span className="text-slate-600 dark:text-slate-400">📍</span>
          <div className="text-slate-600 dark:text-slate-400">
            {item.address}
          </div>
        </div>
        <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-500 mt-1">
          <span>🏢</span>
          <div>
            倉庫編號：{item.inventory_id}
          </div>
        </div>
      </div>

      {/* 借用按鈕 */}
      <div className="pt-3 border-t dark:border-slate-700">
        <Button
          onClick={() => onLend?.(item)}
          disabled={!isAvailable}
          className="w-full"
          variant={isAvailable ? 'default' : 'outline'}
        >
          {isAvailable ? '🛒 我要借用' : '❌ 暫無庫存'}
        </Button>
      </div>
    </Card>
  )
}

