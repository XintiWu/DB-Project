import { Card, CardContent } from './ui/card'
import type { Need } from '../lib/types'
import { useState, useEffect } from 'react'

interface StatsOverviewProps {
  needs: Need[]
}

export function StatsOverview({ needs }: StatsOverviewProps) {
  const totalNeeds = needs.length
  const urgentNeeds = needs.filter(n => n.status === 'urgent').length
  const fulfilledNeeds = needs.filter(n => n.status === 'fulfilled').length
  const inProgressNeeds = needs.filter(n => n.status === 'ongoing').length

  // 動畫數字效果
  const [animatedTotal, setAnimatedTotal] = useState(0)
  const [animatedUrgent, setAnimatedUrgent] = useState(0)
  const [animatedFulfilled, setAnimatedFulfilled] = useState(0)

  useEffect(() => {
    const duration = 1000
    const steps = 30
    const totalStep = totalNeeds / steps
    const urgentStep = urgentNeeds / steps
    const fulfilledStep = fulfilledNeeds / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      setAnimatedTotal(Math.min(Math.floor(totalStep * currentStep), totalNeeds))
      setAnimatedUrgent(Math.min(Math.floor(urgentStep * currentStep), urgentNeeds))
      setAnimatedFulfilled(Math.min(Math.floor(fulfilledStep * currentStep), fulfilledNeeds))

      if (currentStep >= steps) {
        clearInterval(timer)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [totalNeeds, urgentNeeds, fulfilledNeeds])

  const stats = [
    {
      label: '總需求數',
      value: animatedTotal,
      icon: '📊',
      color: 'bg-blue-500 dark:bg-blue-600',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      label: '緊急需求',
      value: animatedUrgent,
      icon: '🚨',
      color: 'bg-red-500 dark:bg-red-600',
      textColor: 'text-red-600 dark:text-red-400'
    },
    {
      label: '長期募集',
      value: inProgressNeeds,
      icon: '⏳',
      color: 'bg-amber-500 dark:bg-amber-600',
      textColor: 'text-amber-600 dark:text-amber-400'
    },
    {
      label: '已滿足',
      value: animatedFulfilled,
      icon: '✅',
      color: 'bg-green-500 dark:bg-green-600',
      textColor: 'text-green-600 dark:text-green-400'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card 
          key={stat.label}
          className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 dark:bg-slate-800 dark:border-slate-700"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">{stat.icon}</span>
              <div className={`w-2 h-2 rounded-full ${stat.color} animate-pulse`}></div>
            </div>
            <div className={`text-3xl font-bold mb-1 ${stat.textColor}`}>
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground dark:text-slate-400">
              {stat.label}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

