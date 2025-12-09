import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClaimContext } from '../context/ClaimContext'
import { useAuth } from '../context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

import { Badge } from '../components/ui/badge'
import { ALL_CATEGORIES } from '../lib/constants'
import { submitClaim } from '../api/client'

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

      await submitClaim(claimData)

      clearClaimList()
      // Pass minimal info for success page if needed, or just status
      navigate('/claim/success', { state: { claimRecord: { ...claimData, id: 'PENDING', claimerName: user.name } } })
      
    } catch (err) {
      console.error('Claim failed:', err)
      alert('認領失敗，請稍後再試')
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
