import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { createRequest } from '../api/client'
import { MATERIAL_CATEGORIES, RESCUE_CATEGORIES, REGIONS } from '../lib/constants'
import type { NeedType, ResourceCategory, Severity } from '../lib/types'

export function PublishPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form State
  const [needType, setNeedType] = useState<NeedType>('material')
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [region, setRegion] = useState(REGIONS[1]) // Default to North
  const [category, setCategory] = useState<ResourceCategory>('food')
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState('個')
  const [severity, setSeverity] = useState<Severity>('medium')
  const [deadline, setDeadline] = useState('')
  const [description, setDescription] = useState('')
  
  // Rescue specific
  const [timeSlots, setTimeSlots] = useState('')
  const [requiredSkills, setRequiredSkills] = useState('')
  const [providedSupport, setProvidedSupport] = useState('')
  
  // Contact
  const [publisherName, setPublisherName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')

  const categories = needType === 'material' ? MATERIAL_CATEGORIES : RESCUE_CATEGORIES

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const data = {
        needType,
        title,
        location,
        region,
        category,
        itemName,
        requiredQuantity: quantity,
        unit,
        severity,
        deadline,
        description,
        publisherName,
        contactPhone,
        contactEmail,
        // Optional fields
        timeSlots: needType === 'rescue' ? timeSlots : undefined,
        requiredSkills: needType === 'rescue' ? requiredSkills : undefined,
        providedSupport: needType === 'rescue' ? providedSupport : undefined,
      }

      await createRequest(data)
      alert('需求發布成功！')
      navigate('/')
    } catch (err) {
      console.error('Publish failed:', err)
      alert('發布失敗，請稍後再試')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">發布救援需求</h1>
        <p className="text-muted-foreground mt-2">
          請詳細填寫需求資訊，以便我們能更快速地為您媒合資源。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>基本資訊</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Type Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">需求類型</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors flex-1">
                  <input
                    type="radio"
                    name="needType"
                    checked={needType === 'material'}
                    onChange={() => {
                      setNeedType('material')
                      setCategory('food')
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="font-medium">物資需求</span>
                </label>
                <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors flex-1">
                  <input
                    type="radio"
                    name="needType"
                    checked={needType === 'rescue'}
                    onChange={() => {
                      setNeedType('rescue')
                      setCategory('medical_staff')
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="font-medium">救災/人力需求</span>
                </label>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                標題 <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="請簡短描述需求 (例如：急需礦泉水 100 箱)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Location & Region */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">
                  詳細地點 <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="例如：花蓮縣花蓮市..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">區域</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                >
                  {REGIONS.filter(r => r !== '全部').map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium mb-2 block">類別</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.values(categories).map((cat) => (
                  <label
                    key={cat.id}
                    className={`
                      flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-all
                      ${category === cat.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'hover:bg-slate-50'}
                    `}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={cat.id}
                      checked={category === cat.id}
                      onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                      className="sr-only"
                    />
                    <span className="text-2xl mb-1">{cat.icon}</span>
                    <span className="text-xs font-medium">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>需求詳情</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Item Name & Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="text-sm font-medium mb-2 block">
                  項目名稱 <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="例如：礦泉水"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  數量 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  單位 <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="例如：箱、人"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Severity & Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">緊急程度</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as Severity)}
                >
                  <option value="low">低度 (一週內)</option>
                  <option value="medium">中度 (3天內)</option>
                  <option value="high">高度 (24小時內)</option>
                  <option value="critical">極緊急 (立即)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">截止時間</label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Rescue Specific */}
            {needType === 'rescue' && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">需求時段</label>
                  <Input
                    placeholder="例如：每日 08:00 - 17:00"
                    value={timeSlots}
                    onChange={(e) => setTimeSlots(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">所需技能/資格</label>
                  <Input
                    placeholder="例如：需具備護理師執照"
                    value={requiredSkills}
                    onChange={(e) => setRequiredSkills(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">提供支援</label>
                  <Input
                    placeholder="例如：提供午餐、交通補助"
                    value={providedSupport}
                    onChange={(e) => setProvidedSupport(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Description */}
            <div>
              <label className="text-sm font-medium mb-2 block">詳細說明</label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="請詳細描述需求背景、特殊要求等..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>聯絡資訊</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                聯絡人/單位 <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="請輸入聯絡人姓名或單位名稱"
                value={publisherName}
                onChange={(e) => setPublisherName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  聯絡電話 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  placeholder="例如：0912-345-678"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">聯絡信箱</label>
                <Input
                  type="email"
                  placeholder="例如：example@email.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/')} className="flex-1">
            取消
          </Button>
          <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" size="lg" disabled={isSubmitting}>
            {isSubmitting ? '處理中...' : '確認發布'}
          </Button>
        </div>
      </form>
    </div>
  )
}
