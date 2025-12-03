import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShelterData } from '../hooks/useShelterData'
import { ShelterCard } from '../components/ShelterCard'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import { useTheme } from '../context/ThemeContext'
import { HUALIEN_AREAS } from '../lib/constants'
import type { Shelter } from '../lib/types'

interface ShelterFilterOptions {
  area: string | 'all'
  availableOnly: boolean
  searchKeyword: string
}

export function ShelterListPage() {
  const { shelters, loading, error } = useShelterData()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  
  const [filters, setFilters] = useState<ShelterFilterOptions>({
    area: 'all',
    availableOnly: false,
    searchKeyword: ''
  })
  
  const [sortBy, setSortBy] = useState<'occupancy' | 'capacity' | 'name'>('occupancy')

  // 篩選避難所
  const filteredShelters = useMemo(() => {
    return shelters.filter(shelter => {
      // 地區篩選
      if (filters.area !== 'all' && !shelter.location.includes(filters.area)) {
        return false
      }
      
      // 只顯示有空位的避難所
      if (filters.availableOnly) {
        const occupancyRate = shelter.capacity > 0 
          ? (shelter.current_occupancy / shelter.capacity) * 100 
          : 100
        if (occupancyRate >= 90) return false
      }
      
      // 關鍵字搜尋
      if (filters.searchKeyword) {
        const keyword = filters.searchKeyword.toLowerCase()
        return (
          shelter.name.toLowerCase().includes(keyword) ||
          shelter.location.toLowerCase().includes(keyword) ||
          shelter.contact_phone.includes(keyword)
        )
      }
      
      return true
    })
  }, [shelters, filters])

  // 排序避難所
  const sortedShelters = useMemo(() => {
    const sorted = [...filteredShelters]
    
    switch (sortBy) {
      case 'occupancy':
        // 入住率：低到高（優先推薦有空位的）
        return sorted.sort((a, b) => {
          const rateA = a.capacity > 0 ? (a.current_occupancy / a.capacity) : 1
          const rateB = b.capacity > 0 ? (b.current_occupancy / b.capacity) : 1
          return rateA - rateB
        })
      
      case 'capacity':
        // 容量：大到小
        return sorted.sort((a, b) => b.capacity - a.capacity)
      
      case 'name':
        // 名稱：字母順序
        return sorted.sort((a, b) => a.name.localeCompare(b.name, 'zh-TW'))
      
      default:
        return sorted
    }
  }, [filteredShelters, sortBy])

  // 統計資訊
  const stats = useMemo(() => {
    const totalCapacity = shelters.reduce((sum, s) => sum + s.capacity, 0)
    const totalOccupancy = shelters.reduce((sum, s) => sum + s.current_occupancy, 0)
    const available = shelters.filter(s => {
      const rate = s.capacity > 0 ? (s.current_occupancy / s.capacity) * 100 : 100
      return rate < 90
    }).length
    const almostFull = shelters.filter(s => {
      const rate = s.capacity > 0 ? (s.current_occupancy / s.capacity) * 100 : 0
      return rate >= 90
    }).length
    
    return {
      total: shelters.length,
      available,
      almostFull,
      totalCapacity,
      totalOccupancy,
      overallOccupancyRate: totalCapacity > 0 
        ? ((totalOccupancy / totalCapacity) * 100).toFixed(1)
        : '0'
    }
  }, [shelters])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <header className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-primary dark:text-slate-100">🏠 避難所查詢</h1>
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
            <h1 className="text-2xl font-bold text-primary dark:text-slate-100">🏠 避難所查詢</h1>
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
              <p className="text-sm text-muted-foreground dark:text-slate-400">避難所查詢與安置</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {theme === 'dark' ? '🌞' : '🌙'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/volunteer')}>
                📋 需求配對
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/incidents')}>
                🚨 災情通報
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/inventory')}>
                📦 物資查詢
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/donations')}>
                💰 捐款
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                👤 個人
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 統計卡片 */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-800 dark:to-teal-800 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-sm opacity-90">避難所總數</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="text-3xl font-bold">{stats.available}</div>
              <div className="text-sm opacity-90">有空位</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="text-3xl font-bold">{stats.almostFull}</div>
              <div className="text-sm opacity-90">近滿</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="text-3xl font-bold">{stats.totalCapacity}</div>
              <div className="text-sm opacity-90">總容量</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="text-3xl font-bold">{stats.overallOccupancyRate}%</div>
              <div className="text-sm opacity-90">整體入住率</div>
            </div>
          </div>
        </div>
      </div>

      {/* 提示訊息 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <p className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                重要提醒
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• 前往避難所前請先致電確認是否有空位</li>
                <li>• 請攜帶個人身分證件、健保卡及必要物品</li>
                <li>• 如有特殊需求（如輪椅、嬰兒床等），請提前告知避難所</li>
                <li>• 顯示的入住人數為即時更新，僅供參考</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="container mx-auto px-4 py-6">
        {/* 快速篩選按鈕 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
            🎯 快速篩選
          </h2>
          <div className="flex gap-2 flex-wrap">
            <Badge
              className={`cursor-pointer px-4 py-2 ${
                !filters.availableOnly && filters.area === 'all'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200'
              }`}
              onClick={() => setFilters({ area: 'all', availableOnly: false, searchKeyword: '' })}
            >
              📋 全部避難所
            </Badge>
            <Badge
              className={`cursor-pointer px-4 py-2 ${
                filters.availableOnly
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200'
              }`}
              onClick={() => setFilters(prev => ({ ...prev, availableOnly: !prev.availableOnly }))}
            >
              ✅ 只顯示有空位
            </Badge>
          </div>
        </div>

        {/* 篩選與搜尋 */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 mb-6 border dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 搜尋 */}
            <div>
              <Input
                type="text"
                placeholder="🔍 搜尋避難所名稱、地點或電話..."
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
          </div>

          {/* 排序與結果數 */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-slate-700">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              找到 <span className="font-bold text-lg text-primary dark:text-blue-400 mx-1">{sortedShelters.length}</span> 個避難所
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">排序：</span>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'occupancy' | 'capacity' | 'name')}
                className="text-sm"
              >
                <option value="occupancy">📊 入住率優先（推薦）</option>
                <option value="capacity">👥 容量大小優先</option>
                <option value="name">🔤 名稱排序</option>
              </Select>
            </div>
          </div>
        </div>

        {/* 避難所列表 */}
        {sortedShelters.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-muted-foreground dark:text-slate-400">沒有符合條件的避難所</p>
            <p className="text-sm text-muted-foreground dark:text-slate-500 mt-2">試試調整篩選條件</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedShelters.map(shelter => (
              <ShelterCard
                key={shelter.shelter_id}
                name={shelter.name}
                location={shelter.location}
                capacity={shelter.capacity}
                current_occupancy={shelter.current_occupancy}
                contact_phone={shelter.contact_phone}
              />
            ))}
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="container mx-auto px-4 pb-8">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
            🆘 緊急求助
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            如遇緊急狀況無法前往避難所，請撥打 119 或 110 尋求協助。
            如需災情通報，請至 
            <button 
              onClick={() => navigate('/incidents/report')}
              className="mx-1 underline font-semibold hover:text-amber-900 dark:hover:text-amber-100"
            >
              災情通報頁面
            </button>
            進行通報。
          </p>
        </div>
      </div>
    </div>
  )
}

