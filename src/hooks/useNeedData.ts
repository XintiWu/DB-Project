import { useState, useEffect } from 'react'
import type { Need, MaterialNeed, RescueNeed } from '../lib/types'
import { parseCSV } from '../lib/utils'

interface RawNeedData {
  id: string
  needType: string
  title: string
  location: string
  region: string
  category: string
  itemName: string
  requiredQuantity: string
  currentQuantity: string
  unit: string
  severity: string
  deadline: string
  timeSlots: string
  requiredSkills: string
  providedSupport: string
  description: string
  publisherName: string
  contactPhone: string
  contactEmail: string
  status: string
  createdAt: string
  managementKey: string
}

export function useNeedData() {
  const [needs, setNeeds] = useState<Need[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadNeeds()
  }, [])

  const loadNeeds = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/data/needs.csv')
      if (!response.ok) {
        throw new Error('無法載入需求資料')
      }

      const csvText = await response.text()
      const rawData = parseCSV<RawNeedData>(csvText)

      const parsedNeeds: Need[] = rawData.map(row => {
        const baseNeed = {
          id: row.id,
          title: row.title,
          location: row.location,
          region: row.region,
          itemName: row.itemName,
          requiredQuantity: parseInt(row.requiredQuantity) || 0,
          currentQuantity: parseInt(row.currentQuantity) || 0,
          unit: row.unit,
          severity: row.severity as any,
          deadline: row.deadline,
          description: row.description,
          publisherName: row.publisherName,
          contactPhone: row.contactPhone,
          contactEmail: row.contactEmail,
          status: row.status as any,
          createdAt: row.createdAt,
          managementKey: row.managementKey
        }

        if (row.needType === 'material') {
          return {
            ...baseNeed,
            needType: 'material',
            category: row.category as any
          } as MaterialNeed
        } else {
          return {
            ...baseNeed,
            needType: 'rescue',
            category: row.category as any,
            timeSlots: row.timeSlots,
            requiredSkills: row.requiredSkills,
            providedSupport: row.providedSupport
          } as RescueNeed
        }
      })

      setNeeds(parsedNeeds)
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入資料時發生錯誤')
      console.error('Error loading needs:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshNeeds = () => {
    loadNeeds()
  }

  return { needs, loading, error, refreshNeeds }
}


