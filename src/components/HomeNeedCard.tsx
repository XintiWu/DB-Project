import type { Need, RescueNeed } from '../lib/types'
import { Card, CardContent, CardHeader } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { ALL_CATEGORIES, SEVERITY_INFO, STATUS_INFO } from '../lib/constants'
import { calculateProgress } from '../lib/utils'

interface HomeNeedCardProps {
  need: Need
}

export function HomeNeedCard({ need }: HomeNeedCardProps) {
  const category = ALL_CATEGORIES[need.category]
  const severity = SEVERITY_INFO[need.severity]
  const status = STATUS_INFO[need.status]
  const progress = calculateProgress(need.currentQuantity, need.requiredQuantity)

  const isMaterial = need.needType === 'material'
  const isUrgent = need.status === 'urgent' || need.severity === 'critical'

  return (
    <Card className={`hover:shadow-lg transition-shadow h-full flex flex-col ${isUrgent ? 'border-red-300 border-2' : ''}`}>
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-2xl">{category.icon}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-2">{need.title}</h3>
              <p className="text-sm text-muted-foreground">{need.location}</p>
            </div>
          </div>
          <Badge className={severity.badge}>
            {severity.name}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex-1 flex flex-col">
        {/* 類別與狀態 */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={category.color}>
            {category.name}
          </Badge>
          <Badge variant="outline" className={status.badge}>
            {status.name}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {need.region}
          </span>
        </div>

        {/* 需求資訊 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">{need.itemName}</span>
            <span className="text-muted-foreground">
              {need.currentQuantity} / {need.requiredQuantity} {need.unit}
            </span>
          </div>
          <Progress value={need.currentQuantity} max={need.requiredQuantity} />
          <p className="text-xs text-muted-foreground text-right">
            已認領 {progress}%
          </p>
        </div>

        {/* 救災需求特有資訊 */}
        {!isMaterial && (
          <div className="space-y-1 text-sm bg-slate-50 p-2 rounded">
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground">⏰ 時間：</span>
              <span className="flex-1">{(need as RescueNeed).timeSlots}</span>
            </div>
            {(need as RescueNeed).requiredSkills && (
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground">🎓 需求：</span>
                <span className="flex-1">{(need as RescueNeed).requiredSkills}</span>
              </div>
            )}
          </div>
        )}

        {/* 說明 */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {need.description}
        </p>

        {/* 截止時間 */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>📅 截止：{need.deadline}</span>
        </div>

        {/* 聯絡資訊 */}
        <div className="text-xs text-muted-foreground">
          <span>發布者：{need.publisherName}</span>
        </div>
      </CardContent>
    </Card>
  )
}
