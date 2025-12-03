import { Card } from './ui/card'
import { Button } from './ui/button'
import { useNavigate } from 'react-router-dom'

interface HeroSectionProps {
  onGetStarted: () => void
  onPublish: () => void
}

export function HeroSection({ onGetStarted, onPublish }: HeroSectionProps) {
  const navigate = useNavigate()

  // 滾動到避難所區域
  const scrollToShelters = () => {
    const shelterSection = document.querySelector('#shelter-section')
    if (shelterSection) {
      shelterSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-900 dark:to-slate-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* 主標題區 */}
          <div className="text-center mb-8">
            <div className="inline-block bg-amber-500/90 backdrop-blur-sm rounded-full px-5 py-2 mb-4 shadow-lg border-2 border-white">
              <span className="text-sm font-bold">🚨 救災資源即時配對平台</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 flex items-center justify-center gap-3">
              <span className="text-6xl">🪏</span>
              <span>鏟子超人</span>
            </h1>
            <p className="text-xl text-blue-100 dark:text-blue-200 max-w-2xl mx-auto mb-8">
              災害發生時，讓需要幫助的人找到資源，讓想幫助的人找到需求
            </p>
          </div>

          {/* 主要功能按鈕網格 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {/* 災情狀況 */}
            <button
              onClick={() => navigate('/incidents')}
              className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-white/20 hover:border-white/40"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                🚨
              </div>
              <div className="font-bold text-lg mb-1">災情狀況</div>
              <div className="text-xs text-blue-100 opacity-90">
                查看災情通報
              </div>
            </button>

            {/* 索取物資 */}
            <button
              onClick={() => navigate('/inventory')}
              className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-white/20 hover:border-white/40"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                📦
              </div>
              <div className="font-bold text-lg mb-1">索取物資</div>
              <div className="text-xs text-blue-100 opacity-90">
                查看現有資源
              </div>
            </button>

            {/* 救災需求 */}
            <button
              onClick={() => navigate('/volunteer')}
              className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-white/20 hover:border-white/40"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                🆘
              </div>
              <div className="font-bold text-lg mb-1">救災需求</div>
              <div className="text-xs text-blue-100 opacity-90">
                查看需求列表
              </div>
            </button>

            {/* 查詢避難所 */}
            <button
              onClick={scrollToShelters}
              className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-white/20 hover:border-white/40"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                🏠
              </div>
              <div className="font-bold text-lg mb-1">查詢避難所</div>
              <div className="text-xs text-blue-100 opacity-90">
                尋找安全地點
              </div>
            </button>

            {/* 查看捐款 */}
            <button
              onClick={() => navigate('/donations')}
              className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-white/20 hover:border-white/40"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                💰
              </div>
              <div className="font-bold text-lg mb-1">捐款金流</div>
              <div className="text-xs text-blue-100 opacity-90">
                透明資金追蹤
              </div>
            </button>
          </div>

          {/* 行動按鈕 - 保持原本的兩個大按鈕 */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-4">
            <Button 
              size="lg" 
              className="relative bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-xl px-12 py-8 shadow-xl hover:shadow-2xl hover:scale-105 transition-all border-4 border-green-300 rounded-2xl animate-pulse"
              onClick={onGetStarted}
            >
              <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full animate-bounce">
                點我！
              </div>
              <span className="text-3xl mr-3 animate-bounce">🦸‍♂️</span>
              <div className="text-left">
                <div className="font-bold text-lg">我是志工</div>
                <div className="text-sm opacity-90">查看需求，提供協助</div>
              </div>
            </Button>
            <Button 
              size="lg" 
              className="bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-100 dark:hover:bg-red-200 dark:text-red-700 text-xl px-12 py-8 shadow-xl hover:shadow-2xl hover:scale-105 transition-all border-2 border-white rounded-2xl"
              onClick={onPublish}
            >
              <span className="text-3xl mr-3">🆘</span>
              <div className="text-left">
                <div className="font-bold text-lg">我是災民</div>
                <div className="text-sm opacity-75">發布求助，尋求資源</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

