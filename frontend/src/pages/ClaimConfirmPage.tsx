import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClaimContext } from '../context/ClaimContext'
import { useAuth } from '../context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

import { Badge } from '../components/ui/badge'
import { ALL_CATEGORIES } from '../lib/constants'
import { submitClaim, getRequestById } from '../api/client'

export function ClaimConfirmPage() {
  const navigate = useNavigate()
  const { claimItems, clearClaimList, getTotalItems } = useClaimContext()
  const { user } = useAuth()

  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [adjustedQuantities, setAdjustedQuantities] = useState<Record<string, number>>({})

  useEffect(() => {
    // Initialize quantities from claimItems defaults
    const defaults: Record<string, number> = {}
    claimItems.forEach(item => {
        defaults[item.needId] = item.quantity || 1
    })
    setAdjustedQuantities(defaults)
  }, [claimItems])

  useEffect(() => {
    // Optional: If we still want to show name/email in state for some reason? 
    // No, we use user object directly.
  }, [user])

  if (getTotalItems() === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="text-6xl">🛒</div>
        <h2 className="text-2xl font-bold">認領清單是空的</h2>
        <p className="text-muted-foreground">快去瀏覽需求，加入您想認領的項目吧！</p>
        <Button onClick={() => navigate('/requests')}>
          前往認領專區
        </Button>
      </div>
    )
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      alert('請先登入')
      navigate('/login')
      return
    }

    setIsSubmitting(true)

    try {
      // 在提交前檢查每個需求的當前狀態
      const validationErrors: string[] = []
      
      for (const item of claimItems) {
        try {
          const currentRequest = await getRequestById(item.needId)
          
          // 檢查需求是否存在
          if (!currentRequest) {
            validationErrors.push(`需求「${item.title}」不存在`)
            continue
          }
          
          // 檢查需求是否已完成
          if (currentRequest.status === 'Completed') {
            validationErrors.push(`需求「${item.title}」已經完成，無法再認領`)
            continue
          }
          
          // 檢查認領數量是否超過剩餘需求
          const finalQty = adjustedQuantities[item.needId] || item.quantity || 1
          const remaining = (currentRequest.required_qty || 0) - (currentRequest.current_qty || 0)
          
          if (finalQty > remaining) {
            validationErrors.push(`需求「${item.title}」的認領數量（${finalQty}）超過剩餘需求（${remaining}）`)
            continue
          }
        } catch (err: any) {
          console.error(`檢查需求 ${item.needId} 時發生錯誤:`, err)
          validationErrors.push(`無法檢查需求「${item.title}」的狀態：${err.message || '未知錯誤'}`)
        }
      }
      
      // 如果有驗證錯誤，阻止提交
      if (validationErrors.length > 0) {
        alert(`認領失敗：\n${validationErrors.join('\n')}`)
        setIsSubmitting(false)
        return
      }

      // Use user.user_id as accepter_id
      // items validation logic here if needed

      const items = claimItems.map(item => {
        const finalQty = adjustedQuantities[item.needId] || item.quantity || 1
        
        // Construct description from various fields
        const descParts = []
        descParts.push(`數量: ${finalQty} ${item.unit}`) // Use finalQty
        if (item.estimatedDelivery) descParts.push(`預計送達: ${item.estimatedDelivery}`) // Assuming date string
        if (item.availableTimeSlots) descParts.push(`時間: ${item.availableTimeSlots}`)
        if (item.qualifications) descParts.push(`資格: ${item.qualifications}`)
        if (item.note) descParts.push(`備註: ${item.note}`)
        
        // Add global notes to description of each item, or just the first? 
        // User might expect global notes to be somewhere.
        // Let's append global notes to each item if present, or maybe just rely on item notes.
        // The original code passed 'notes' separately. Now we have per-item description.
        // Let's add global notes to the description if it exists.
        if (notes) descParts.push(`整體備註: ${notes}`)

        if (notes) descParts.push(`整體備註: ${notes}`)


        return {
          request_id: item.needId,
          // ETA is strictly Time with Time Zone in DB (e.g., "14:00:00+08"). 
          // The UI provides a Date (e.g., "2025-12-19"), which causes a type error.
          // Since we preserve the date info in the 'description', we set eta to null.
          eta: null, 
          description: descParts.join(' | '),
          source: item.materialSource || '',
          qty: adjustedQuantities[item.needId] || item.quantity || 1 // Add qty field explicitly
        }
      })

      const claimData = {
        accepter_id: user.user_id,
        items: items
      }

      console.log('提交認領數據:', JSON.stringify(claimData, null, 2))
      
      const result = await submitClaim(claimData)
      
      console.log('認領響應:', result)

      // 檢查響應是否成功
      if (result && result.success === false) {
        const errorMsg = result.errors?.map((e: any) => e.error).join('\n') || '認領失敗'
        throw new Error(errorMsg)
      }

      // 檢查是否有錯誤（即使 success 可能為 true，如果有 errors 也要處理）
      if (result && result.errors && result.errors.length > 0) {
        const errorMsg = result.errors.map((e: any) => e.error).join('\n')
        // 如果有部分成功，仍然顯示錯誤但不清除清單
        if (result.successful && result.successful > 0) {
          alert(`部分認領成功，但有項目失敗：\n${errorMsg}`)
          // 不清除清單，讓用戶可以重試失敗的項目
          return
        } else {
          // 全部失敗（理論上不會到這裡，因為會拋出錯誤）
          throw new Error(errorMsg)
        }
      }

      // 只有當完全成功時才清除清單並導航
      if (result && result.successful === result.totalItems) {
        clearClaimList()
        navigate('/claim/success', { state: { claimRecord: { ...claimData, id: 'PENDING', claimerName: user.name } } })
      } else {
        // 如果沒有錯誤但也不完全成功，可能是異常情況
        throw new Error('認領處理異常，請稍後再試')
      }
      
    } catch (err: any) {
      console.error('Claim failed:', err)
      console.error('Error details:', {
        message: err?.message,
        error: err?.error,
        stack: err?.stack
      })
      
      // 提取錯誤訊息
      let errorMessage = '認領失敗，請稍後再試'
      if (err?.message) {
        errorMessage = err.message
      } else if (err?.error) {
        errorMessage = err.error
      }
      
      // 如果錯誤訊息包含「已經完成」，顯示更友好的訊息
      if (errorMessage.includes('已經完成') || errorMessage.includes('無法再認領')) {
        alert(`認領失敗：此需求已經完成，無法再認領`)
      } else {
        alert(`認領失敗：${errorMessage}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/requests')}>
          ← 返回
        </Button>
        <div>
          <h1 className="text-2xl font-bold">確認認領資訊</h1>
          <p className="text-sm text-muted-foreground">請確認您的認領清單與帳號資訊</p>
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
              const currentQty = adjustedQuantities[item.needId] || item.quantity || 1
              
              return (
                <div key={item.needId} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">{category?.icon || '📦'}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <div className="mt-1">
                        <Badge variant="outline" className={category?.color || ''}>
                          {category?.name || item.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mt-2 bg-slate-50 p-2 rounded items-center">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">認領數量</label>
                      <div className="flex items-center gap-2">
                        <Input 
                            type="number" 
                            min={1} 
                            value={currentQty}
                            onChange={(e) => {
                                const val = parseInt(e.target.value) || 0
                                setAdjustedQuantities(prev => ({ ...prev, [item.needId]: val }))
                            }}
                            className="h-8 w-24 bg-white"
                        />
                        <span className="font-medium text-slate-600">{item.unit}</span>
                      </div>
                    </div>
                    {item.estimatedDelivery && (
                      <div>
                        <span className="text-muted-foreground block mb-1">預計送達</span>
                        <span className="font-medium">{item.estimatedDelivery}</span>
                      </div>
                    )}
                    {item.availableTimeSlots && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground block mb-1">可參與時間</span>
                        <span className="font-medium">{item.availableTimeSlots}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Contact Info (Read Only) */}
        <Card>
          <CardHeader>
            <CardTitle>認領身份</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg border">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1">認領人姓名</label>
                        <p className="font-medium">{user?.name || '未知'}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1">聯絡信箱</label>
                        <p className="font-medium">{user?.email || '無'}</p>
                    </div>
                 </div>
                 <div className="mt-2 text-xs text-muted-foreground">
                    * 系統將自動使用您目前的帳號身份進行認領
                 </div>
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
          <Button type="button" variant="outline" onClick={() => navigate('/requests')} className="flex-1">
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

