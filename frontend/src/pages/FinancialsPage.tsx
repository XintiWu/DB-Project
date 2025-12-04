import { useState, useEffect } from 'react'
import { getAllFinancials } from '../api/client'
import type { FinancialTransaction } from '../lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { TrendingUp, CreditCard } from 'lucide-react'

export function FinancialsPage() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAllFinancials()
        setTransactions(data)
      } catch (err) {
        console.error('Failed to fetch financials:', err)
        setError('無法載入財務資料')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="text-center py-12">載入中...</div>
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>

  const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">財務透明公開</h1>
        <p className="text-muted-foreground mt-2">
          每一筆捐款與支出的流向紀錄。
        </p>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            總交易金額
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-700">
            ${totalAmount.toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-700">來源/對象</th>
              <th className="px-4 py-3 font-medium text-slate-700">用途</th>
              <th className="px-4 py-3 font-medium text-slate-700">金額</th>
              <th className="px-4 py-3 font-medium text-slate-700">時間</th>
              <th className="px-4 py-3 font-medium text-slate-700">ID</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transactions.map((txn) => (
              <tr key={txn.txn_id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-slate-400" />
                  {txn.source}
                </td>
                <td className="px-4 py-3">{txn.purpose}</td>
                <td className="px-4 py-3 font-mono font-medium text-emerald-600">
                  {txn.currency} {Number(txn.amount).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(txn.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                  {txn.txn_id.substring(0, 8)}...
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
