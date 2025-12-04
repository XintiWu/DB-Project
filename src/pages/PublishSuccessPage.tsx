import { useLocation, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { ALL_CATEGORIES, SEVERITY_INFO } from '../lib/constants'

export function PublishSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const need = location.state?.need

  if (!need) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl mb-4">❌</div>
            <p className="text-muted-foreground mb-4">無法找到需求記錄</p>
            <Button onClick={() => navigate('/')}>
              返回首頁
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const category = ALL_CATEGORIES[need.category as keyof typeof ALL_CATEGORIES]
  const severity = SEVERITY_INFO[need.severity as keyof typeof SEVERITY_INFO]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-green-600">✅ 需求發布成功</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* 成功訊息 */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-green-700 mb-2">需求發布成功！</h2>
              <p className="text-green-600">
                您的需求已公開在平台上，響應者將會看到並認領
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 需求資訊 */}
        <Card>
          <CardHeader>
            <CardTitle>需求資訊</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-100 p-4 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">需求編號</span>
                <span className="font-mono font-bold text-lg">{need.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">發布時間</span>
                <span className="font-medium">{need.createdAt}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">管理金鑰</span>
                <span className="font-mono text-xs bg-yellow-100 px-2 py-1 rounded">
                  {need.managementKey}
                </span>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-2xl">{category.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{need.title}</h3>
                  <p className="text-sm text-muted-foreground">{need.location}</p>
                </div>
                <Badge className={severity.badge}>
                  {severity.name}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Badge variant="outline" className={category.color}>
                  {category.name}
                </Badge>
                <Badge variant="outline">
                  {need.region}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">項目：</span>
                  <span className="font-medium">{need.itemName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">需求數量：</span>
                  <span className="font-medium">{need.requiredQuantity} {need.unit}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">截止時間：</span>
                  <span className="font-medium">{need.deadline}</span>
                </div>
                {need.timeSlots && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">時間需求：</span>
                    <span className="font-medium">{need.timeSlots}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-sm text-muted-foreground">說明：</span>
                <p className="text-sm mt-1">{need.description}</p>
              </div>

              <div className="border-t pt-2 text-sm">
                <div className="text-muted-foreground">聯絡人：{need.publisherName}</div>
                <div className="text-muted-foreground">電話：{need.contactPhone}</div>
                {need.contactEmail && (
                  <div className="text-muted-foreground">信箱：{need.contactEmail}</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 管理金鑰說明 */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-700">🔑 管理金鑰說明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-yellow-700">
            <p className="font-semibold">請務必保存您的管理金鑰：{need.managementKey}</p>
            <p>✓ 管理金鑰可用於後續更新需求狀態</p>
            <p>✓ 當需求已滿足時，可使用金鑰標記為「已滿足」</p>
            <p>✓ 如需修改需求資訊，也需要此金鑰</p>
            <p>✓ 請勿將金鑰分享給他人</p>
            <p className="pt-2 border-t border-yellow-300">
              💡 建議您將此頁面截圖保存或記錄金鑰在安全的地方
            </p>
          </CardContent>
        </Card>

        {/* 後續步驟 */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700">📌 後續步驟</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-700">
            <p>✓ 您的需求已公開在平台上</p>
            <p>✓ 當有人認領時，他們會透過聯絡方式與您聯繫</p>
            <p>✓ 請保持電話暢通，留意來電與訊息</p>
            <p>✓ 確認響應者的身份與認領內容</p>
            <p>✓ 當需求滿足後，記得更新狀態避免重複認領</p>
          </CardContent>
        </Card>

        {/* 操作按鈕 */}
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => window.print()} className="flex-1">
            🖨️ 列印資訊
          </Button>
          <Button onClick={() => navigate('/')} className="flex-1">
            返回首頁查看需求
          </Button>
        </div>
      </div>
    </div>
  )
}


