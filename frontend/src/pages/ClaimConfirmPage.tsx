import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClaimContext } from '../context/ClaimContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { ALL_CATEGORIES } from '../lib/constants'
import { submitClaim } from '../api/client'

export function ClaimConfirmPage() {
  const navigate = useNavigate()
  const { claimItems, clearClaimList, getTotalItems } = useClaimContext()

  const [claimerName, setClaimerName] = useState('')
  const [claimerPhone, setClaimerPhone] = useState('')
  const [claimerEmail, setClaimerEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (getTotalItems() === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="text-6xl">🛒</div>
        <h2 className="text-2xl font-bold">認領清單是空的</h2>
        <p className="text-muted-foreground">快去瀏覽需求，加入您想認領的項目吧！</p>
        <Button onClick={() => navigate('/volunteer')}>
          前往認領專區
        </Button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!claimerName || !claimerPhone) {
      alert('請填寫必填欄位')
      return
    }

    setIsSubmitting(true)

    try {
      const claimData = {
        claimerName,
        claimerPhone,
        claimerEmail,
        notes,
        items: claimItems
      }

      console.log('提交認領數據:', JSON.stringify(claimData, null, 2))
      
      const result = await submitClaim(claimData)
      
      console.log('認領響應:', result)

      // 檢查響應是否成功
      if (result && result.success === false) {
        const errorMsg = result.errors?.map((e: any) => e.error).join(', ') || '認領失敗'
        throw new Error(errorMsg)
      }

      clearClaimList()
      navigate('/claim/success', { state: { claimRecord: { ...claimData, id: 'PENDING' } } })
      
    } catch (err: any) {
      console.error('Claim failed:', err)
      console.error('Error details:', {
        message: err?.message,
        error: err?.error,
        stack: err?.stack
      })
      const errorMessage = err?.message || err?.error || '認領失敗，請稍後再試'
      alert(`認領失敗：${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/volunteer')}>
          ← 返回
        </Button>
        <div>
          <h1 className="text-2xl font-bold">確認認領資訊</h1>
          <p className="text-sm text-muted-foreground">請確認您的認領清單與聯絡資訊</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* List */}
        <Card>
          <CardHeader>
            <CardTitle>認領清單 ({getTotalItems()} 項)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {claimItems.map((item) => {
              const category = ALL_CATEGORIES[item.category as keyof typeof ALL_CATEGORIES]
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
                  <div className="grid grid-cols-2 gap-2 text-sm mt-2 bg-slate-50 p-2 rounded">
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
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>認領者資訊</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                姓名 / 組織名稱 <span className="text-red-500">*</span>
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
                聯絡電話 <span className="text-red-500">*</span>
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
              <label className="text-sm font-medium mb-2 block">聯絡信箱</label>
              <Input
                type="email"
                placeholder="例如：example@email.com"
                value={claimerEmail}
                onChange={(e) => setClaimerEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">整體備註</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="其他補充說明..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/volunteer')} className="flex-1">
            繼續瀏覽
          </Button>
          <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" size="lg" disabled={isSubmitting}>
            {isSubmitting ? '處理中...' : '確認送出認領'}
          </Button>
        </div>
      </form>
    </div>
  )
}
