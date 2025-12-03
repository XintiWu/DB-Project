import { useState, useEffect } from 'react'
import { getAllRequests } from '../api/client'
import type { Need } from '../lib/types'
import { parseNeed } from '../lib/utils'

export function useNeedData() {
  const [needs, setNeeds] = useState<Need[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('useNeedData fetching...')
        const data = await getAllRequests()
        console.log('useNeedData fetched:', data.length)

        // Category mapping


// ...

        const parsedNeeds: Need[] = data.map(parseNeed)
        console.log('useNeedData parsed:', parsedNeeds.length)

        setNeeds(parsedNeeds)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch needs:', err)
        setError('無法載入需求資料，請稍後再試')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const [filters, setFilters] = useState({
    keyword: '',
    region: '全部',
    type: 'material',
    incidentId: ''
  })

  return { needs, loading, error, filters, setFilters }
}
