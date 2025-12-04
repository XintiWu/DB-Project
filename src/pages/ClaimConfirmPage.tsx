import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClaimContext } from '../context/ClaimContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { ALL_CATEGORIES } from '../lib/constants'
import { generateId } from '../lib/utils'

export function ClaimConfirmPage() {
  const navigate = useNavigate()
  const { claimItems, clearClaimList, getTotalItems } = useClaimContext()

  const [claimerName, setClaimerName] = useState('')
  const [claimerPhone, setClaimerPhone] = useState('')
  const [claimerEmail, setClaimerEmail] = useState('')
  const [notes, setNotes] = useState('')

  if (getTotalItems() === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl mb-4">🛒</div>
            <p className="text-muted-foreground mb-4">認領清單是空的</p>
            <Button onClick={() => navigate('/')}>
              返回首頁
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!claimerName || !claimerPhone) {
      alert('請填寫必填欄位')
      return
    }

    // 生成認領編號
    const claimId = generateId()
    const submittedAt = new Date().toLocaleString('zh-TW')

    // 儲存認領記錄（在真實應用中這裡會送到後端）
    const claimRecord = {
      id: claimId,
      items: claimItems,
      submittedAt,
      claimerName,
      claimerPhone,
      claimerEmail,
      notes
    }

    // 儲存到 localStorage（模擬後端儲存）
    const existingRecords = JSON.parse(localStorage.getItem('claim-records') || '[]')
    existingRecords.push(claimRecord)
    localStorage.setItem('claim-records', JSON.stringify(existingRecords))

    // 清空認領清單
    clearClaimList()

    // 跳轉到成功頁面
    navigate('/claim/success', { state: { claimRecord } })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              ← 返回
            </Button>
            <div>
              <h1 className="text-2xl font-bold">確認認領資訊</h1>
              <p className="text-sm text-muted-foreground">請確認您的認領清單與聯絡資訊</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 認領清單摘要 */}
          <Card>
            <CardHeader>
              <CardTitle>認領清單 ({getTotalItems()} 項)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {claimItems.map((item) => {
                const category = ALL_CATEGORIES[item.category]
                return (
                  <div key={item.needId} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-2xl">{category.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.title}</h3>
                        <div className="mt-1">
                          <Badge variant="outline" className={category.color}>
                            {category.name}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">認領數量：</span>
                        <span className="font-medium">{item.quantity} {item.unit}</span>
                      </div>
                      {item.estimatedDelivery && (
                        <div>
                          <span className="text-muted-foreground">預計送達：</span>
                          <span className="font-medium">{item.estimatedDelivery}</span>
                        </div>
                      )}
                      {item.availableTimeSlots && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">可參與時間：</span>
                          <span className="font-medium">{item.availableTimeSlots}</span>
                        </div>
                      )}
                      {item.materialSource && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">物資來源：</span>
                          <span className="font-medium">{item.materialSource}</span>
                        </div>
                      )}
                      {item.qualifications && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">相關資格：</span>
                          <span className="font-medium">{item.qualifications}</span>
                        </div>
                      )}
                      {item.note && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">備註：</span>
                          <span className="font-medium">{item.note}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* 認領者資訊 */}
          <Card>
            <CardHeader>
              <CardTitle>認領者資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  姓名 / 組織名稱 <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="請輸入您的姓名或組織名稱"
                  value={claimerName}
                  onChange={(e) => setClaimerName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  聯絡電話 <span className="text-destructive">*</span>
                </label>
                <Input
                  type="tel"
                  placeholder="例如：0912-345-678"
                  value={claimerPhone}
                  onChange={(e) => setClaimerPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  聯絡信箱
                </label>
                <Input
                  type="email"
                  placeholder="例如：example@email.com"
                  value={claimerEmail}
                  onChange={(e) => setClaimerEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  整體備註
                </label>
                <textarea
                  className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="其他補充說明..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 注意事項 */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">📋 注意事項</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 送出後將生成認領編號，請妥善保存</li>
                <li>• 需求發布者會收到您的認領資訊並與您聯絡</li>
                <li>• 認領送出後代表承諾，請確實履行</li>
                <li>• 如有變動請盡早聯絡需求發布者</li>
              </ul>
            </CardContent>
          </Card>

          {/* 送出按鈕 */}
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/')} className="flex-1">
              返回首頁
            </Button>
            <Button type="submit" className="flex-1" size="lg">
              確認送出認領
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}


