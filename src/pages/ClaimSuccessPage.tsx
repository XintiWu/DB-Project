import { useLocation, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import type { ClaimRecord } from '../lib/types'
import { ALL_CATEGORIES } from '../lib/constants'

export function ClaimSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const claimRecord = location.state?.claimRecord as ClaimRecord

  if (!claimRecord) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl mb-4">❌</div>
            <p className="text-muted-foreground mb-4">無法找到認領記錄</p>
            <Button onClick={() => navigate('/')}>
              返回首頁
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-green-600">✅ 認領成功</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* 成功訊息 */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-green-700 mb-2">認領送出成功！</h2>
              <p className="text-green-600">
                感謝您的愛心，需求發布者將會盡快與您聯繫
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 認領憑證 */}
        <Card>
          <CardHeader>
            <CardTitle>認領憑證</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-100 p-4 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">認領編號</span>
                <span className="font-mono font-bold text-lg">{claimRecord.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">送出時間</span>
                <span className="font-medium">{claimRecord.submittedAt}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">認領者</span>
                <span className="font-medium">{claimRecord.claimerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">聯絡電話</span>
                <span className="font-medium">{claimRecord.claimerPhone}</span>
              </div>
              {claimRecord.claimerEmail && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">聯絡信箱</span>
                  <span className="font-medium">{claimRecord.claimerEmail}</span>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2">認領項目 ({claimRecord.items.length} 項)</h3>
              <div className="space-y-2">
                {claimRecord.items.map((item, index) => {
                  const category = ALL_CATEGORIES[item.category]
                  return (
                    <div key={index} className="border rounded-lg p-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span className="font-medium">{item.title}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        認領數量：{item.quantity} {item.unit}
                      </div>
                      {item.estimatedDelivery && (
                        <div className="text-sm text-muted-foreground">
                          預計送達：{item.estimatedDelivery}
                        </div>
                      )}
                      {item.availableTimeSlots && (
                        <div className="text-sm text-muted-foreground">
                          可參與時間：{item.availableTimeSlots}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {claimRecord.notes && (
              <div>
                <h3 className="font-semibold mb-2">備註說明</h3>
                <p className="text-sm text-muted-foreground bg-slate-50 p-3 rounded">
                  {claimRecord.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 後續步驟 */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700">📌 後續步驟</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-700">
            <p>✓ 需求發布者將透過您提供的聯絡方式與您聯繫</p>
            <p>✓ 請保持電話暢通，留意來電與訊息</p>
            <p>✓ 確認配送/服務的時間與地點</p>
            <p>✓ 如有變動請盡早告知需求發布者</p>
            <p className="pt-2 border-t border-blue-300">
              💡 建議您將此頁面截圖保存，以便後續追蹤
            </p>
          </CardContent>
        </Card>

        {/* 操作按鈕 */}
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => window.print()} className="flex-1">
            🖨️ 列印憑證
          </Button>
          <Button onClick={() => navigate('/')} className="flex-1">
            返回首頁繼續瀏覽
          </Button>
        </div>
      </div>
    </div>
  )
}


