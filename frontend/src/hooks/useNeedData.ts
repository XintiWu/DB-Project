import { useState, useEffect } from 'react'
import { getAllRequests } from '../api/client'
import type { Need } from '../lib/types'
import { parseNeed } from '../lib/utils'

export function useNeedData(itemsPerPage = 10) {
  const [needs, setNeeds] = useState<Need[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination State
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const ITEMS_PER_PAGE = itemsPerPage

  const [filters, setFilters] = useState({
    keyword: '',
    region: '全部',
    type: 'Material',
    incidentId: ''
  })

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        console.log('useNeedData fetching page', page)
        // Pass filters and pagination to API
        const response: any = await getAllRequests({
            page,
            limit: ITEMS_PER_PAGE,
            type: filters.type,
            keyword: filters.keyword,
            incident_id: filters.incidentId
        })
        
        let rawData = []
        if (response.data) {
            rawData = response.data
            setTotalPages(response.meta.totalPages)
        } else if (Array.isArray(response)) {
            rawData = response
        }

        const parsedNeeds: Need[] = rawData.map(parseNeed)
        setNeeds(parsedNeeds)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch needs:', err)
        setError('無法載入需求資料，請稍後再試')
      } finally {
        setLoading(false)
      }
    }

    // Reset page to 1 when filters change (except incidentId maybe? or all filters)
    // Actually we should separate the effect?
    // For now, simple effect:
    fetchData()
  }, [page, filters.type, filters.keyword, filters.incidentId]) 
  // Note: filters.incidentId is not yet passed to API in this code block! 
  // I need to update getAllRequests in client.ts to accept incidentId or pass it manually. 
  
  // Also resetting page logic:
  useEffect(() => {
      setPage(1)
  }, [filters.type, filters.keyword, filters.incidentId])

  return { needs, loading, error, filters, setFilters, page, setPage, totalPages }
}
