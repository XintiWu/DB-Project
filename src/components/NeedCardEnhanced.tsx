import type { Need, RescueNeed } from '../lib/types'
import { Card, CardContent, CardFooter, CardHeader } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { ALL_CATEGORIES, SEVERITY_INFO, STATUS_INFO } from '../lib/constants'
import { calculateProgress } from '../lib/utils'
import { useTheme } from '../context/ThemeContext'

interface NeedCardEnhancedProps {
  need: Need
  onClaim: (need: Need) => void
}

export function NeedCardEnhanced({ need, onClaim }: NeedCardEnhancedProps) {
  const { version } = useTheme()
  const category = ALL_CATEGORIES[need.category]
  const severity = SEVERITY_INFO[need.severity]
  const status = STATUS_INFO[need.status]
  const progress = calculateProgress(need.currentQuantity, need.requiredQuantity)

  const isMaterial = need.needType === 'material'
  const isUrgent = need.status === 'urgent' || need.severity === 'critical'

  // 如果是經典版，返回原始樣式
  if (version === 'classic') {
    return (
      <Card className={`hover:shadow-lg transition-shadow dark:bg-slate-800 dark:border-slate-700 ${isUrgent ? 'border-red-300 border-2' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-2xl">{category.icon}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-lg line-clamp-2 dark:text-slate-100">{need.title}</h3>
                <p className="text-sm text-muted-foreground dark:text-slate-400">{need.location}</p>
              </div>
            </div>
            <Badge className={severity.badge}>
              {severity.name}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={category.color}>
              {category.name}
            </Badge>
            <Badge variant="outline" className={status.badge}>
              {status.name}
            </Badge>
            <span className="text-xs text-muted-foreground dark:text-slate-400">
              {need.region}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium dark:text-slate-200">{need.itemName}</span>
              <span className="text-muted-foreground dark:text-slate-400">
                {need.currentQuantity} / {need.requiredQuantity} {need.unit}
              </span>
            </div>
            <Progress value={need.currentQuantity} max={need.requiredQuantity} />
            <p className="text-xs text-muted-foreground dark:text-slate-400 text-right">
              已認領 {progress}%
            </p>
          </div>

          {!isMaterial && (
            <div className="space-y-1 text-sm bg-slate-50 dark:bg-slate-700/50 p-2 rounded">
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground dark:text-slate-400">⏰ 時間：</span>
                <span className="flex-1 dark:text-slate-200">{(need as RescueNeed).timeSlots}</span>
              </div>
              {(need as RescueNeed).requiredSkills && (
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground dark:text-slate-400">🎓 需求：</span>
                  <span className="flex-1 dark:text-slate-200">{(need as RescueNeed).requiredSkills}</span>
                </div>
              )}
            </div>
          )}

          <p className="text-sm text-muted-foreground dark:text-slate-400 line-clamp-2">
            {need.description}
          </p>

          <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-slate-400">
            <span>📅 截止：{need.deadline}</span>
          </div>

          <div className="text-xs text-muted-foreground dark:text-slate-400">
            <span>發布者：{need.publisherName}</span>
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <Button 
            onClick={() => onClaim(need)}
            className="w-full"
            disabled={need.status === 'fulfilled' || need.status === 'closed'}
            variant={isUrgent ? 'default' : 'outline'}
          >
            {need.status === 'fulfilled' ? '已滿足' : 
             need.status === 'closed' ? '已關閉' : 
             '🤝 認領此需求'}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // 增強版樣式
  return (
    <Card 
      className={`
        group relative overflow-hidden
        transition-all duration-300 ease-in-out
        hover:shadow-2xl hover:-translate-y-2
        dark:bg-slate-800 dark:border-slate-700
        ${isUrgent ? 'urgent-card' : ''}
      `}
    >
      {/* 緊急需求的脈衝效果 */}
      {isUrgent && (
        <div className="absolute inset-0 border-2 border-red-500 rounded-lg animate-pulse-border pointer-events-none"></div>
      )}

      {/* 漸變背景 */}
      {isUrgent && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent dark:from-red-950/20 pointer-events-none"></div>
      )}

      <CardHeader className="pb-3 relative">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <div className="text-3xl transform group-hover:scale-110 transition-transform duration-300">
              {category.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-2 dark:text-slate-100 group-hover:text-primary transition-colors">
                {need.title}
              </h3>
              <p className="text-sm text-muted-foreground dark:text-slate-400 flex items-center gap-1">
                📍 {need.location}
              </p>
            </div>
          </div>
          <Badge className={`${severity.badge} transform group-hover:scale-105 transition-transform`}>
            {severity.name}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 relative">
        {/* 類別與狀態 */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={`${category.color} transition-all group-hover:shadow-md`}>
            {category.name}
          </Badge>
          <Badge variant="outline" className={`${status.badge} transition-all group-hover:shadow-md`}>
            {status.name}
          </Badge>
          <span className="text-xs text-muted-foreground dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
            🗺️ {need.region}
          </span>
        </div>

        {/* 需求資訊 - 增強版進度條 */}
        <div className="space-y-2 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium dark:text-slate-200">📦 {need.itemName}</span>
            <span className="text-muted-foreground dark:text-slate-400 font-semibold">
              {need.currentQuantity} / {need.requiredQuantity} {need.unit}
            </span>
          </div>
          <div className="relative">
            <Progress value={need.currentQuantity} max={need.requiredQuantity} className="h-3" />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">
              {progress}%
            </div>
          </div>
        </div>

        {/* 救災需求特有資訊 */}
        {!isMaterial && (
          <div className="space-y-2 text-sm bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900">
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground dark:text-slate-400">⏰</span>
              <div className="flex-1">
                <span className="text-xs text-muted-foreground dark:text-slate-400">時間需求</span>
                <p className="font-medium dark:text-slate-200">{(need as RescueNeed).timeSlots}</p>
              </div>
            </div>
            {(need as RescueNeed).requiredSkills && (
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground dark:text-slate-400">🎓</span>
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground dark:text-slate-400">技能需求</span>
                  <p className="font-medium dark:text-slate-200">{(need as RescueNeed).requiredSkills}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 說明 */}
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
          <p className="text-sm text-muted-foreground dark:text-slate-300 line-clamp-2">
            💬 {need.description}
          </p>
        </div>

        {/* 截止時間與發布者 */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-muted-foreground dark:text-slate-400">
            <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full">
              📅 {need.deadline}
            </span>
          </div>
          <div className="text-muted-foreground dark:text-slate-400">
            👤 {need.publisherName}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 relative">
        <Button 
          onClick={() => onClaim(need)}
          className={`
            w-full transform transition-all duration-300
            ${isUrgent ? 'animate-pulse-slow' : ''}
            hover:scale-105 active:scale-95
          `}
          disabled={need.status === 'fulfilled' || need.status === 'closed'}
          variant={isUrgent ? 'default' : 'outline'}
          size="lg"
        >
          {need.status === 'fulfilled' ? '✅ 已滿足' : 
           need.status === 'closed' ? '🔒 已關閉' : 
           '🤝 認領此需求'}
        </Button>
      </CardFooter>
    </Card>
  )
}

