import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMyLends } from '../hooks/useMyLends'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { LEND_STATUS_INFO, ITEM_CATEGORIES } from '../lib/constants'

export function MyLendsPage() {
  const navigate = useNavigate()
  // 暫時使用固定 user_id，實際應從登入系統獲取
  const userId = 'USER123'
  const { lends, loading, error, getLendStatus, returnItem } = useMyLends(userId)
  const [returningId, setReturningId] = useState<string | null>(null)

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

  const handleReturn = async (lendId: string) => {
    if (!confirm('確定要歸還這項物品嗎？')) return
    
    setReturningId(lendId)
    try {
      const result = await returnItem(lendId)
      if (result.success) {
        alert('歸還成功！')
      } else {
        alert(result.message || '歸還失敗，請稍後再試')
      }
    } finally {
      setReturningId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-slate-600 dark:text-slate-400">載入中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  const ongoingLends = lends.filter(l => getLendStatus(l) === 'ongoing')
  const returnedLends = lends.filter(l => getLendStatus(l) === 'returned')
  const overdueLends = lends.filter(l => getLendStatus(l) === 'overdue')

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary dark:text-slate-100">📝 我的借用記錄</h1>
              <p className="text-sm text-muted-foreground dark:text-slate-400">查看和管理您的借用物品</p>
            </div>
            <Button variant="ghost" onClick={() => navigate('/inventory')}>
              ← 返回物資查詢
            </Button>
          </div>
        </div>
      </header>

      {/* 統計 */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-800 dark:to-pink-800 py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white text-center">
              <div className="text-2xl font-bold">{ongoingLends.length}</div>
              <div className="text-sm opacity-90">借用中</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white text-center">
              <div className="text-2xl font-bold">{overdueLends.length}</div>
              <div className="text-sm opacity-90">逾期</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white text-center">
              <div className="text-2xl font-bold">{returnedLends.length}</div>
              <div className="text-sm opacity-90">已歸還</div>
            </div>
          </div>
        </div>
      </div>

      {/* 內容 */}
      <div className="container mx-auto px-4 py-6">
        {lends.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-muted-foreground dark:text-slate-400 mb-4">您還沒有借用任何物品</p>
            <Button onClick={() => navigate('/inventory')}>
              前往物資查詢
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {lends.map(lend => {
              const status = getLendStatus(lend)
              const statusInfo = LEND_STATUS_INFO[status]
              
              return (
                <Card key={lend.lend_id} className="p-5 dark:bg-slate-800 dark:border-slate-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">📦</span>
                        <div>
                          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                            {lend.item_name}
                          </h3>
                          <Badge className={statusInfo.badge}>
                            {statusInfo.name}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-slate-500 dark:text-slate-400">借用數量</div>
                          <div className="font-medium text-slate-800 dark:text-slate-100">
                            {lend.qty} 個
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-slate-500 dark:text-slate-400">借用時間</div>
                          <div className="font-medium text-slate-800 dark:text-slate-100">
                            {formatDateTime(lend.lend_at)}
                          </div>
                        </div>
                        
                        {lend.returned_at ? (
                          <div>
                            <div className="text-slate-500 dark:text-slate-400">歸還時間</div>
                            <div className="font-medium text-slate-800 dark:text-slate-100">
                              {formatDateTime(lend.returned_at)}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <Button
                              size="sm"
                              onClick={() => handleReturn(lend.lend_id)}
                              disabled={returningId === lend.lend_id}
                            >
                              {returningId === lend.lend_id ? '處理中...' : '✓ 標記歸還'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

