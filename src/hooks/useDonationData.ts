import { useState, useEffect } from 'react'
import { donationAPI } from '../services/api'
import type { DonationRecord } from '../lib/types'

/**
 * 捐款資料 Hook
 */
export function useDonationData() {
  const [donations, setDonations] = useState<DonationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDonations = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await donationAPI.getAll()
      setDonations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入捐款資料失敗')
      console.error('Error fetching donations:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDonations()
  }, [])

  /**
   * 計算總金額（按幣別分組）
   */
  const getTotalByCurrency = () => {
    const totals: Record<string, number> = {}
    donations.forEach(donation => {
      if (!totals[donation.currency]) {
        totals[donation.currency] = 0
      }
      totals[donation.currency] += donation.amount
    })
    return totals
  }

  /**
   * 計算用途分布
   */
  const getPurposeDistribution = () => {
    const distribution: Record<string, number> = {}
    donations.forEach(donation => {
      if (!distribution[donation.purpose]) {
        distribution[donation.purpose] = 0
      }
      distribution[donation.purpose] += donation.amount
    })
    return distribution
  }

  return {
    donations,
    loading,
    error,
    refetch: fetchDonations,
    getTotalByCurrency,
    getPurposeDistribution
  }
}

