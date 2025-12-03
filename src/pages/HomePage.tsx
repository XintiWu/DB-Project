import { useState } from 'react'
import { useNeedData } from '../hooks/useNeedData'
import { useShelterData } from '../hooks/useShelterData'
import { HeroSection } from '../components/HeroSection'
import { HomeDashboard } from '../components/HomeDashboard'
import { HomeNeedCard } from '../components/HomeNeedCard'
import { ShelterCard } from '../components/ShelterCard'
import { Button } from '../components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useClaimContext } from '../context/ClaimContext'

export function HomePage() {
  const { needs, loading, error } = useNeedData()
  const { shelters, loading: sheltersLoading } = useShelterData()
  const { getTotalItems } = useClaimContext()
  const navigate = useNavigate()
  const [showMoreNeeds, setShowMoreNeeds] = useState(false)

  // 獲取最緊急的3個需求
  const urgentNeeds = needs
    .filter(need => need.severity === 'critical')
    .sort((a, b) => {
      // 按緊急程度和截止時間排序
      if (a.severity !== b.severity) {
        return a.severity === 'critical' ? -1 : 1
      }
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    })
    .slice(0, 3)

  // 跳轉到志工頁面
  const navigateToVolunteer = () => {
    navigate('/volunteer')
  }

  // 跳轉到志工頁面並設置篩選條件
  const handleDashboardNavigate = (filter?: {
    category?: string
    needType?: string
    status?: string
  }) => {
    // 將篩選條件作為 URL 參數傳遞
    const params = new URLSearchParams()
    if (filter?.category) params.set('category', filter.category)
    if (filter?.needType) params.set('needType', filter.needType)
    if (filter?.status) params.set('status', filter.status)
    
    const queryString = params.toString()
    navigate(`/volunteer${queryString ? `?${queryString}` : ''}`)
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-muted-foreground dark:text-slate-400">載入中...</p>
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
              <div>
                <h1 className="text-2xl font-bold text-primary dark:text-slate-100">🚨 救災資源配對平台</h1>
                <p className="text-sm text-muted-foreground dark:text-slate-400">載入中...</p>
              </div>
            </div>
          </div>
        </header>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">❌</div>
            <p className="text-destructive dark:text-red-400">{error}</p>
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
            <div>
              <h1 className="text-2xl font-bold text-primary dark:text-slate-100">🚨 救災資源配對平台</h1>
              <p className="text-sm text-muted-foreground dark:text-slate-400">連結需求與資源，共同度過難關</p>
            </div>
            <div className="flex items-center gap-2">
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

      {/* Hero Section */}
      <HeroSection 
        onGetStarted={navigateToVolunteer}
        onPublish={() => navigate('/publish')}
      />

      {/* 救災進度總覽儀表板 */}
      <HomeDashboard 
        needs={needs} 
        onNavigateToNeeds={handleDashboardNavigate}
      />

      {/* 最急需支援 */}
      {urgentNeeds.length > 0 && (
        <div className="bg-white dark:bg-slate-800 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                🚨 最急需支援
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                這些需求需要立即關注，您的協助將帶來巨大幫助
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {urgentNeeds.map(need => (
                <HomeNeedCard key={need.id} need={need} />
              ))}
            </div>

            <div className="text-center">
              <Button 
                size="lg" 
                onClick={navigateToVolunteer}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                查看全部 {needs.length} 個需求 →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 附近避難所 */}
      <div className="bg-slate-50 dark:bg-slate-900 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">
              🏠 附近避難所
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              即時查看避難所容納狀況，尋找最近的安全地點
            </p>
          </div>

          {sheltersLoading ? (
            <div className="text-center py-8">
              <p className="text-slate-600 dark:text-slate-400">載入避難所資訊中...</p>
            </div>
          ) : shelters.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {shelters.slice(0, 6).map(shelter => (
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
              
              {shelters.length > 6 && (
                <div className="text-center">
                  <Button 
                    variant="outline"
                    size="lg"
                    onClick={() => alert('避難所列表頁面即將推出！')}
                  >
                    查看全部 {shelters.length} 個避難所 →
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-600 dark:text-slate-400">目前沒有避難所資訊</p>
            </div>
          )}
        </div>
      </div>

      {/* 使用說明 */}
      <div className="bg-slate-50 dark:bg-slate-900 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">
              💡 如何使用？
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              簡單三步驟，開始您的救災行動
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">1. 瀏覽需求</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                查看當前最急需的物資和救災需求
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">2. 選擇協助</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                找到您能協助的項目，點擊認領
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📞</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">3. 留下聯絡資料</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                留下您的聯絡方式，讓需求方主動聯繫您
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Button 
              size="lg" 
              onClick={navigateToVolunteer}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xl font-bold px-10 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              {/* 持續的光帶效果 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-[shimmer_2s_ease-in-out_infinite]"></div>
              
              {/* 按鈕內容 */}
              <span className="relative z-10 flex items-center gap-3">
                <span className="text-2xl group-hover:animate-bounce">🦸‍♂️</span>
                <span>開始當志工</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}