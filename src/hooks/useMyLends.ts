import { useState, useEffect } from 'react'
import { inventoryAPI } from '../services/api'
import type { LendRecord, LendStatus } from '../lib/types'

/**
 * 我的借用記錄 Hook
 */
export function useMyLends(userId: string) {
  const [lends, setLends] = useState<LendRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLends = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await inventoryAPI.getMyLends(userId)
      setLends(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入借用記錄失敗')
      console.error('Error fetching lend records:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchLends()
    }
  }, [userId])

  /**
   * 歸還物品
   */
  const returnItem = async (lendId: string) => {
    try {
      const result = await inventoryAPI.returnItem(lendId)
      if (result.success) {
        // 更新本地狀態
        setLends(prev => prev.map(lend => 
          lend.lend_id === lendId 
            ? { ...lend, returned_at: new Date().toISOString() }
            : lend
        ))
      }
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '歸還失敗'
      console.error('Error returning item:', err)
      return { success: false, message: errorMsg }
    }
  }

  /**
   * 獲取借用狀態
   */
  const getLendStatus = (lend: LendRecord): LendStatus => {
    if (lend.returned_at) {
      return 'returned'
    }
    // 簡單的逾期判斷：借用超過 30 天
    const lendDate = new Date(lend.lend_at)
    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - lendDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff > 30) {
      return 'overdue'
    }
    return 'ongoing'
  }

  return {
    lends,
    loading,
    error,
    refetch: fetchLends,
    returnItem,
    getLendStatus
  }
}

