import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { useTheme } from '../context/ThemeContext'
import type { NeedType, PublishNeedFormData } from '../lib/types'
import { MATERIAL_CATEGORIES, RESCUE_CATEGORIES, REGIONS, SEVERITY_INFO } from '../lib/constants'
import { generateId } from '../lib/utils'

export function PublishNeedPage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 sticky top-0 z-40 backdrop-blur-lg bg-opacity-95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                ← 返回首頁
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">發布新需求</h1>
                <p className="text-sm text-muted-foreground dark:text-slate-400">填寫需求資訊，尋求資源協助</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {theme === 'dark' ? '🌞' : '🌙'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/incidents')}>
                🚨 災情通報
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/inventory')}>
                📦 物資查詢
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 功能區分提示 */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              <span>📋</span> 您正在：發布需求
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              用於請求物資或人力支援，例如：需要食物、飲水、志工協助等
            </p>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
              <span>🚨</span> 如果要通報災情
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
              用於通報災害事件（土石流、淹水、道路坍方等）
            </p>
            <Button 
              type="button"
              size="sm" 
              variant="outline"
              onClick={() => navigate('/incidents/report')}
              className="w-full"
            >
              前往災情通報 →
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 需求類型選擇 */}
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="dark:text-slate-100">需求類型</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleNeedTypeChange('material')}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    needType === 'material' 
                      ? 'border-primary bg-primary/5 dark:bg-primary/20' 
                      : 'border-border dark:border-slate-600 hover:border-primary/50 dark:hover:border-primary/50'
                  }`}
                >
                  <div className="text-4xl mb-2">📦</div>
                  <div className="font-semibold dark:text-slate-100">物資需求</div>
                  <div className="text-xs text-muted-foreground dark:text-slate-400 mt-1">
                    食物、飲水、衣物、醫療物資等
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleNeedTypeChange('rescue')}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    needType === 'rescue' 
                      ? 'border-primary bg-primary/5 dark:bg-primary/20' 
                      : 'border-border dark:border-slate-600 hover:border-primary/50 dark:hover:border-primary/50'
                  }`}
                >
                  <div className="text-4xl mb-2">🚨</div>
                  <div className="font-semibold dark:text-slate-100">救災需求</div>
                  <div className="text-xs text-muted-foreground dark:text-slate-400 mt-1">
                    人力、設備、專業服務等
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* 基本資訊 */}
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="dark:text-slate-100">基本資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block dark:text-slate-300">
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
                  <label className="text-sm font-medium mb-2 block dark:text-slate-300">
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
                  <label className="text-sm font-medium mb-2 block dark:text-slate-300">
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
                <label className="text-sm font-medium mb-2 block dark:text-slate-300">
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
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="dark:text-slate-100">需求詳情</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block dark:text-slate-300">
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
                <label className="text-sm font-medium mb-2 block dark:text-slate-300">
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
                  <label className="text-sm font-medium mb-2 block dark:text-slate-300">
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
                  <label className="text-sm font-medium mb-2 block dark:text-slate-300">
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
                <label className="text-sm font-medium mb-2 block dark:text-slate-300">
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
                    <label className="text-sm font-medium mb-2 block dark:text-slate-300">
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
                    <label className="text-sm font-medium mb-2 block dark:text-slate-300">
                      技能/資格需求
                    </label>
                    <Input
                      placeholder="例如：護理師執照、無需專業技能..."
                      value={formData.requiredSkills || ''}
                      onChange={(e) => handleChange('requiredSkills', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block dark:text-slate-300">
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
                <label className="text-sm font-medium mb-2 block dark:text-slate-300">
                  詳細說明 <span className="text-destructive">*</span>
                </label>
                <textarea
                  className="flex min-h-32 w-full rounded-md border border-input bg-background dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="請詳細說明需求的背景、用途、注意事項等..."
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* 聯絡資訊 */}
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="dark:text-slate-100">聯絡資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block dark:text-slate-300">
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
                <label className="text-sm font-medium mb-2 block dark:text-slate-300">
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
                <label className="text-sm font-medium mb-2 block dark:text-slate-300">
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
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">📋 發布需求須知</h3>
              <ul className="text-sm space-y-1 text-blue-600 dark:text-blue-400">
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


