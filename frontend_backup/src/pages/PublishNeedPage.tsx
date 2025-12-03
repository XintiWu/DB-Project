import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import type { NeedType, PublishNeedFormData } from '../lib/types'
import { MATERIAL_CATEGORIES, RESCUE_CATEGORIES, REGIONS, SEVERITY_INFO } from '../lib/constants'
import { generateId } from '../lib/utils'

export function PublishNeedPage() {
  const navigate = useNavigate()
  
  const [needType, setNeedType] = useState<NeedType>('material')
  const [formData, setFormData] = useState<Partial<PublishNeedFormData>>({
    needType: 'material',
    severity: 'medium',
    region: '東部'
  })

  const categories = needType === 'material' 
    ? Object.values(MATERIAL_CATEGORIES)
    : Object.values(RESCUE_CATEGORIES)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 驗證必填欄位
    if (!formData.title || !formData.location || !formData.category || 
        !formData.itemName || !formData.requiredQuantity || !formData.unit ||
        !formData.deadline || !formData.description || !formData.publisherName ||
        !formData.contactPhone) {
      alert('請填寫所有必填欄位')
      return
    }

    // 救災需求的額外驗證
    if (needType === 'rescue') {
      if (!formData.timeSlotsDate || !formData.timeSlotsStartTime || !formData.timeSlotsEndTime) {
        alert('救災需求請填寫完整的時間需求')
        return
      }
      // 組合時間格式
      formData.timeSlots = `${formData.timeSlotsDate} ${formData.timeSlotsStartTime}-${formData.timeSlotsEndTime}`
    }

    // 生成需求 ID 和管理金鑰
    const needId = 'N' + generateId().slice(0, 10)
    const managementKey = 'KEY-' + generateId()

    // 建立需求記錄（在真實應用中會送到後端）
    const newNeed = {
      ...formData,
      id: needId,
      needType,
      currentQuantity: 0,
      status: 'urgent',
      createdAt: new Date().toISOString().split('T')[0],
      managementKey
    }

    // 儲存到 localStorage（模擬後端）
    const existingNeeds = JSON.parse(localStorage.getItem('published-needs') || '[]')
    existingNeeds.push(newNeed)
    localStorage.setItem('published-needs', JSON.stringify(existingNeeds))

    // 跳轉到成功頁面
    navigate('/publish/success', { state: { need: newNeed } })
  }

  const handleChange = (field: keyof PublishNeedFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNeedTypeChange = (type: NeedType) => {
    setNeedType(type)
    setFormData(prev => ({ 
      ...prev, 
      needType: type,
      category: undefined // 重置類別
    }))
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
              <h1 className="text-2xl font-bold">發布新需求</h1>
              <p className="text-sm text-muted-foreground">填寫需求資訊，尋求資源協助</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 需求類型選擇 */}
          <Card>
            <CardHeader>
              <CardTitle>需求類型</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleNeedTypeChange('material')}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    needType === 'material' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-4xl mb-2">📦</div>
                  <div className="font-semibold">物資需求</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    食物、飲水、衣物、醫療物資等
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleNeedTypeChange('rescue')}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    needType === 'rescue' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-4xl mb-2">🚨</div>
                  <div className="font-semibold">救災需求</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    人力、設備、專業服務等
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* 基本資訊 */}
          <Card>
            <CardHeader>
              <CardTitle>基本資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  需求標題 <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="例如：急需白米 - 馬太鞍溪災區"
                  value={formData.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    地區 <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={formData.region || ''}
                    onChange={(e) => handleChange('region', e.target.value)}
                    required
                  >
                    <option value="">請選擇</option>
                    {REGIONS.filter(r => r !== '全部').map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    緊急程度 <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={formData.severity || ''}
                    onChange={(e) => handleChange('severity', e.target.value)}
                    required
                  >
                    {Object.entries(SEVERITY_INFO).map(([key, info]) => (
                      <option key={key} value={key}>{info.name}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  具體地點 <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="例如：花蓮縣光復鄉馬太鞍部落"
                  value={formData.location || ''}
                  onChange={(e) => handleChange('location', e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* 需求詳情 */}
          <Card>
            <CardHeader>
              <CardTitle>需求詳情</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  類別 <span className="text-destructive">*</span>
                </label>
                <Select
                  value={formData.category || ''}
                  onChange={(e) => handleChange('category', e.target.value)}
                  required
                >
                  <option value="">請選擇類別</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  項目名稱 <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="例如：白米、清理人力、挖土機..."
                  value={formData.itemName || ''}
                  onChange={(e) => handleChange('itemName', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    需求數量 <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="例如：200"
                    value={formData.requiredQuantity || ''}
                    onChange={(e) => handleChange('requiredQuantity', parseInt(e.target.value))}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    單位 <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="例如：公斤、人、台..."
                    value={formData.unit || ''}
                    onChange={(e) => handleChange('unit', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  截止時間 <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.deadline || ''}
                    onChange={(e) => handleChange('deadline', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="date-picker-left-icon"
                  />
                </div>
              </div>

              {/* 救災需求專用欄位 */}
              {needType === 'rescue' && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      時間需求 <span className="text-destructive">*</span>
                    </label>
                    
                    {/* 日期選擇 */}
                    <div className="mb-3">
                      <label className="text-xs text-muted-foreground mb-1 block">日期</label>
                      <div className="relative">
                        <Input
                          type="date"
                          value={formData.timeSlotsDate || ''}
                          onChange={(e) => handleChange('timeSlotsDate', e.target.value)}
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
                            handleChange('timeSlotsStartTime', '08:00')
                            handleChange('timeSlotsEndTime', '12:00')
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
                            handleChange('timeSlotsStartTime', '13:00')
                            handleChange('timeSlotsEndTime', '17:00')
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
                            handleChange('timeSlotsStartTime', '08:00')
                            handleChange('timeSlotsEndTime', '17:00')
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
                            value={formData.timeSlotsStartTime || ''}
                            onChange={(e) => handleChange('timeSlotsStartTime', e.target.value)}
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
                            value={formData.timeSlotsEndTime || ''}
                            onChange={(e) => handleChange('timeSlotsEndTime', e.target.value)}
                            required
                            className="time-picker-left-icon"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* 顯示已選擇的時間 */}
                    {formData.timeSlotsDate && formData.timeSlotsStartTime && formData.timeSlotsEndTime && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                        ✓ 已選擇：{formData.timeSlotsDate} {formData.timeSlotsStartTime}-{formData.timeSlotsEndTime}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      技能/資格需求
                    </label>
                    <Input
                      placeholder="例如：護理師執照、無需專業技能..."
                      value={formData.requiredSkills || ''}
                      onChange={(e) => handleChange('requiredSkills', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      提供的支援
                    </label>
                    <Input
                      placeholder="例如：提供午餐、交通補助、保險..."
                      value={formData.providedSupport || ''}
                      onChange={(e) => handleChange('providedSupport', e.target.value)}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">
                  詳細說明 <span className="text-destructive">*</span>
                </label>
                <textarea
                  className="flex min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="請詳細說明需求的背景、用途、注意事項等..."
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* 聯絡資訊 */}
          <Card>
            <CardHeader>
              <CardTitle>聯絡資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  發布者姓名/組織 <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="例如：馬太鞍社區發展協會"
                  value={formData.publisherName || ''}
                  onChange={(e) => handleChange('publisherName', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  聯絡電話 <span className="text-destructive">*</span>
                </label>
                <Input
                  type="tel"
                  placeholder="例如：03-8701234"
                  value={formData.contactPhone || ''}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  聯絡信箱
                </label>
                <Input
                  type="email"
                  placeholder="例如：contact@example.com"
                  value={formData.contactEmail || ''}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 注意事項 */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 text-blue-700">📋 發布需求須知</h3>
              <ul className="text-sm space-y-1 text-blue-600">
                <li>• 需求發布後會公開在平台上供大眾瀏覽</li>
                <li>• 您會獲得管理金鑰，可用於後續更新需求狀態</li>
                <li>• 請確保聯絡資訊正確，以便認領者與您聯繫</li>
                <li>• 請定期更新需求狀態，避免資源重複配送</li>
              </ul>
            </CardContent>
          </Card>

          {/* 送出按鈕 */}
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/')} className="flex-1">
              取消
            </Button>
            <Button type="submit" className="flex-1" size="lg">
              發布需求
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}


