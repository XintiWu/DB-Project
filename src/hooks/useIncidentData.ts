import { useState, useEffect } from 'react'
import { incidentAPI } from '../services/api'
import type { Incident } from '../lib/types'

/**
 * 災情資料 Hook
 */
export function useIncidentData() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchIncidents = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await incidentAPI.getAll()
      setIncidents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入災情資料失敗')
      console.error('Error fetching incidents:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIncidents()
  }, [])

  return {
    incidents,
    loading,
    error,
    refetch: fetchIncidents
  }
}

/**
 * 單一災情資料 Hook
 */
export function useIncident(id: string) {
  const [incident, setIncident] = useState<Incident | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await incidentAPI.getById(id)
        setIncident(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '載入災情資料失敗')
        console.error('Error fetching incident:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchIncident()
    }
  }, [id])

  return {
    incident,
    loading,
    error
  }
}

