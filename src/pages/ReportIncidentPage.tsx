import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { incidentAPI } from '../services/api'
import { INCIDENT_TYPES, HUALIEN_AREAS } from '../lib/constants'
import type { ReportIncidentFormData } from '../lib/types'

export function ReportIncidentPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState<ReportIncidentFormData>({
    title: '',
    type: '土石流',
    severity: 3,
    address: '',
    latitude: undefined,
    longitude: undefined,
    msg: '',
    reporter_id: `USER${Date.now()}` // 臨時ID，實際應從登入系統獲取
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.address || !formData.msg) {
      alert('請填寫所有必填欄位')
      return
    }

    setLoading(true)
    try {
      const result = await incidentAPI.create(formData)
      
      if (result.success) {
        // 導向成功頁面
        navigate('/incidents/report/success')
      } else {
        alert(result.message || '通報失敗，請稍後再試')
      }
    } catch (error) {
      alert('通報失敗，請稍後再試')
      console.error('Error reporting incident:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="cursor-pointer" onClick={() => navigate('/incidents')}>
              <h1 className="text-2xl font-bold text-primary dark:text-slate-100">🚨 通報災情</h1>
              <p className="text-sm text-muted-foreground dark:text-slate-400">請詳細填寫災情資訊</p>
            </div>
            <Button variant="ghost" onClick={() => navigate('/incidents')}>
              ← 返回列表
            </Button>
          </div>
        </div>
      </header>

      {/* 表單 */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 space-y-6">
          {/* 提示訊息 */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
              ⚠️ 通報須知
            </h3>
            <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1 list-disc list-inside">
              <li>請確保提供的資訊真實準確</li>
              <li>緊急情況請先撥打 119 或 110</li>
              <li>通報後將由管理員審核確認</li>
            </ul>
          </div>

          {/* 災情標題 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              災情標題 <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="例如：馬太鞍溪土石流災情"
              required
            />
          </div>

          {/* 災情類型與嚴重程度 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                災情類型 <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                required
              >
                {Object.keys(INCIDENT_TYPES).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                嚴重程度 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.severity}
                  onChange={(e) => setFormData(prev => ({ ...prev, severity: parseInt(e.target.value) }))}
                  className="flex-1"
                />
                <span className="text-2xl font-bold text-primary dark:text-blue-400 w-12 text-center">
                  {formData.severity}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span>輕微</span>
                <span>嚴重</span>
              </div>
            </div>
          </div>

          {/* 地點 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              災情地點 <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="例如：花蓮縣光復鄉馬太鞍溪"
              required
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              請提供詳細地址或明確地標
            </p>
          </div>

          {/* 座標（選填） */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                緯度（選填）
              </label>
              <Input
                type="number"
                step="0.000001"
                value={formData.latitude || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value ? parseFloat(e.target.value) : undefined }))}
                placeholder="例如：23.654321"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                經度（選填）
              </label>
              <Input
                type="number"
                step="0.000001"
                value={formData.longitude || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value ? parseFloat(e.target.value) : undefined }))}
                placeholder="例如：121.456789"
              />
            </div>
          </div>

          {/* 詳細描述 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              詳細描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.msg}
              onChange={(e) => setFormData(prev => ({ ...prev, msg: e.target.value }))}
              placeholder="請詳細描述災情狀況、受災範圍、急迫性等資訊..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100 min-h-[150px]"
              required
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              請提供越詳細越好，有助於救援行動的規劃
            </p>
          </div>

          {/* 按鈕 */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/incidents')}
              className="flex-1"
              disabled={loading}
            >
              取消
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              {loading ? '提交中...' : '🚨 提交通報'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

