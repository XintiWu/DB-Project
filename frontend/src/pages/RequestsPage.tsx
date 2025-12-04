import { useState, useEffect } from 'react'
import { useNeedData } from '../hooks/useNeedData'
import { NeedCard } from '../components/NeedCard'
import { ClaimDialog } from '../components/ClaimDialog'
import type { Need } from '../lib/types'
import { Input } from '../components/ui/input'
import { Search, Filter } from 'lucide-react'
import { REGIONS } from '../lib/constants'
import { AnimatePresence } from 'framer-motion'

import { useLocation } from 'react-router-dom'

export function RequestsPage() {
  const { needs, loading, error, filters, setFilters } = useNeedData()
  console.log('RequestsPage render:', { needs: needs.length, loading, error, filters })
  const [selectedNeed, setSelectedNeed] = useState<Need | null>(null)
  const location = useLocation()

  // Handle navigation from Incident Modal
  useEffect(() => {
    if (location.state) {
      const { incidentId, type } = location.state as { incidentId?: string, type?: 'material' | 'rescue' }
      if (incidentId) {
        setFilters(prev => ({ ...prev, incidentId }))
      }
      if (type) {
        setFilters(prev => ({ ...prev, type }))
      }
      // Clear state to avoid persistent filter on refresh/re-nav (optional, but good practice)
      window.history.replaceState({}, document.title)
    }
  }, [location.state, setFilters])
  
  // Filter logic
  const filteredNeeds = needs.filter(need => {
    // 1. Filter by Type (Tab)
    if (filters.type !== 'all' && need.needType !== filters.type) return false
    
    // 2. Filter by Keyword
    if (filters.keyword && !need.title.includes(filters.keyword) && !need.itemName.includes(filters.keyword)) return false
    
    // 3. Filter by Region
    if (filters.region !== '全部' && need.region !== filters.region) return false
    
    // 4. Filter by Incident ID (if set)
    if (filters.incidentId && (need as any).incidentId !== filters.incidentId) return false

    return true
  })

  if (loading) return <div className="text-center py-12">載入中...</div>
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">需求列表</h1>
          <p className="text-muted-foreground mt-2">
            瀏覽並認領各地的物資與救援需求。
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜尋需求..."
              className="pl-9"
              value={filters.keyword}
              onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="space-y-4">
        <div className="flex border-b overflow-x-auto">
          <button
            className={`pb-2 px-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
              filters.type === 'material'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setFilters(prev => ({ ...prev, type: 'material' }))}
          >
            物資需求
          </button>
          <button
            className={`pb-2 px-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
              filters.type === 'tool'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setFilters(prev => ({ ...prev, type: 'tool' }))}
          >
            工具需求
          </button>
          <button
            className={`pb-2 px-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
              filters.type === 'manpower'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setFilters(prev => ({ ...prev, type: 'manpower' }))}
          >
            人力需求
          </button>
        </div>

        {/* Region Filter */}
        <div className="flex items-center gap-2 p-4 bg-white rounded-lg border shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mr-2">
            <Filter className="h-4 w-4" />
            地區篩選：
          </div>
          
          <select 
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={filters.region}
            onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
          >
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNeeds.map(need => (
          <NeedCard 
            key={need.id} 
            need={need} 
            onClick={() => setSelectedNeed(need)} 
          />
        ))}
      </div>

      {filteredNeeds.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          沒有符合條件的需求
        </div>
      )}

      <AnimatePresence>
        {selectedNeed && (
          <ClaimDialog 
            need={selectedNeed} 
            onClose={() => setSelectedNeed(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}
