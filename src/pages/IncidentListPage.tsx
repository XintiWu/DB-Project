import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIncidentData } from '../hooks/useIncidentData'
import { IncidentCard } from '../components/IncidentCard'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { useTheme } from '../context/ThemeContext'
import { INCIDENT_TYPES, HUALIEN_AREAS, INCIDENT_STATUS_INFO } from '../lib/constants'
import type { IncidentFilterOptions } from '../lib/types'

export function IncidentListPage() {
  const { incidents, loading, error } = useIncidentData()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  
  const [filters, setFilters] = useState<IncidentFilterOptions>({
    type: 'all',
    severity: 'all',
    status: 'all',
    area: 'all',
    searchKeyword: ''
  })
  
  const [sortBy, setSortBy] = useState<'severity' | 'time'>('severity')

  // 篩選災情
  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      if (filters.type !== 'all' && incident.type !== filters.type) return false
      if (filters.severity !== 'all' && incident.severity !== filters.severity) return false
      if (filters.status !== 'all' && incident.status !== filters.status) return false
      if (filters.area !== 'all' && !incident.area_id.includes(filters.area)) return false
      if (filters.searchKeyword) {
        const keyword = filters.searchKeyword.toLowerCase()
        return (
          incident.title.toLowerCase().includes(keyword) ||
          incident.msg.toLowerCase().includes(keyword) ||
          incident.address.toLowerCase().includes(keyword)
        )
      }
      return true
    })
  }, [incidents, filters])

  // 排序災情
  const sortedIncidents = useMemo(() => {
    const sorted = [...filteredIncidents]
    if (sortBy === 'severity') {
      return sorted.sort((a, b) => b.severity - a.severity)
    } else {
      return sorted.sort((a, b) => 
        new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime()
      )
    }
  }, [filteredIncidents, sortBy])

  // 統計資訊
  const stats = useMemo(() => {
    return {
      total: incidents.length,
      occurring: incidents.filter(i => i.status === 'Occurring').length,
      resolved: incidents.filter(i => i.status === 'Resolved').length,
      highSeverity: incidents.filter(i => i.severity >= 4).length
    }
  }, [incidents])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <header className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-primary dark:text-slate-100">🚨 災情通報</h1>
            </div>
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
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-primary dark:text-slate-100">🚨 災情通報</h1>
            </div>
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
              <p className="text-sm text-muted-foreground dark:text-slate-400">災情通報與查詢</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {theme === 'dark' ? '🌞' : '🌙'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/volunteer')}>
                📋 需求配對
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/inventory')}>
                📦 物資
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/shelters')}>
                🏠 避難所
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/donations')}>
                💰 捐款
              </Button>
              <Button onClick={() => navigate('/incidents/report')}>
                ➕ 通報災情
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 統計卡片 */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-800 dark:to-orange-800 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-sm opacity-90">總災情數</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="text-3xl font-bold">{stats.occurring}</div>
              <div className="text-sm opacity-90">發生中</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="text-3xl font-bold">{stats.resolved}</div>
              <div className="text-sm opacity-90">已解決</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="text-3xl font-bold">{stats.highSeverity}</div>
              <div className="text-sm opacity-90">高危險</div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="container mx-auto px-4 py-6">
        {/* 篩選與搜尋 */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 mb-6 border dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 搜尋 */}
            <div className="lg:col-span-2">
              <Input
                type="text"
                placeholder="🔍 搜尋災情標題、地點、描述..."
                value={filters.searchKeyword}
                onChange={(e) => setFilters(prev => ({ ...prev, searchKeyword: e.target.value }))}
              />
            </div>

            {/* 災情類型 */}
            <Select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="all">所有類型</option>
              {Object.keys(INCIDENT_TYPES).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>

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

            {/* 狀態 */}
            <Select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
            >
              <option value="all">所有狀態</option>
              {Object.entries(INCIDENT_STATUS_INFO).map(([key, value]) => (
                <option key={key} value={key}>{value.name}</option>
              ))}
            </Select>
          </div>

          {/* 排序與結果數 */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-slate-700">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              找到 <span className="font-bold text-lg text-primary dark:text-blue-400 mx-1">{sortedIncidents.length}</span> 筆災情
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">排序：</span>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'severity' | 'time')}
                className="text-sm"
              >
                <option value="severity">🚨 嚴重程度優先</option>
                <option value="time">⏰ 最新通報優先</option>
              </Select>
            </div>
          </div>
        </div>

        {/* 災情列表 */}
        {sortedIncidents.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-muted-foreground dark:text-slate-400">沒有符合條件的災情</p>
            <p className="text-sm text-muted-foreground dark:text-slate-500 mt-2">試試調整篩選條件</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedIncidents.map(incident => (
              <IncidentCard key={incident.incident_id} incident={incident} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

