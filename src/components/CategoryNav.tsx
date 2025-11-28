import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { MATERIAL_CATEGORIES, RESCUE_CATEGORIES } from '../lib/constants'
import type { NeedType } from '../lib/types'

interface CategoryNavProps {
  onCategorySelect: (category: string) => void
  currentCategory: string
  categoryCounts: Record<string, number>
  selectedNeedType: NeedType | 'all'
}

export function CategoryNav({ onCategorySelect, currentCategory, categoryCounts, selectedNeedType }: CategoryNavProps) {
  // 根據選擇的需求類型來決定顯示哪些分類
  const availableCategories = selectedNeedType === 'material' 
    ? Object.values(MATERIAL_CATEGORIES)
    : selectedNeedType === 'rescue'
    ? Object.values(RESCUE_CATEGORIES)
    : [...Object.values(MATERIAL_CATEGORIES), ...Object.values(RESCUE_CATEGORIES)]

  return (
    <div className="bg-white dark:bg-slate-800 border-y dark:border-slate-700 py-3 sticky top-[140px] z-20 backdrop-blur-lg bg-opacity-95">
      <div className="container mx-auto px-4">
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-muted-foreground dark:text-slate-400 mb-1 flex items-center gap-2">
            <span>📂</span>
            <span>快速分類瀏覽</span>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
              {selectedNeedType === 'material' ? '物資分類' : 
               selectedNeedType === 'rescue' ? '救災分類' : 
               '全部分類'}
            </span>
          </h3>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <Button
            variant={currentCategory === 'all' ? 'default' : 'outline'}
            onClick={() => onCategorySelect('all')}
            className="flex-shrink-0"
            size="sm"
          >
            <span className="mr-2">🔍</span>
            全部分類
            <Badge variant="secondary" className="ml-2">
              {availableCategories.reduce((sum, cat) => sum + (categoryCounts[cat.id] || 0), 0)}
            </Badge>
          </Button>

          {availableCategories.map(category => (
            <Button
              key={category.id}
              variant={currentCategory === category.id ? 'default' : 'outline'}
              onClick={() => onCategorySelect(category.id)}
              className="flex-shrink-0"
              size="sm"
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
              {categoryCounts[category.id] > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {categoryCounts[category.id]}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

