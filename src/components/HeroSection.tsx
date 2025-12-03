import { Card } from './ui/card'
import { Button } from './ui/button'

interface HeroSectionProps {
  onGetStarted: () => void
  onPublish: () => void
}

export function HeroSection({ onGetStarted, onPublish }: HeroSectionProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-900 dark:to-slate-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* 主標題區 */}
          <div className="text-center mb-6">
            <div className="inline-block bg-amber-500/90 backdrop-blur-sm rounded-full px-5 py-2 mb-4 shadow-lg border-2 border-white">
              <span className="text-sm font-bold">🚨 救災資源即時配對平台</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 flex items-center justify-center gap-3">
              <span className="text-6xl">🪏</span>
              <span>鏟子超人</span>
            </h1>
            <p className="text-xl text-blue-100 dark:text-blue-200 max-w-2xl mx-auto">
              災害發生時，讓需要幫助的人找到資源，讓想幫助的人找到需求
            </p>
          </div>

          {/* 行動按鈕 - 保持原本並排布局，志工按鈕增加視覺效果 */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
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

