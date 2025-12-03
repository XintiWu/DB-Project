import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInventoryData } from '../hooks/useInventoryData'
import { InventoryItemCard } from '../components/InventoryItemCard'
import { LendDialog } from '../components/LendDialog'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import { useTheme } from '../context/ThemeContext'
import { ITEM_CATEGORIES, HUALIEN_AREAS } from '../lib/constants'
import type { InventoryItem, InventoryFilterOptions } from '../lib/types'

export function InventoryPage() {
  const { items, loading, error, refetch } = useInventoryData()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  
  const [filters, setFilters] = useState<InventoryFilterOptions>({
    category: 'all',
    area: 'all',
    searchKeyword: '',
    availableOnly: true
  })
  
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'quantity'>('quantity')

  // 篩選物品
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filters.category !== 'all' && item.category_id !== filters.category) return false
      if (filters.area !== 'all' && !item.address.includes(filters.area)) return false
      if (filters.availableOnly && item.available_qty <= 0) return false
      if (filters.searchKeyword) {
        const keyword = filters.searchKeyword.toLowerCase()
        return (
          item.item_name.toLowerCase().includes(keyword) ||
          item.address.toLowerCase().includes(keyword)
        )
      }
      return true
    })
  }, [items, filters])

  // 排序物品
  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems]
    if (sortBy === 'quantity') {
      return sorted.sort((a, b) => b.available_qty - a.available_qty)
    } else {
      return sorted.sort((a, b) => a.item_name.localeCompare(b.item_name, 'zh-TW'))
    }
  }, [filteredItems, sortBy])

  // 統計資訊
  const stats = useMemo(() => {
    return {
      total: items.length,
      available: items.filter(i => i.available_qty > 0).length,
      categories: new Set(items.map(i => i.category_id)).size,
      locations: new Set(items.map(i => i.address)).size
    }
  }, [items])

  const handleLendSuccess = () => {
    refetch()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <header className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-primary dark:text-slate-100">📦 物資查詢</h1>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-slate-600 dark:text-slate-400">載入中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <header className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-primary dark:text-slate-100">📦 物資查詢</h1>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-4xl mb-4">❌</div>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 sticky top-0 z-40 backdrop-blur-lg bg-opacity-95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="cursor-pointer" onClick={() => navigate('/')}>
              <h1 className="text-2xl font-bold text-primary dark:text-slate-100">🚨 救災資源配對平台</h1>
              <p className="text-sm text-muted-foreground dark:text-slate-400">物資查詢與借用</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {theme === 'dark' ? '🌞' : '🌙'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/volunteer')}>
                📋 需求配對
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/incidents')}>
                🚨 災情
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/shelters')}>
                🏠 避難所
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/donations')}>
                💰 捐款
              </Button>
              <Button variant="outline" onClick={() => navigate('/profile/lends')}>
                📝 我的借用
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 統計卡片 */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-800 dark:to-cyan-800 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-sm opacity-90">物品總數</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="text-3xl font-bold">{stats.available}</div>
              <div className="text-sm opacity-90">可借用</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="text-3xl font-bold">{stats.categories}</div>
              <div className="text-sm opacity-90">物品類別</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="text-3xl font-bold">{stats.locations}</div>
              <div className="text-sm opacity-90">倉庫地點</div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="container mx-auto px-4 py-6">
        {/* 類別快速篩選 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
            📂 物品類別
          </h2>
          <div className="flex gap-2 flex-wrap">
            <Badge
              className={`cursor-pointer px-4 py-2 ${
                filters.category === 'all'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200'
              }`}
              onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}
            >
              全部
            </Badge>
            {Object.entries(ITEM_CATEGORIES).map(([id, info]) => {
              const count = items.filter(i => i.category_id === id).length
              return (
                <Badge
                  key={id}
                  className={`cursor-pointer px-4 py-2 ${
                    filters.category === id
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200'
                  }`}
                  onClick={() => setFilters(prev => ({ ...prev, category: id }))}
                >
                  {info.icon} {info.name} ({count})
                </Badge>
              )
            })}
          </div>
        </div>

        {/* 篩選與搜尋 */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 mb-6 border dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 搜尋 */}
            <div>
              <Input
                type="text"
                placeholder="🔍 搜尋物品名稱或地點..."
                value={filters.searchKeyword}
                onChange={(e) => setFilters(prev => ({ ...prev, searchKeyword: e.target.value }))}
              />
            </div>

            {/* 地區 */}
            <Select
              value={filters.area}
              onChange={(e) => setFilters(prev => ({ ...prev, area: e.target.value }))}
            >
              <option value="all">所有地區</option>
              {HUALIEN_AREAS.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </Select>

            {/* 只顯示有庫存 */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="availableOnly"
                checked={filters.availableOnly}
                onChange={(e) => setFilters(prev => ({ ...prev, availableOnly: e.target.checked }))}
                className="w-4 h-4"
              />
              <label htmlFor="availableOnly" className="text-sm text-slate-700 dark:text-slate-300">
                只顯示有庫存的物品
              </label>
            </div>
          </div>

          {/* 排序與結果數 */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-slate-700">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              找到 <span className="font-bold text-lg text-primary dark:text-blue-400 mx-1">{sortedItems.length}</span> 項物品
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">排序：</span>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'quantity')}
                className="text-sm"
              >
                <option value="quantity">📊 庫存數量優先</option>
                <option value="name">🔤 名稱排序</option>
              </Select>
            </div>
          </div>
        </div>

        {/* 物品列表 */}
        {sortedItems.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-muted-foreground dark:text-slate-400">沒有符合條件的物品</p>
            <p className="text-sm text-muted-foreground dark:text-slate-500 mt-2">試試調整篩選條件</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedItems.map(item => (
              <InventoryItemCard
                key={`${item.item_id}-${item.inventory_id}`}
                item={item}
                onLend={setSelectedItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* 借用對話框 */}
      {selectedItem && (
        <LendDialog
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSuccess={handleLendSuccess}
        />
      )}
    </div>
  )
}

