import { useNavigate } from 'react-router-dom'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import type { Incident } from '../lib/types'
import { INCIDENT_TYPES, INCIDENT_SEVERITY_INFO, INCIDENT_STATUS_INFO, REVIEW_STATUS_INFO } from '../lib/constants'

interface IncidentCardProps {
  incident: Incident
}

export function IncidentCard({ incident }: IncidentCardProps) {
  const navigate = useNavigate()
  
  const typeInfo = INCIDENT_TYPES[incident.type as keyof typeof INCIDENT_TYPES] || { icon: '⚠️', color: 'bg-slate-100 text-slate-700' }
  const severityInfo = INCIDENT_SEVERITY_INFO[incident.severity as keyof typeof INCIDENT_SEVERITY_INFO] || INCIDENT_SEVERITY_INFO[3] || { name: '中等', color: 'text-yellow-700', bgColor: 'bg-yellow-50', badge: 'bg-yellow-500 text-white' }
  const statusInfo = INCIDENT_STATUS_INFO[incident.status] || { name: '發生中', color: 'text-red-600', badge: 'bg-red-100 text-red-700' }
  const reviewInfo = incident.review_status ? (REVIEW_STATUS_INFO[incident.review_status] || null) : null

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

  const handleClick = () => {
    navigate(`/incidents/${incident.incident_id}`)
  }

  return (
    <Card
      className="p-5 hover:shadow-lg transition-shadow cursor-pointer dark:bg-slate-800 dark:border-slate-700"
      onClick={handleClick}
    >
      {/* 標題與嚴重程度 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{typeInfo.icon}</span>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {incident.title}
            </h3>
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
      </div>

      {/* 地點資訊 */}
      <div className="mb-3">
        <div className="flex items-start gap-2 text-sm">
          <span className="text-slate-600 dark:text-slate-400">📍</span>
          <div>
            <div className="text-slate-700 dark:text-slate-300 font-medium">
              {incident.area_id}
            </div>
            <div className="text-slate-600 dark:text-slate-400">
              {incident.address}
            </div>
          </div>
        </div>
      </div>

      {/* 詳細描述 */}
      <div className="mb-3">
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
          {incident.msg}
        </p>
      </div>

      {/* 時間資訊 */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t dark:border-slate-700 pt-3">
        <div className="flex items-center gap-1">
          <span>⏰</span>
          <span>通報時間：{formatDateTime(incident.reported_at)}</span>
        </div>
        {incident.reviewed_at && (
          <div className="flex items-center gap-1">
            <span>✓</span>
            <span>審核時間：{formatDateTime(incident.reviewed_at)}</span>
          </div>
        )}
      </div>

      {/* 座標資訊（小字） */}
      {incident.latitude && incident.longitude && (
        <div className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          📍 座標：{incident.latitude.toFixed(6)}, {incident.longitude.toFixed(6)}
        </div>
      )}
    </Card>
  )
}
