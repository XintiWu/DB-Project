import { useState, useEffect } from 'react'
import type { Need, MaterialNeed, RescueNeed } from '../lib/types.js'
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
      // Category mapping
      const categoryMap: Record<string, string> = {
        '食物': 'food',
        '飲用水': 'water',
        '醫療用品': 'medical_supply',
        '衣物': 'clothing',
        '住所用品': 'shelter_supply',
        '日用品': 'daily_necessities',
        '其他物資': 'other_material',
        '挖土機': 'equipment',
        '發電機': 'equipment',
        '淨水設備': 'water',
        '運輸車輛': 'transport',
        '照明設備': 'equipment',
        '通訊設備': 'equipment',
        '其他工具': 'equipment'
      }

      const getCategoryKey = (name: string | null, type: string): any => {
        if (!name) return type === 'Item' ? 'other_material' : 'other_rescue'
        return categoryMap[name] || (type === 'Item' ? 'other_material' : 'other_rescue')
      }

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
            category: getCategoryKey(row.category, 'Item')
          } as MaterialNeed
        } else {
          return {
            ...baseNeed,
            needType: 'rescue',
            category: getCategoryKey(row.category, 'Rescue'),
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
