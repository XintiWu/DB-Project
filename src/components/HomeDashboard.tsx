import type { Need } from '../lib/types'

interface HomeDashboardProps {
  needs: Need[]
  onNavigateToNeeds: (filter?: {
    category?: string
    needType?: string
    status?: string
  }) => void
}

export function HomeDashboard({ needs, onNavigateToNeeds }: HomeDashboardProps) {
  // 計算統計數據
  const stats = {
    total: needs.length,
    urgent: needs.filter(n => n.status === 'urgent').length, // 與志工頁同步使用 status
    ongoing: needs.filter(n => n.status === 'ongoing').length,
    fulfilled: needs.filter(n => n.status === 'fulfilled').length
  }

  // 計算總體進度（基於總已認領數量比例，與志工頁同步）
  const totalProgress = stats.total > 0 
    ? Math.round((needs.reduce((sum, need) => sum + need.currentQuantity, 0) / 
        needs.reduce((sum, need) => sum + need.requiredQuantity, 0)) * 100)
    : 0

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* 標題 */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
              救災進度總覽
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            即時更新的平台統計資訊，幫助您快速了解當前救災狀況
          </p>
        </div>

        {/* 主要統計區塊 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
          {/* 總需求數 */}
          <div 
            className="group cursor-pointer"
            onClick={() => onNavigateToNeeds()}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
              <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                {stats.total}
              </div>
              <div className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                總需求數
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                包含物資與救災需求
              </div>
            </div>
          </div>

          {/* 緊急需求 */}
          <div 
            className="group cursor-pointer"
            onClick={() => onNavigateToNeeds({ status: 'urgent' })}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-600 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                </div>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                {stats.urgent}
              </div>
              <div className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                緊急需求
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                需要立即協助
              </div>
            </div>
          </div>

          {/* 長期募集 */}
          <div 
            className="group cursor-pointer"
            onClick={() => onNavigateToNeeds({ status: 'ongoing' })}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              </div>
              <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                {stats.ongoing}
              </div>
              <div className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                長期募集
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                歡迎認領協助
              </div>
            </div>
          </div>

          {/* 已滿足 */}
          <div 
            className="group cursor-pointer"
            onClick={() => onNavigateToNeeds({ status: 'fulfilled' })}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                {stats.fulfilled}
              </div>
              <div className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                已滿足
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                感謝大家協助
              </div>
            </div>
          </div>
        </div>

        {/* 總體進度條 */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  總體救災進度
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  平台整體協助完成度
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {totalProgress}%
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                完成度
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-1000 relative"
                style={{ width: `${totalProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {stats.fulfilled}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                已認領需求
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {stats.total - stats.fulfilled}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                待協助需求
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">即時更新</span>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                持續追蹤中
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}