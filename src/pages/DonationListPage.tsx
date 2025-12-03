import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDonationData } from '../hooks/useDonationData'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { useTheme } from '../context/ThemeContext'
import type { DonationRecord } from '../lib/types'

export function DonationListPage() {
  const { donations, loading, error, getTotalByCurrency, getPurposeDistribution } = useDonationData()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  // 統計資訊
  const stats = useMemo(() => {
    const totals = getTotalByCurrency()
    const purposeDist = getPurposeDistribution()
    
    return {
      totalRecords: donations.length,
      totalAmount: totals,
      topPurpose: Object.entries(purposeDist).sort((a, b) => b[1] - a[1])[0]
    }
  }, [donations, getTotalByCurrency, getPurposeDistribution])

  // 格式化金額
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }

  // 格式化時間
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  // 用途顏色
  const getPurposeColor = (purpose: string) => {
    const colors: Record<string, string> = {
      '救災物資採購': 'bg-blue-100 text-blue-700 border-blue-200',
      '避難所維護': 'bg-green-100 text-green-700 border-green-200',
      '醫療設備': 'bg-red-100 text-red-700 border-red-200',
      '重建工程': 'bg-orange-100 text-orange-700 border-orange-200',
      '志工補助': 'bg-purple-100 text-purple-700 border-purple-200',
      '行政管理': 'bg-gray-100 text-gray-700 border-gray-200',
      '其他': 'bg-slate-100 text-slate-700 border-slate-200'
    }
    return colors[purpose] || colors['其他']
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <header className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-primary dark:text-slate-100">💰 捐款紀錄</h1>
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
            <h1 className="text-2xl font-bold text-primary dark:text-slate-100">💰 捐款紀錄</h1>
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
              <p className="text-sm text-muted-foreground dark:text-slate-400">捐款透明度報告</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {theme === 'dark' ? '🌞' : '🌙'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/volunteer')}>
                📋 需求配對
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/incidents')}>
                🚨 災情
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/inventory')}>
                📦 物資
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/shelters')}>
                🏠 避難所
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                👤 個人
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 統計卡片 */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-800 dark:to-emerald-800 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              💚 捐款透明度報告
            </h2>
            <p className="text-white/90 text-sm">
              所有捐款資訊公開透明，感謝每一位捐款者的支持
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="text-3xl font-bold">{stats.totalRecords}</div>
              <div className="text-sm opacity-90">捐款筆數</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="text-lg font-bold">
                {Object.entries(stats.totalAmount).map(([currency, amount]) => (
                  <div key={currency}>{formatAmount(amount, currency)}</div>
                ))}
              </div>
              <div className="text-sm opacity-90">總捐款金額</div>
            </div>
            
            {stats.topPurpose && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
                <div className="text-lg font-bold">{stats.topPurpose[0]}</div>
                <div className="text-sm opacity-90">
                  主要用途 ({formatAmount(stats.topPurpose[1], 'TWD')})
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="container mx-auto px-4 py-6">
        {/* 說明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            📊 關於透明度報告
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            為了讓捐款者放心，我們公開所有捐款與支出記錄。每一筆捐款的來源、金額、用途都清楚記錄，
            確保每一分捐款都用在最需要的地方。
          </p>
        </div>

        {/* 捐款記錄列表 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              📝 捐款記錄
            </h2>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              共 {donations.length} 筆記錄
            </div>
          </div>

          {donations.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-muted-foreground dark:text-slate-400">目前沒有捐款記錄</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {donations.map((donation) => (
                <Card
                  key={donation.txn_id}
                  className="p-5 dark:bg-slate-800 dark:border-slate-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl">💰</div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                            {donation.source}
                          </h3>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            交易編號：{donation.txn_id}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                            金額
                          </div>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {formatAmount(donation.amount, donation.currency)}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                            用途
                          </div>
                          <Badge className={`${getPurposeColor(donation.purpose)} border`}>
                            {donation.purpose}
                          </Badge>
                        </div>

                        <div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                            時間
                          </div>
                          <div className="text-sm text-slate-700 dark:text-slate-300">
                            {formatDateTime(donation.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

