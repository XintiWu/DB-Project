import { useState } from 'react'
import type { Need, RescueNeed } from '../lib/types'
import { useClaimContext } from '../context/ClaimContext'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { ALL_CATEGORIES } from '../lib/constants'

interface ClaimDialogProps {
  need: Need
  onClose: () => void
}

export function ClaimDialog({ need, onClose }: ClaimDialogProps) {
  const { addToClaimList } = useClaimContext()
  const category = ALL_CATEGORIES[need.category]
  
  const [quantity, setQuantity] = useState<number>(1)
  const [note, setNote] = useState('')
  
  // 物資需求專用
  const [estimatedDelivery, setEstimatedDelivery] = useState('')
  const [materialSource, setMaterialSource] = useState('')
  
  // 救災需求專用
  const [availableDate, setAvailableDate] = useState('')
  const [availableStartTime, setAvailableStartTime] = useState('')
  const [availableEndTime, setAvailableEndTime] = useState('')
  const [qualifications, setQualifications] = useState('')

  const isMaterial = need.needType === 'material'
  const remaining = need.requiredQuantity - need.currentQuantity

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (quantity <= 0 || quantity > remaining) {
      alert(`請輸入有效的數量（1-${remaining}）`)
      return
    }

    const additionalInfo: any = { note }
    
    if (isMaterial) {
      additionalInfo.estimatedDelivery = estimatedDelivery
      additionalInfo.materialSource = materialSource
    } else {
      // 組合日期和時間
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
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

            {/* 需求資訊 */}
            <div className="bg-muted p-3 rounded-lg space-y-1">
              <p className="text-sm">
                <span className="font-medium">項目：</span>{need.itemName}
              </p>
              <p className="text-sm">
                <span className="font-medium">需求數量：</span>
                {need.requiredQuantity} {need.unit}
              </p>
              <p className="text-sm">
                <span className="font-medium">剩餘需求：</span>
                {remaining} {need.unit}
              </p>
              {!isMaterial && (
                <>
                  <p className="text-sm">
                    <span className="font-medium">時間需求：</span>
                    {(need as RescueNeed).timeSlots}
                  </p>
                  {(need as RescueNeed).requiredSkills && (
                    <p className="text-sm">
                      <span className="font-medium">技能需求：</span>
                      {(need as RescueNeed).requiredSkills}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* 認領數量 */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                認領數量 <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  max={remaining}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  required
                  className="flex-1"
                />
                <span className="flex items-center text-sm text-muted-foreground">
                  {need.unit}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                最多可認領 {remaining} {need.unit}
              </p>
            </div>

            {/* 物資需求專用欄位 */}
            {isMaterial && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    預計送達時間
                  </label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={estimatedDelivery}
                      onChange={(e) => setEstimatedDelivery(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="date-picker-left-icon"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    物資來源
                  </label>
                  <Input
                    placeholder="例如：自有庫存、採購、企業捐贈..."
                    value={materialSource}
                    onChange={(e) => setMaterialSource(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* 救災需求專用欄位 */}
            {!isMaterial && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    可參與時間 <span className="text-destructive">*</span>
                  </label>
                  
                  {/* 日期選擇 */}
                  <div className="mb-3">
                    <label className="text-xs text-muted-foreground mb-1 block">日期</label>
                    <div className="relative">
                      <Input
                        type="date"
                        value={availableDate}
                        onChange={(e) => setAvailableDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        className="date-picker-left-icon"
                      />
                    </div>
                  </div>
                  
                  {/* 快速選擇時段 */}
                  <div className="mb-3">
                    <label className="text-xs text-muted-foreground mb-2 block">快速選擇時段</label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAvailableStartTime('08:00')
                          setAvailableEndTime('12:00')
                        }}
                        className="text-xs"
                      >
                        上午<br/>08:00-12:00
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAvailableStartTime('13:00')
                          setAvailableEndTime('17:00')
                        }}
                        className="text-xs"
                      >
                        下午<br/>13:00-17:00
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAvailableStartTime('08:00')
                          setAvailableEndTime('17:00')
                        }}
                        className="text-xs"
                      >
                        全天<br/>08:00-17:00
                      </Button>
                    </div>
                  </div>
                  
                  {/* 時間選擇 */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">開始時間</label>
                      <div className="relative">
                        <Input
                          type="time"
                          value={availableStartTime}
                          onChange={(e) => setAvailableStartTime(e.target.value)}
                          required
                          className="time-picker-left-icon"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">結束時間</label>
                      <div className="relative">
                        <Input
                          type="time"
                          value={availableEndTime}
                          onChange={(e) => setAvailableEndTime(e.target.value)}
                          required
                          className="time-picker-left-icon"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* 顯示已選擇的時間 */}
                  {availableDate && availableStartTime && availableEndTime && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                      ✓ 已選擇：{availableDate} {availableStartTime}-{availableEndTime}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    相關資格/經驗
                  </label>
                  <Input
                    placeholder="例如：護理師執照、搬運經驗..."
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* 備註 */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                備註說明
              </label>
              <textarea
                className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="其他補充說明..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </CardContent>

          <CardFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              取消
            </Button>
            <Button type="submit" className="flex-1">
              加入認領清單
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}


