import { useState, useEffect } from 'react'
import { getAllShelters, getNearbyShelters, logSearch } from '../api/client'
import type { Shelter } from '../lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { MapPin, Phone, Home, Users, Search, Navigation } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../components/ui/button'

export function SheltersPage() {
  const [shelters, setShelters] = useState<Shelter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination & Search
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isNearbyMode, setIsNearbyMode] = useState(false)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
        setDebouncedSearch(searchQuery)
        if (searchQuery) setIsNearbyMode(false)
        setPage(1) // Reset to page 1 on search
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    if (isNearbyMode) return // Skip normal fetch if in nearby mode

    async function fetchData() {
      setLoading(true)
      try {
        const response: any = await getAllShelters({ 
            page, 
            limit: 12,
            keyword: debouncedSearch 
        })
        
        let data = []
        if (response.data) {
            data = response.data
            setTotalPages(response.meta.totalPages)
        } else if (Array.isArray(response)) {
            data = response
        }
        setShelters(data)
        
        if (debouncedSearch) {
             logSearch({
              keyword: debouncedSearch,
              filters: { type: 'Shelter' },
              results_count: response.meta ? response.meta.totalItems : data.length
            });
        }

      } catch (err) {
        console.error('Failed to fetch shelters:', err)
        setError('無法載入避難所資料')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [page, debouncedSearch, isNearbyMode])

  const handleNearbySearch = () => {
    if (!navigator.geolocation) {
        alert('您的瀏覽器不支援地理位置功能')
        return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude } = position.coords
                console.log('Fetching nearby shelters:', latitude, longitude)
                const data = await getNearbyShelters(latitude, longitude, 10)
                console.log('Nearby shelters data:', data)
                
                if (Array.isArray(data)) {
                    setShelters(data)
                    setIsNearbyMode(true)
                    setTotalPages(1) // Nearby mode usually single page
                    setPage(1)
                } else {
                    console.error('Invalid data format:', data)
                    throw new Error('資料格式錯誤')
                }
            } catch (err) {
                console.error('Failed to get nearby shelters:', err)
                setError('無法獲取附近避難所')
            } finally {
                setLoading(false)
            }
        },
        (err) => {
            console.error('Geolocation error:', err)
            setLoading(false)
            alert('無法獲取您的位置，請檢查瀏覽器權限')
        }
    )
  }

  if (loading && page === 1 && shelters.length === 0) return <div className="text-center py-12">載入中...</div>
  
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">避難所資訊</h1>
          <p className="text-muted-foreground mt-2">
            查詢附近的緊急避難場所及其容納狀況。
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="搜尋縣市、區域 (例如：花蓮縣、鹿野鄉)..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            </div>
            <Button variant="outline" onClick={handleNearbySearch} className={isNearbyMode ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}>
                <Navigation className="w-4 h-4 mr-2" />
                附近
            </Button>
        </div>
      </div>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {shelters.map((shelter) => (
            <motion.div
              layout
              key={shelter.shelter_id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <Home className="h-5 w-5 text-blue-500" />
                      <CardTitle className="text-lg leading-tight">
                        {shelter.name}
                      </CardTitle>
                    </div>
                    <Badge variant="outline">
                      {shelter.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{shelter.address}</span>
                  </div>
                  
                  {shelter.distance !== undefined && !isNaN(Number(shelter.distance)) && (
                      <div className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 p-2 rounded-md">
                        <Navigation className="h-4 w-4" />
                        <span>距離: {Number(shelter.distance) < 1 ? `${(Number(shelter.distance) * 1000).toFixed(0)} 公尺` : `${Number(shelter.distance).toFixed(2)} 公里`}</span>
                      </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{shelter.phone}</span>
                  </div>

                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4 text-slate-500" />
                      <span>容納人數</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {shelter.capacity} 人
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

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
    </div>
  )
}
