import { useParams, useNavigate } from 'react-router-dom'
import { useIncident } from '../hooks/useIncidentData'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Card } from '../components/ui/card'
import { INCIDENT_TYPES, INCIDENT_SEVERITY_INFO, INCIDENT_STATUS_INFO, REVIEW_STATUS_INFO } from '../lib/constants'

export function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { incident, loading, error } = useIncident(id!)

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-slate-600 dark:text-slate-400">載入中...</p>
        </div>
      </div>
    )
  }

  if (error || !incident) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-600 dark:text-red-400">{error || '找不到災情資料'}</p>
          <Button onClick={() => navigate('/incidents')} className="mt-4">
            返回列表
          </Button>
        </div>
      </div>
    )
  }

  const typeInfo = INCIDENT_TYPES[incident.type as keyof typeof INCIDENT_TYPES] || { icon: '⚠️', color: 'bg-slate-100 text-slate-700' }
  const severityInfo = INCIDENT_SEVERITY_INFO[incident.severity as keyof typeof INCIDENT_SEVERITY_INFO] || INCIDENT_SEVERITY_INFO[3] || { name: '中等', color: 'text-yellow-700', bgColor: 'bg-yellow-50', badge: 'bg-yellow-500 text-white' }
  const statusInfo = INCIDENT_STATUS_INFO[incident.status] || { name: '發生中', color: 'text-red-600', badge: 'bg-red-100 text-red-700' }
  const reviewInfo = incident.review_status ? (REVIEW_STATUS_INFO[incident.review_status] || null) : null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary dark:text-slate-100">🚨 災情詳情</h1>
            <Button variant="ghost" onClick={() => navigate('/incidents')}>
              ← 返回列表
            </Button>
          </div>
        </div>
      </header>

      {/* 內容 */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
          {/* 標題與標籤 */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{typeInfo.icon}</span>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                {incident.title}
              </h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`${typeInfo.color} border`}>
                {incident.type}
              </Badge>
              <Badge className={severityInfo.badge}>
                {severityInfo.name} Lv.{incident.severity}
              </Badge>
              <Badge className={statusInfo.badge}>
                {statusInfo.name}
              </Badge>
              {reviewInfo && (
                <Badge className={reviewInfo.badge}>
                  {reviewInfo.icon} {reviewInfo.name}
                </Badge>
              )}
            </div>
          </div>

          {/* 地點資訊 */}
          <div className="mb-6 pb-6 border-b dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">📍 地點資訊</h3>
            <div className="space-y-2 text-slate-700 dark:text-slate-300">
              <div><strong>區域：</strong>{incident.area_id}</div>
              <div><strong>地址：</strong>{incident.address}</div>
              {incident.latitude && incident.longitude && (
                <div>
                  <strong>座標：</strong>
                  {incident.latitude.toFixed(6)}, {incident.longitude.toFixed(6)}
                  <a
                    href={`https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    在地圖上查看 →
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* 詳細描述 */}
          <div className="mb-6 pb-6 border-b dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">📝 詳細描述</h3>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {incident.msg}
            </p>
          </div>

          {/* 時間軸 */}
          <div className="mb-6">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">⏰ 時間軸</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">通報時間</div>
                  <div className="font-medium text-slate-800 dark:text-slate-100">
                    {formatDateTime(incident.reported_at)}
                  </div>
                </div>
              </div>
              
              {incident.reviewed_at && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">審核時間</div>
                    <div className="font-medium text-slate-800 dark:text-slate-100">
                      {formatDateTime(incident.reviewed_at)}
                    </div>
                    {incident.review_note && (
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        備註：{incident.review_note}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 通報者資訊 */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              通報者 ID：{incident.reporter_id}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

