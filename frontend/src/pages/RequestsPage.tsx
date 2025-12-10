import { useState, useEffect } from 'react'
import { useNeedData } from '../hooks/useNeedData'
import { getAllAreas } from '../api/client'
import { NeedCard } from '../components/NeedCard'
import { ClaimDialog } from '../components/ClaimDialog'
import type { Need } from '../lib/types'
import { Input } from '../components/ui/input'
import { Search, Filter } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'

import { useLocation } from 'react-router-dom'

export function RequestsPage() {
  const { needs, loading, error, filters, setFilters, page, setPage, totalPages } = useNeedData(24)
  console.log('RequestsPage render:', { needs: needs.length, loading, error, filters })
  const [selectedNeed, setSelectedNeed] = useState<Need | null>(null)
  const location = useLocation()

  // Handle navigation from Incident Modal
  useEffect(() => {
    if (location.state) {
      const { incidentId, type } = location.state as { incidentId?: string, type?: string }
      if (incidentId) {
        setFilters(prev => ({ ...prev, incidentId }))
      }
      if (type) {
        // Need to cast or validate type if it comes from location state which might be lowercase
        // But let's assume valid types are pushed. Or map lowercase to Capitalized.
        const mappedType = type === 'material' ? 'Material' : type === 'tool' ? 'Tool' : type === 'manpower' ? 'Humanpower' : type;
        setFilters(prev => ({ ...prev, type: mappedType as any }))
      }
      // Clear state to avoid persistent filter on refresh/re-nav (optional, but good practice)
      window.history.replaceState({}, document.title)
    }
  }, [location.state, setFilters])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedNeed) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedNeed])
  
  // Filter logic - Managed by Backend
  const filteredNeeds = needs

  // Search Debounce
  const [searchTerm, setSearchTerm] = useState(filters.keyword)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, keyword: searchTerm }))
      
      if (searchTerm) {
        import('../api/client').then(({ logSearch }) => {
            logSearch({
                keyword: searchTerm,
                filters: { type: 'Request' },
                results_count: 0 // Ideally we'd know this, but it's async from useNeedData
            }).catch(console.error);
        });
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, setFilters])

  // Area Hierarchy State
  const [areaHierarchy, setAreaHierarchy] = useState<Record<string, { id: string, name: string }[]>>({});

  useEffect(() => {
    async function fetchAreas() {
      try {
        const res = await getAllAreas();
        // Process areas: Group by City (first 3 chars)
        const hierarchy: Record<string, { id: string, name: string }[]> = {};
        res.forEach((area: any) => {
          const city = area.area_name.substring(0, 3);
          if (!hierarchy[city]) {
            hierarchy[city] = [];
          }
          hierarchy[city].push({ id: area.area_id, name: area.area_name });
        });
        setAreaHierarchy(hierarchy);
      } catch (err) {
        console.error('Failed to fetch areas:', err);
      }
    }
    fetchAreas();
  }, []);

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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="space-y-4">
        <div className="flex border-b overflow-x-auto">
          <button
            className={`pb-2 px-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
              filters.type === 'Material'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setFilters(prev => ({ ...prev, type: 'Material' }))}
          >
            物資需求
          </button>
          <button
            className={`pb-2 px-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
              filters.type === 'Tool'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setFilters(prev => ({ ...prev, type: 'Tool' }))}
          >
            工具需求
          </button>
          <button
            className={`pb-2 px-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
              filters.type === 'Humanpower'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setFilters(prev => ({ ...prev, type: 'Humanpower' }))}
          >
            人力需求
          </button>
        </div>

        {/* Hierarchical Area Filter */}
        <div className="flex flex-col sm:flex-row gap-2 p-4 bg-white rounded-lg border shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mr-2">
            <Filter className="h-4 w-4" />
            地區：
          </div>
          
          {/* City Dropdown */}
          <select 
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-32"
            value={filters.city || ''}
            onChange={(e) => {
              const newCity = e.target.value;
              setFilters(prev => ({ 
                ...prev, 
                city: newCity, 
                district: '', // Reset district when city changes
                area_name: newCity ? newCity : '', // Search by City name if no district
              }));
            }}
          >
            <option value="">全部縣市</option>
            {Object.keys(areaHierarchy).map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          {/* District Dropdown */}
          <select 
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-32"
            value={filters.district || ''}
            disabled={!filters.city}
            onChange={(e) => {
               const areaId = e.target.value;
               setFilters(prev => ({ 
                 ...prev, 
                 district: areaId,
                 area_name: '' // Clear area_name search if precise ID is selected
               }));
            }}
          >
            <option value="">全部區域</option>
            {filters.city && areaHierarchy[filters.city]?.map(area => (
              <option key={area.id} value={area.id}>{area.name.replace(filters.city, '')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredNeeds.map(need => (
          <NeedCard 
            key={need.id} 
            need={need} 
            onClick={() => setSelectedNeed(need)} 
            layoutId={`need-${need.id}`}
            isSelected={selectedNeed?.id === need.id}
          />
        ))}
      </div>

      {filteredNeeds.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          沒有符合條件的需求
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 text-sm font-medium rounded-md bg-white border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一頁
        </button>
        <span className="text-sm font-medium text-slate-600">
            第 {page} 頁 / 共 {totalPages} 頁
        </span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-4 py-2 text-sm font-medium rounded-md bg-white border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一頁
        </button>
      </div>

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
