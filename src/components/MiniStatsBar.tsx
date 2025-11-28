import type { Need } from '../lib/types'
import { useMemo } from 'react'

interface MiniStatsBarProps {
  needs: Need[]
}

export function MiniStatsBar({ needs }: MiniStatsBarProps) {
  const stats = useMemo(() => {
    const total = needs.length
    const urgent = needs.filter(n => n.severity === 'critical' || n.status === 'urgent').length
    const active = needs.filter(n => n.status === 'active').length
    const fulfilled = needs.filter(n => n.status === 'fulfilled').length
    
    const overallProgress = total > 0 
      ? Math.round((needs.reduce((sum, need) => sum + need.currentQuantity, 0) / 
          needs.reduce((sum, need) => sum + need.requiredQuantity, 0)) * 100)
      : 0

    return { total, urgent, active, fulfilled, overallProgress }
  }, [needs])

  return (
    <div className="bg-white dark:bg-slate-800 border-y dark:border-slate-700 py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-6 flex-wrap text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <span className="text-muted-foreground dark:text-slate-400">總需求</span>
            <span className="font-bold text-xl text-blue-600 dark:text-blue-400">{stats.total}</span>
          </div>
          
          <div className="h-8 w-px bg-slate-300 dark:bg-slate-600"></div>
          
          <div className="flex items-center gap-2">
            <span className="text-xl">🚨</span>
            <span className="text-muted-foreground dark:text-slate-400">緊急</span>
            <span className="font-bold text-xl text-red-600 dark:text-red-400">{stats.urgent}</span>
          </div>
          
          <div className="h-8 w-px bg-slate-300 dark:bg-slate-600"></div>
          
          <div className="flex items-center gap-2">
            <span className="text-xl">⏳</span>
            <span className="text-muted-foreground dark:text-slate-400">長期募集</span>
            <span className="font-bold text-xl text-amber-600 dark:text-amber-400">{stats.active}</span>
          </div>
          
          <div className="h-8 w-px bg-slate-300 dark:bg-slate-600"></div>
          
          <div className="flex items-center gap-2">
            <span className="text-xl">✅</span>
            <span className="text-muted-foreground dark:text-slate-400">已滿足</span>
            <span className="font-bold text-xl text-green-600 dark:text-green-400">{stats.fulfilled}</span>
          </div>
          
          <div className="h-8 w-px bg-slate-300 dark:bg-slate-600"></div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">📈</span>
              <span className="text-muted-foreground dark:text-slate-400">總進度</span>
            </div>
            <div className="w-32 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 transition-all duration-500"
                style={{ width: `${stats.overallProgress}%` }}
              ></div>
            </div>
            <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{stats.overallProgress}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

