import { Card, CardContent } from './ui/card'
import type { Need } from '../lib/types'
import { useState, useEffect, useRef, forwardRef } from 'react'

interface EnhancedStatsOverviewProps {
  needs: Need[]
}

export const EnhancedStatsOverview = forwardRef<HTMLDivElement, EnhancedStatsOverviewProps>(
  ({ needs }, ref) => {
  const totalNeeds = needs.length
  const urgentNeeds = needs.filter(n => n.status === 'urgent').length
  const fulfilledNeeds = needs.filter(n => n.status === 'fulfilled').length
  const inProgressNeeds = needs.filter(n => n.status === 'ongoing').length
  
  // 計算總體進度百分比
  const overallProgress = totalNeeds > 0 
    ? Math.round((needs.reduce((sum, need) => sum + need.currentQuantity, 0) / 
        needs.reduce((sum, need) => sum + need.requiredQuantity, 0)) * 100)
    : 0

  // 動畫數字效果
  const [animatedTotal, setAnimatedTotal] = useState(0)
  const [animatedUrgent, setAnimatedUrgent] = useState(0)
  const [animatedFulfilled, setAnimatedFulfilled] = useState(0)
  const [animatedProgress, setAnimatedProgress] = useState(0)

  useEffect(() => {
    const duration = 1000
    const steps = 30
    const totalStep = totalNeeds / steps
    const urgentStep = urgentNeeds / steps
    const fulfilledStep = fulfilledNeeds / steps
    const progressStep = overallProgress / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      setAnimatedTotal(Math.min(Math.floor(totalStep * currentStep), totalNeeds))
      setAnimatedUrgent(Math.min(Math.floor(urgentStep * currentStep), urgentNeeds))
      setAnimatedFulfilled(Math.min(Math.floor(fulfilledStep * currentStep), fulfilledNeeds))
      setAnimatedProgress(Math.min(Math.floor(progressStep * currentStep), overallProgress))

      if (currentStep >= steps) {
        clearInterval(timer)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [totalNeeds, urgentNeeds, fulfilledNeeds, overallProgress])

  return (
    <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 border-y dark:border-slate-700 py-6">
      <div className="container mx-auto px-4">
        {/* 標題說明 */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center justify-center gap-2">
            <span>📊</span>
            <span>救災進度總覽</span>
          </h2>
          <p className="text-sm text-muted-foreground dark:text-slate-400">
            即時更新的平台統計資訊，幫助您快速了解當前救災狀況
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* 總需求數 */}
          <Card className="dark:bg-slate-800 dark:border-slate-700 border-2 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-4xl">📊</span>
                <div className="w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-600 animate-pulse"></div>
              </div>
              <div className="text-4xl font-bold mb-1 text-blue-600 dark:text-blue-400">
                {animatedTotal}
              </div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                總需求數
              </div>
              <div className="text-xs text-muted-foreground dark:text-slate-400">
                包含物資與救災需求
              </div>
            </CardContent>
          </Card>

          {/* 緊急需求 */}
          <Card className="dark:bg-slate-800 dark:border-slate-700 border-2 border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-4xl">🚨</span>
                <div className="w-3 h-3 rounded-full bg-red-500 dark:bg-red-600 animate-pulse"></div>
              </div>
              <div className="text-4xl font-bold mb-1 text-red-600 dark:text-red-400">
                {animatedUrgent}
              </div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                緊急需求
              </div>
              <div className="text-xs text-muted-foreground dark:text-slate-400">
                需要立即協助
              </div>
            </CardContent>
          </Card>

          {/* 長期募集 */}
          <Card className="dark:bg-slate-800 dark:border-slate-700 border-2 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-4xl">⏳</span>
                <div className="w-3 h-3 rounded-full bg-amber-500 dark:bg-amber-600 animate-pulse"></div>
              </div>
              <div className="text-4xl font-bold mb-1 text-amber-600 dark:text-amber-400">
                {inProgressNeeds}
              </div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                長期募集
              </div>
              <div className="text-xs text-muted-foreground dark:text-slate-400">
                歡迎認領協助
              </div>
            </CardContent>
          </Card>

          {/* 已滿足 */}
          <Card className="dark:bg-slate-800 dark:border-slate-700 border-2 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-4xl">✅</span>
                <div className="w-3 h-3 rounded-full bg-green-500 dark:bg-green-600 animate-pulse"></div>
              </div>
              <div className="text-4xl font-bold mb-1 text-green-600 dark:text-green-400">
                {animatedFulfilled}
              </div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                已滿足
              </div>
              <div className="text-xs text-muted-foreground dark:text-slate-400">
                感謝大家協助
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 總體進度條 */}
        <Card ref={ref} className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-2 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📈</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">總體救災進度</span>
              </div>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{animatedProgress}%</span>
            </div>
            <div className="relative h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 transition-all duration-1000 ease-out rounded-full"
                style={{ width: `${animatedProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
              </div>
            </div>
            <div className="mt-2 text-xs text-center text-muted-foreground dark:text-slate-400">
              已認領 {animatedProgress}% 的總需求量 · 持續更新中
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})

EnhancedStatsOverview.displayName = 'EnhancedStatsOverview'

