import { useState, useMemo, useRef, useEffect } from 'react'
import { useNeedData } from '../hooks/useNeedData'
import { useSearchParams } from 'react-router-dom'
import type { FilterOptions, Need, NeedType } from '../lib/types'
import { NeedCardEnhanced } from '../components/NeedCardEnhanced'
import { FilterPanel } from '../components/FilterPanel'
import { ClaimListSidebar } from '../components/ClaimListSidebar'
import { ClaimDialog } from '../components/ClaimDialog'
import { HeroSection } from '../components/HeroSection'
import { EnhancedStatsOverview } from '../components/EnhancedStatsOverview'
import { MiniStatsBar } from '../components/MiniStatsBar'
import { CategoryNav } from '../components/CategoryNav'
import { SkeletonList } from '../components/SkeletonCard'
import { HomeDashboard } from '../components/HomeDashboard'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Select } from '../components/ui/select'
import { useNavigate } from 'react-router-dom'
import { useClaimContext } from '../context/ClaimContext'
import { useTheme } from '../context/ThemeContext'
import { ALL_CATEGORIES, SEVERITY_INFO } from '../lib/constants'

type SortOption = 'default' | 'urgent' | 'deadline' | 'progress' | 'newest'

export function VolunteerPage() {
  const { needs, loading, error } = useNeedData()
  const { getTotalItems } = useClaimContext()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const needsListRef = useRef<HTMLDivElement>(null)
  
  const [selectedNeedType, setSelectedNeedType] = useState<NeedType | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('urgent')
  const [filters, setFilters] = useState<FilterOptions>({
    needType: 'all',
    region: 'all',
    category: 'all',
    severity: 'all',
    status: 'all',
    searchKeyword: ''
  })
  const [selectedNeed, setSelectedNeed] = useState<Need | null>(null)
  const [showHero, setShowHero] = useState(false) // 志工頁不顯示 Hero

  // 處理從首頁傳來的 URL 參數
  useEffect(() => {
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const needType = searchParams.get('needType')

    if (category || status || needType) {
      setFilters(prev => ({
        ...prev,
        ...(category && { category }),
        ...(status && { status }),
        ...(needType && { needType })
      }))

      if (needType) {
        setSelectedNeedType(needType as NeedType | 'all')
      }
    }
  }, [searchParams])

  // 滾動到需求列表
  const scrollToNeeds = () => {
    setShowHero(false)
    // 移除自動滾動，讓頁面停留在頂部
  }

  // 從儀表板跳轉到需求列表並設置篩選條件
  const handleDashboardNavigate = (filter?: {
    category?: string
    severity?: string
    needType?: string
    status?: string
  }) => {
    setShowHero(false)
    
    // 設置篩選條件
    if (filter) {
      setFilters(prev => ({
        ...prev,
        ...(filter.category && { category: filter.category }),
        ...(filter.severity && { severity: filter.severity }),
        ...(filter.needType && { needType: filter.needType }),
        ...(filter.status && { status: filter.status })
      }))
      
      // 設置需求類型
      if (filter.needType) {
        setSelectedNeedType(filter.needType)
      }
    }
    
    // 滾動到需求列表
    setTimeout(() => {
      needsListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  // 篩選需求
  const filteredNeeds = useMemo(() => {
    return needs.filter(need => {
      if (selectedNeedType !== 'all' && need.needType !== selectedNeedType) {
        return false
      }
      if (filters.needType !== 'all' && need.needType !== filters.needType) {
        return false
      }
      if (filters.region !== 'all' && need.region !== filters.region) {
        return false
      }
      if (filters.category !== 'all' && need.category !== filters.category) {
        return false
      }
      if (filters.severity !== 'all' && need.severity !== filters.severity) {
        return false
      }
      if (filters.status !== 'all' && need.status !== filters.status) {
        return false
      }
      if (filters.searchKeyword) {
        const keyword = filters.searchKeyword.toLowerCase()
        return (
          need.title.toLowerCase().includes(keyword) ||
          need.location.toLowerCase().includes(keyword) ||
          need.description.toLowerCase().includes(keyword) ||
          need.itemName.toLowerCase().includes(keyword)
        )
      }
      return true
    })
  }, [needs, selectedNeedType, filters])

  // 排序需求
  const sortedNeeds = useMemo(() => {
    const sorted = [...filteredNeeds]
    
    switch (sortBy) {
      case 'urgent':
        // 緊急程度：critical > high > medium > low
        return sorted.sort((a, b) => {
          const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
          return severityOrder[a.severity] - severityOrder[b.severity]
        })
      
      case 'deadline':
        // 截止時間：近到遠
        return sorted.sort((a, b) => 
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        )
      
      case 'progress':
        // 認領進度：低到高
        return sorted.sort((a, b) => {
          const progressA = (a.currentQuantity / a.requiredQuantity) * 100
          const progressB = (b.currentQuantity / b.requiredQuantity) * 100
          return progressA - progressB
        })
      
      case 'newest':
        // 發布時間：新到舊
        return sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      
      default:
        // 預設也是緊急程度優先
        return sorted.sort((a, b) => {
          const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
          return severityOrder[a.severity] - severityOrder[b.severity]
        })
    }
  }, [filteredNeeds, sortBy])

  const handleClaim = (need: Need) => {
    setSelectedNeed(need)
  }

  // 計算分類數量
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    needs.forEach(need => {
      counts[need.category] = (counts[need.category] || 0) + 1
    })
    return counts
  }, [needs])

  // 處理分類選擇
  const handleCategorySelect = (category: string) => {
    setShowHero(false)
    // 如果點擊的是當前已選中的分類，則跳回全部
    if (filters.category === category) {
      setFilters(prev => ({ ...prev, category: 'all' }))
    } else {
      setFilters(prev => ({ ...prev, category }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <header className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-primary dark:text-slate-100">🚨 救災資源配對平台</h1>
                <p className="text-sm text-muted-foreground dark:text-slate-400">載入中...</p>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1"></div>
            <div className="lg:col-span-2">
              <SkeletonList count={5} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-slate-900">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-destructive dark:text-red-400">{error}</p>
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
              <p className="text-sm text-muted-foreground dark:text-slate-400">連結需求與資源，共同度過難關</p>
            </div>
            <div className="flex items-center gap-2">
              {/* 暗黑模式切換 */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleTheme}
              >
                {theme === 'dark' ? '🌞' : '🌙'}
              </Button>
              
              <Button variant="outline" onClick={() => navigate('/publish')}>
                ➕ 發布需求
              </Button>
              {getTotalItems() > 0 && (
                <Button onClick={() => navigate('/claim/confirm')}>
                  🛒 認領清單 ({getTotalItems()})
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - 首次進入顯示 */}
      {showHero && (
        <>
          <HeroSection 
            onGetStarted={scrollToNeeds}
            onPublish={() => navigate('/publish')}
          />
          {/* 救災進度總覽儀表板 */}
          <HomeDashboard 
            needs={needs} 
            onNavigateToNeeds={handleDashboardNavigate}
          />
        </>
      )}

      {/* 統計儀表板 - 點擊開始後顯示完整版 */}
      {!showHero && (
        <EnhancedStatsOverview needs={needs} />
      )}

      {/* 需求類型切換 - 更明顯 */}
      {!showHero && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 border-b border-blue-700 py-4 shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="text-white font-semibold text-lg mr-2 drop-shadow-md">🔍 瀏覽需求類型：</span>
              <Button
                variant="outline"
                onClick={() => setSelectedNeedType('all')}
                size="lg"
                className={selectedNeedType === 'all' 
                  ? 'bg-white text-blue-600 hover:bg-gray-100 font-bold shadow-lg' 
                  : 'border-2 border-white text-white hover:bg-white/20 font-bold drop-shadow-md bg-transparent'}
              >
                <span className="text-xl mr-2">📋</span>
                全部需求
                <Badge variant="secondary" className="ml-2 text-base px-2">
                  {needs.length}
                </Badge>
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedNeedType('material')}
                size="lg"
                className={selectedNeedType === 'material'
                  ? 'bg-white text-blue-600 hover:bg-gray-100 font-bold shadow-lg'
                  : 'border-2 border-white text-white hover:bg-white/20 font-bold drop-shadow-md bg-transparent'}
              >
                <span className="text-xl mr-2">📦</span>
                物資需求
                <Badge variant="secondary" className="ml-2 text-base px-2">
                  {needs.filter(n => n.needType === 'material').length}
                </Badge>
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedNeedType('rescue')}
                size="lg"
                className={selectedNeedType === 'rescue'
                  ? 'bg-white text-blue-600 hover:bg-gray-100 font-bold shadow-lg'
                  : 'border-2 border-white text-white hover:bg-white/20 font-bold drop-shadow-md bg-transparent'}
              >
                <span className="text-xl mr-2">🚨</span>
                救災需求
                <Badge variant="secondary" className="ml-2 text-base px-2">
                  {needs.filter(n => n.needType === 'rescue').length}
                </Badge>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 分類導航 - 調整位置避免遮擋 */}
      {!showHero && (
        <div className="relative">
          <CategoryNav 
            onCategorySelect={handleCategorySelect}
            currentCategory={filters.category}
            categoryCounts={categoryCounts}
            selectedNeedType={selectedNeedType}
          />
        </div>
      )}

      {/* 當前篩選狀態顯示 */}
      {!showHero && (filters.status !== 'all' || filters.region !== 'all' || filters.severity !== 'all') && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-amber-800 dark:text-amber-200">
                目前篩選條件：
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setFilters({
                    needType: 'all',
                    region: 'all',
                    category: 'all',
                    severity: 'all',
                    status: 'all',
                    searchKeyword: ''
                  })
                  setSelectedNeedType('all')
                }}
                className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
              >
                清除所有篩選
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {/* 需求類型標籤 */}
              {selectedNeedType !== 'all' && (
                <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-800/30 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    {selectedNeedType === 'material' ? '📦 物資需求' : '🚨 救災需求'}
                  </span>
                  <button
                    onClick={() => setSelectedNeedType('all')}
                    className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {/* 狀態標籤 */}
              {filters.status !== 'all' && (
                <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-800/30 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    {filters.status === 'urgent' ? '🚨 緊急需求' : 
                     filters.status === 'ongoing' ? '⏳ 募集中' : 
                     filters.status === 'fulfilled' ? '✅ 已滿足' : filters.status}
                  </span>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
                    className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {/* 分類標籤 */}
              {filters.category !== 'all' && (
                <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-800/30 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    {ALL_CATEGORIES[filters.category]?.name || filters.category}
                  </span>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}
                    className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {/* 地區標籤 */}
              {filters.region !== 'all' && (
                <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-800/30 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    📍 {filters.region}
                  </span>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, region: 'all' }))}
                    className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {/* 緊急程度標籤 */}
              {filters.severity !== 'all' && (
                <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-800/30 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    {SEVERITY_INFO[filters.severity]?.name || filters.severity}
                  </span>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, severity: 'all' }))}
                    className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-3 text-sm text-amber-700 dark:text-amber-300">
              點擊 ✕ 可移除單一篩選條件，或點擊「清除所有篩選」重置
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6" ref={needsListRef}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 篩選面板 */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <FilterPanel filters={filters} onFilterChange={setFilters} />
            </div>
          </div>

          {/* 需求列表 */}
          <div className="lg:col-span-2">
            {/* 排序與結果數 */}
            <div className="mb-4">

              <div className="flex items-center justify-between gap-4 flex-wrap bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700">
                <p className="text-sm font-medium dark:text-slate-200">
                  找到 <span className="text-2xl font-bold text-primary dark:text-blue-400 mx-1">{sortedNeeds.length}</span> 個需求
                </p>
                
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700 px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium dark:text-slate-200 whitespace-nowrap">排序：</span>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="text-sm font-medium min-w-[160px]"
                  >
                    <option value="urgent">🚨 緊急程度優先</option>
                    <option value="deadline">📅 截止時間優先</option>
                    <option value="progress">📊 認領進度優先</option>
                    <option value="newest">🆕 最新發布優先</option>
                  </Select>
                </div>
              </div>
            </div>
            
            {sortedNeeds.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-muted-foreground dark:text-slate-400">沒有符合條件的需求</p>
                <p className="text-sm text-muted-foreground dark:text-slate-500 mt-2">試試調整篩選條件</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedNeeds.map(need => (
                  <NeedCardEnhanced key={need.id} need={need} onClaim={handleClaim} />
                ))}
              </div>
            )}
          </div>

          {/* 認領清單側邊欄 */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ClaimListSidebar />
            </div>
          </div>
        </div>
      </div>

      {/* 認領對話框 */}
      {selectedNeed && (
        <ClaimDialog
          need={selectedNeed}
          onClose={() => setSelectedNeed(null)}
        />
      )}
    </div>
  )
}

