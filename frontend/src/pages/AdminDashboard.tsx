import { useState, useEffect } from 'react'
import { getAnalytics, getUnverifiedRequests, reviewRequest, warnUser } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, FileText, AlertTriangle, CheckCircle, Check, X, AlertOctagon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function AdminDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Warning Dialog State
  const [warningOpen, setWarningOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [warningReason, setWarningReason] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const [analyticsData, requestsData] = await Promise.all([
          getAnalytics(),
          getUnverifiedRequests()
        ])
        setData(analyticsData)
        setPendingRequests(requestsData)
      } catch (err) {
        console.error('Failed to fetch admin data:', err)
        setError('無法載入管理資料')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleReview = async (requestId: string, status: 'Approved' | 'Rejected') => {
    if (!user) return
    try {
      await reviewRequest(requestId, {
        reviewer_id: user.user_id,
        review_status: status,
        review_note: status === 'Approved' ? 'Approved by admin' : 'Rejected by admin'
      })
      
      // Remove from list
      setPendingRequests(prev => prev.filter(r => r.request_id !== requestId))
      // alert(`已${status === 'Approved' ? '核准' : '駁回'}需求`) // Removed alert for smoother flow
    } catch (err) {
      console.error('Review failed:', err)
      alert('審核失敗')
    }
  }

  const openWarningDialog = (request: any) => {
    setSelectedRequest(request)
    setWarningReason('')
    setWarningOpen(true)
  }

  const handleWarnUser = async () => {
    if (!user || !selectedRequest || !warningReason.trim()) return

    try {
      await warnUser({
        user_id: selectedRequest.requester_id,
        admin_id: user.user_id,
        reason: warningReason,
        request_id: selectedRequest.request_id,
        incident_id: selectedRequest.incident_id
      })
      
      setWarningOpen(false)
      alert('已發出警告')
    } catch (err) {
      console.error('Warning failed:', err)
      alert('警告發送失敗')
    }
  }

  if (loading) return <div className="text-center py-12">載入中...</div>
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>
  if (!data) return null

  const { system, byType, byUrgency, topItems } = data

  // Prepare chart data
  const typeData = byType.map((t: any) => ({ name: t.type, value: parseInt(t.count) }))
  const urgencyData = byUrgency.map((u: any) => ({ name: `等級 ${u.urgency}`, value: parseInt(u.count) }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">系統管理儀表板</h1>
        <p className="text-muted-foreground mt-2">
          系統營運概況與審核管理。
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">總覽分析</TabsTrigger>
          <TabsTrigger value="reviews">
            待審核需求
            {pendingRequests.length > 0 && (
              <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 mt-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">總需求數</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{system.totalRequests}</div>
                <p className="text-xs text-muted-foreground">
                  {system.pendingRequests} 待處理 / {system.completedRequests} 已完成
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">災情事件</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{system.totalIncidents}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">註冊用戶</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{system.totalUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">完成率</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {system.totalRequests ? Math.round((system.completedRequests / system.totalRequests) * 100) : 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Request Types Chart */}
            <Card>
              <CardHeader>
                <CardTitle>需求類型分佈</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" name="數量" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Urgency Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>緊急程度分佈</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={urgencyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {urgencyData.map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            {/* Top Items */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>熱門需求物資 Top 5</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topItems.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600">
                          {index + 1}
                        </div>
                        <span className="font-medium">{item.item_name}</span>
                      </div>
                      <div className="font-mono font-bold text-blue-600">
                        {item.total_qty}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {pendingRequests.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed"
                >
                  目前沒有待審核的需求
                </motion.div>
              ) : (
                pendingRequests.map((req) => (
                  <motion.div
                    layout
                    key={req.request_id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ x: 300, opacity: 0, transition: { duration: 0.3 } }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{req.title}</CardTitle>
                            <CardDescription>{new Date(req.created_at).toLocaleString()}</CardDescription>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            req.urgency === 'High' || req.urgency === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {req.urgency}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="col-span-2 grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-md">
                        <div><span className="text-muted-foreground">Request ID:</span> <span className="font-mono">{req.request_id}</span></div>
                        <div><span className="text-muted-foreground">Requester:</span> {req.requester_name} (ID: {req.requester_id})</div>
                        <div><span className="text-muted-foreground">Incident ID:</span> {req.incident_id}</div>
                        <div><span className="text-muted-foreground">Status:</span> {req.status}</div>
                        <div><span className="text-muted-foreground">Coordinates:</span> {req.latitude}, {req.longitude}</div>
                        <div><span className="text-muted-foreground">Qty (Req/Cur):</span> {req.required_qty} / {req.current_qty}</div>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">類型:</span> {req.type}
                      </div>
                      <div>
                        <span className="text-muted-foreground">地點:</span> {req.address}
                      </div>
                      
                      <div className="col-span-2">
                        <span className="text-muted-foreground font-medium">需求詳情:</span>
                        <div className="mt-2 space-y-2 pl-2 border-l-2 border-slate-200">
                          {req.material_items?.length > 0 && (
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">物資:</div>
                              {req.material_items.map((i: any) => (
                                <div key={i.item_id} className="ml-2">{i.item_name} x {i.qty} {i.unit}</div>
                              ))}
                            </div>
                          )}
                          {req.required_skills?.length > 0 && (
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">人力技能:</div>
                              {req.required_skills.map((s: any) => (
                                <div key={s.skill_tag_id} className="ml-2">{s.skill_name} x {s.qty}</div>
                              ))}
                            </div>
                          )}
                          {req.required_equipments?.length > 0 && (
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">設備:</div>
                              {req.required_equipments.map((e: any) => (
                                <div key={e.equipment_id} className="ml-2">{e.equipment_name} x {e.qty}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                      <CardFooter className="flex justify-end gap-2 bg-slate-50/50 pt-4">
                        <Button 
                          variant="outline" 
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200 mr-auto"
                          onClick={() => openWarningDialog(req)}
                        >
                          <AlertOctagon className="mr-2 h-4 w-4" />
                          警告用戶
                        </Button>
                        <Button 
                          variant="outline" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          onClick={() => handleReview(req.request_id, 'Rejected')}
                        >
                          <X className="mr-2 h-4 w-4" />
                          駁回
                        </Button>
                        <Button 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleReview(req.request_id, 'Approved')}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          核准
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={warningOpen} onOpenChange={setWarningOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <AlertOctagon className="h-6 w-6" />
              <DialogTitle className="text-xl">發出使用者警告</DialogTitle>
            </div>
            <DialogDescription>
              您即將對使用者 <span className="font-medium text-slate-900">{selectedRequest?.requester_name || 'Unknown'}</span> 發出警告。
              此操作將被記錄在系統中，且無法撤銷。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-right">
                警告原因
              </Label>
              <Textarea
                id="reason"
                placeholder="請詳細說明警告原因，例如：發布虛假需求、惡意洗版..."
                value={warningReason}
                onChange={(e) => setWarningReason(e.target.value)}
                className="col-span-3 min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWarningOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={handleWarnUser}>確認發送警告</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
