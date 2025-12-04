import { useState, useEffect } from 'react'
import type { Need, MaterialNeed, RescueNeed } from '../lib/types'
import { getAllRequests } from '../api/client.js'

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

      // 🔥 改成從後端 API 拿資料
      const data = await getAllRequests()

      // 🔥 從 PostgreSQL 的 REQUESTS table 轉成你前端需要的格式
      const parsedNeeds: Need[] = data.map((row: any) => {
        const baseNeed = {
          id: String(row.request_id),
          title: row.title || '未命名需求',
          location: row.address,
          region: row.region || '未知地區',
          itemName: row.item_name || '',
          requiredQuantity: row.required_qty || 0,
          currentQuantity: row.current_qty || 0,
          unit: row.unit || '',
          severity: String(row.urgency),
          deadline: row.deadline || '',
          description: row.description || '',
          publisherName: row.publisher_name || '',
          contactPhone: row.contact_phone || '',
          contactEmail: row.contact_email || '',
          status: row.status,
          createdAt: row.request_date,
          managementKey: 'N/A'
        }

        if (row.type === 'Item') {
          return {
            ...baseNeed,
            needType: 'material',
            category: row.category || 'others'
          } as MaterialNeed
        } else {
          return {
            ...baseNeed,
            needType: 'rescue',
            category: row.category || 'others',
            timeSlots: row.time_slots || '',
            requiredSkills: row.required_skills || '',
            providedSupport: row.provided_support || ''
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

  return { needs, loading, error, refreshNeeds: loadNeeds }
}
