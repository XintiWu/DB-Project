import { useState } from 'react'
import type { Need } from '../lib/types'
import { useClaimContext } from '../context/ClaimContext'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { ALL_CATEGORIES } from '../lib/constants'
import { motion } from 'framer-motion'

interface ClaimDialogProps {
  need: Need
  onClose: () => void
}

export function ClaimDialog({ need, onClose }: ClaimDialogProps) {
  const { addToClaimList } = useClaimContext()
  const category = ALL_CATEGORIES[need.category as keyof typeof ALL_CATEGORIES]
  
  const [quantity, setQuantity] = useState<number>(1)
  const [note, setNote] = useState('')
  
  // Material specific
  const [estimatedDelivery, setEstimatedDelivery] = useState('')
  const [materialSource, setMaterialSource] = useState('')
  
  // Rescue specific
  const [availableDate, setAvailableDate] = useState('')
  const [availableStartTime, setAvailableStartTime] = useState('')
  const [availableEndTime, setAvailableEndTime] = useState('')
  const [qualifications, setQualifications] = useState('')

  const isMaterialOrTool = need.needType === 'Material' || need.needType === 'Tool'
  const remaining = need.requiredQuantity - need.currentQuantity

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (quantity <= 0 || quantity > remaining) {
      alert(`請輸入有效的數量（1-${remaining}）`)
      return
    }

    const additionalInfo: any = { note }
    
    if (isMaterialOrTool) {
      additionalInfo.estimatedDelivery = estimatedDelivery
      additionalInfo.materialSource = materialSource
    } else {
      const availableTimeSlots = availableDate && availableStartTime && availableEndTime
        ? `${availableDate} ${availableStartTime}-${availableEndTime}`
        : ''
      
      if (!availableTimeSlots) {
        alert('請選擇可參與的日期和時間')
        return
      }
      
      additionalInfo.availableTimeSlots = availableTimeSlots
      additionalInfo.qualifications = qualifications
    }

    addToClaimList(need, quantity, additionalInfo)
    onClose()
  }

  return (
    <div className="fixed top-0 left-0 h-screen w-screen z-[9999] flex items-center justify-center p-4">
      <motion.div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        onClick={onClose}
      />
      <motion.div 
        layoutId={`need-${need.id}`}
        className="relative z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white/85 backdrop-blur-xl shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <CardTitle>{need.title}</CardTitle>
                  <CardDescription>{need.location}</CardDescription>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div>
                <Badge variant="outline" className={category.color}>
                  {category.name}
                </Badge>
              </div>

              {/* Info */}
              <div className="bg-slate-50/50 p-3 rounded-lg space-y-2 text-sm">
                <p><span className="font-medium">需求數量：</span>{need.requiredQuantity} {need.unit}</p>
                <p><span className="font-medium">剩餘需求：</span>{remaining} {need.unit}</p>
                
                <div className="border-t border-slate-200/50 pt-2 mt-2">
                  <p className="font-medium mb-1">詳細需求內容：</p>
                  {isMaterialOrTool ? (
                    <div className="space-y-1 pl-2">
                      {(need as any).items && (need as any).items.length > 0 ? (
                        (need as any).items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-slate-600">
                            <span className="font-medium">{item.itemName}</span>
                            <span>x {item.quantity} {item.unit}</span>
                            {item.isTool && <Badge variant="outline" className="text-[10px] h-4 px-1">工具</Badge>}
                          </div>
                        ))
                      ) : (need.needType === 'Tool' && (need as any).equipments && (need as any).equipments.length > 0) ? (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">所需設備:</p>
                          <ul className="list-disc list-inside">
                            {(need as any).equipments.map((e: any, i: number) => (
                              <li key={i} className="text-slate-600">{e.equipmentName} x {e.quantity}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p>{need.itemName}</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 pl-2">
                      {(need as any).headcount && <p>需求人數: {(need as any).headcount} 人</p>}
                      
                      {(need as any).skills && (need as any).skills.length > 0 && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">所需技能:</p>
                          <div className="flex flex-wrap gap-1">
                            {(need as any).skills.map((s: any, i: number) => (
                              <Badge key={i} variant="secondary" className="text-[10px]">
                                {s.skillName} {s.quantity ? `x${s.quantity}` : ''}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <p><span className="font-medium">時間需求：</span>{(need as any).timeSlots}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  認領數量 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    min="1"
                    max={remaining}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    required
                    className="flex-1 bg-white/50"
                  />
                  <span className="text-sm text-muted-foreground">{need.unit}</span>
                </div>
              </div>

              {/* Material/Tool Fields */}
              {isMaterialOrTool && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">預計送達時間</label>
                    <Input
                      type="date"
                      value={estimatedDelivery}
                      onChange={(e) => setEstimatedDelivery(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="bg-white/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">物資來源</label>
                    <Input
                      placeholder="例如：自有庫存、採購..."
                      value={materialSource}
                      onChange={(e) => setMaterialSource(e.target.value)}
                      className="bg-white/50"
                    />
                  </div>
                </>
              )}

              {/* Manpower/Rescue Fields */}
              {!isMaterialOrTool && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      可參與時間 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid gap-3">
                      <Input
                        type="date"
                        value={availableDate}
                        onChange={(e) => setAvailableDate(e.target.value)}
                        required
                        className="bg-white/50"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="time"
                          value={availableStartTime}
                          onChange={(e) => setAvailableStartTime(e.target.value)}
                          required
                          className="bg-white/50"
                        />
                        <Input
                          type="time"
                          value={availableEndTime}
                          onChange={(e) => setAvailableEndTime(e.target.value)}
                          required
                          className="bg-white/50"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">相關資格/經驗</label>
                    <Input
                      placeholder="例如：護理師執照..."
                      value={qualifications}
                      onChange={(e) => setQualifications(e.target.value)}
                      className="bg-white/50"
                    />
                  </div>
                </>
              )}

              {/* Note */}
              <div>
                <label className="text-sm font-medium mb-2 block">備註說明</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-white/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="其他補充說明..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </CardContent>

            <CardFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-white/50 hover:bg-white/80">
                取消
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                加入認領清單
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
