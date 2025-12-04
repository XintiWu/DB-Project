import { MapPin, Clock } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from './ui/card'
import { ALL_CATEGORIES, SEVERITY_INFO } from '../lib/constants'
import type { Need } from '../lib/types'
import { motion } from 'framer-motion'

interface NeedCardProps {
  need: Need
  onClick: (need: Need) => void
}

export function NeedCard({ need, onClick }: NeedCardProps) {
  const category = ALL_CATEGORIES[need.category as keyof typeof ALL_CATEGORIES]
  const severity = SEVERITY_INFO[need.severity]
  const remaining = need.requiredQuantity - need.currentQuantity

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="h-full"
    >
      <Card className="flex flex-col h-full hover:shadow-lg transition-all cursor-pointer" onClick={() => onClick(need)}>
        <CardHeader className="p-4 pb-2">
          {/* ... existing content ... */}
          <div className="flex justify-between items-start gap-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl" role="img" aria-label={category.name}>
                {category.icon}
              </span>
              <div>
                <h3 className="font-bold text-lg leading-tight line-clamp-1">
                  {need.title}
                </h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  <span className="line-clamp-1">{need.location}</span>
                </div>
              </div>
            </div>
            <Badge variant="outline" className={severity.bgColor + ' ' + severity.color + ' border-0'}>
              {severity.name}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 flex-1 space-y-3">
          <div className="flex gap-2 flex-wrap">
            {need.needType === 'manpower' && (need as any).skills?.length > 0 ? (
              (need as any).skills.map((skill: any, idx: number) => (
                <Badge key={idx} variant="secondary" className={category.color}>
                  {skill.skillName}
                </Badge>
              ))
            ) : need.needType === 'tool' && (need as any).equipments?.length > 0 ? (
              (need as any).equipments.map((equip: any, idx: number) => (
                <Badge key={idx} variant="secondary" className={category.color}>
                  {equip.equipmentName}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary" className={category.color}>
                {need.itemName || category.name}
              </Badge>
            )}
            
            {(need.needType === 'manpower' || need.needType === 'tool') && (
              <Badge variant="outline" className="bg-slate-50">
                <Clock className="h-3 w-3 mr-1" />
                {(need as any).timeSlots}
              </Badge>
            )}
          </div>

          <p className="text-sm text-slate-600 line-clamp-2">
            {need.description}
          </p>

          <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">需求項目</span>
              <span className="font-medium">{need.itemName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">需求數量</span>
              <span className="font-medium">
                {need.requiredQuantity} {need.unit}
              </span>
            </div>
            <div className="flex justify-between text-blue-600 font-medium">
              <span>尚缺</span>
              <span>
                {remaining} {need.unit}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              onClick(need);
            }}
            disabled={remaining <= 0}
          >
            {remaining > 0 ? '我要認領' : '已額滿'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
