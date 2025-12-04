import { useState, useEffect } from 'react'
import { getAllFinancials, getFinancialStats } from '../api/client'
import type { FinancialTransaction } from '../lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { TrendingUp, CreditCard, PieChart as PieIcon, BarChart as BarIcon } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function FinancialsPage() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [txnsData, statsData] = await Promise.all([
          getAllFinancials(),
          getFinancialStats()
        ])
        setTransactions(txnsData)
        setStats(statsData)
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

  // Prepare chart data
  const purposeData = stats?.byPurpose?.map((p: any) => ({
    name: p.purpose,
    value: parseInt(p.total_amount)
  })) || []

  const monthData = stats?.byMonth?.map((m: any) => ({
    name: m.month,
    value: parseInt(m.total_amount)
  })).reverse() || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">財務透明公開</h1>
        <p className="text-muted-foreground mt-2">
          每一筆捐款與支出的流向紀錄與分析。
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              總交易筆數
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.summary?.total_count || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PieIcon className="h-4 w-4" />
              主要用途
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate">
              {purposeData.length > 0 ? purposeData.sort((a: any, b: any) => b.value - a.value)[0].name : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieIcon className="h-5 w-5" />
              資金用途分佈
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={purposeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {purposeData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarIcon className="h-5 w-5" />
              每月資金趨勢
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Bar dataKey="value" fill="#10b981" name="金額" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50 font-medium">
          近期交易紀錄
        </div>
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
