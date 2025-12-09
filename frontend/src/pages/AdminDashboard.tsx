import { useState, useEffect } from 'react'
import { getAnalytics, getUnverifiedRequests, getUnverifiedIncidents, reviewRequest, reviewIncident, warnUser, getIncidentStatsByArea, getTopNeededCategories, getIdleResources, getVolunteerLeaderboard, getSearchKeywordsAnalysis, getFinancialStats } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { Users, FileText, AlertTriangle, CheckCircle, Check, X, AlertOctagon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function AdminDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [pendingIncidents, setPendingIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingFinancials, setLoadingFinancials] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPendingCount, setTotalPendingCount] = useState(0)
  const [incidentPage, setIncidentPage] = useState(1)
  const [totalIncidentPages, setTotalIncidentPages] = useState(1)
  const [totalPendingIncidentCount, setTotalPendingIncidentCount] = useState(0)

  // New Analysis Data State
  const [incidentStats, setIncidentStats] = useState<any[]>([])
  const [topNeeded, setTopNeeded] = useState<any[]>([])
  const [idleResources, setIdleResources] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [keywordStats, setKeywordStats] = useState<any[]>([])
  const [financialStats, setFinancialStats] = useState<any>(null)

  // Warning Dialog State
  const [warningOpen, setWarningOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [warningReason, setWarningReason] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const [analyticsData, requestsResponse] = await Promise.all([
          getAnalytics(),
          getUnverifiedRequests({ page, limit: 10 })
        ])
        setData(analyticsData)
        
        let reqData: any[] = []
        if ((requestsResponse as any).data) {
            reqData = (requestsResponse as any).data
            setTotalPages((requestsResponse as any).meta.totalPages)
            setTotalPendingCount((requestsResponse as any).meta.totalItems)
        } else if (Array.isArray(requestsResponse)) {
            reqData = requestsResponse
            setTotalPendingCount(requestsResponse.length)
        }
        setPendingRequests(reqData)

        // Fetch pending incidents
        const incidentsResponse = await getUnverifiedIncidents({ page: incidentPage, limit: 10 })
        let incData: any[] = []
        if ((incidentsResponse as any).data) {
            incData = (incidentsResponse as any).data
            setTotalIncidentPages((incidentsResponse as any).meta.totalPages)
            setTotalPendingIncidentCount((incidentsResponse as any).meta.totalItems)
        } else if (Array.isArray(incidentsResponse)) {
            incData = incidentsResponse
            setTotalPendingIncidentCount(incidentsResponse.length)
        }
        setPendingIncidents(incData)

        // Fetch Analysis Data
        const [incStats, topNeed, idleRes, volLeader, kwStats] = await Promise.all([
            getIncidentStatsByArea(),
            getTopNeededCategories(),
            getIdleResources(30),
            getVolunteerLeaderboard(10),
            getSearchKeywordsAnalysis()
        ])
        setIncidentStats(incStats)
        setTopNeeded(topNeed)
        setIdleResources(idleRes)
        setLeaderboard(volLeader)
        setKeywordStats(kwStats)

      } catch (err) {
        console.error('Failed to fetch admin data:', err)
        setError('無法載入管理資料')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [page, incidentPage])

  // Separate effect for Financial Data (Heavy computation)
  useEffect(() => {
      async function fetchFinancials() {
          try {
              setLoadingFinancials(true);
              const finStats = await getFinancialStats();
              setFinancialStats(finStats);
          } catch (err) {
              console.error('Failed to fetch financial stats:', err);
              // Don't block UI on financial error
          } finally {
              setLoadingFinancials(false);
          }
      }
      fetchFinancials();
  }, []);

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

  const handleIncidentReview = async (incidentId: string, status: 'Approved' | 'Rejected') => {
    if (!user) return
    try {
      await reviewIncident(incidentId, {
        reviewer_id: user.user_id,
        review_status: status,
        review_note: status === 'Approved' ? 'Approved by admin' : 'Rejected by admin'
      })
      
      // Remove from list
      setPendingIncidents(prev => prev.filter(i => i.incident_id !== incidentId))
    } catch (err) {
      console.error('Incident review failed:', err)
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

  // Prepare Financial Pie Chart Data (Group < 5%)
  const financialPieData = (() => {
      if (!financialStats?.byPurpose) return [];
      const raw = financialStats.byPurpose;
      const total = raw.reduce((acc: number, cur: any) => acc + parseFloat(cur.total_amount), 0);
      const grouped: any[] = [];
      let otherVal = 0;

      raw.forEach((item: any) => {
          const val = parseFloat(item.total_amount);
          if (val / total < 0.05) {
              otherVal += val;
          } else {
              grouped.push({ name: item.purpose, value: val });
          }
      });

      if (otherVal > 0) {
          grouped.push({ name: '其他 (Other)', value: otherVal });
      }
      return grouped.sort((a, b) => b.value - a.value);
  })();

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
            {totalPendingCount > 0 && (
              <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                {totalPendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="incident_reviews">
            待審核災情
            {totalPendingIncidentCount > 0 && (
              <span className="ml-2 bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs">
                {totalPendingIncidentCount}
              </span>
            )}

          </TabsTrigger>
          <TabsTrigger value="analysis">進階分析報告</TabsTrigger>
          <TabsTrigger value="financials">財務分析</TabsTrigger>
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
                        <div><span className="text-muted-foreground">Incident:</span> {req.incident_title ? `${req.incident_title} (${req.incident_id})` : req.incident_id}</div>
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
          
            {/* Pagination Controls */}
            {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
                <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium rounded-md bg-white border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                上一頁
                </button>
                <span className="text-sm font-medium text-slate-600">
                    第 {page} 頁 / 共 {totalPages} 頁
                </span>
                <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium rounded-md bg-white border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                下一頁
                </button>
            </div>
            )}
        </TabsContent>

        <TabsContent value="incident_reviews" className="mt-6">
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {pendingIncidents.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed"
                >
                  目前沒有待審核的災情
                </motion.div>
              ) : (
                pendingIncidents.map((inc) => (
                  <motion.div
                    layout
                    key={inc.incident_id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ x: 300, opacity: 0, transition: { duration: 0.3 } }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{inc.title}</CardTitle>
                            <CardDescription>{new Date(inc.created_at).toLocaleString()}</CardDescription>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            inc.severity >= 4 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            Severity: {inc.severity}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="col-span-2 grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-md">
                            <div><span className="text-muted-foreground">Incident ID:</span> <span className="font-mono">{inc.incident_id}</span></div>
                            <div><span className="text-muted-foreground">Reporter ID:</span> {inc.reporter_id}</div>
                            <div><span className="text-muted-foreground">Type:</span> {inc.type}</div>
                            <div><span className="text-muted-foreground">Status:</span> {inc.status}</div>
                            <div><span className="text-muted-foreground">Location:</span> {inc.latitude}, {inc.longitude}</div>
                          </div>
                          

                          <div className="col-span-2">
                             <span className="text-muted-foreground">Message:</span> 
                             <p className="mt-1 p-2 bg-slate-50 rounded border text-slate-700">{inc.msg}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2 bg-slate-50/50 pt-4">
                        <Button 
                          variant="outline" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          onClick={() => handleIncidentReview(inc.incident_id, 'Rejected')}
                        >
                          <X className="mr-2 h-4 w-4" />
                          駁回
                        </Button>
                        <Button 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleIncidentReview(inc.incident_id, 'Approved')}
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
          
            {/* Pagination Controls */}
            {totalIncidentPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
                <button
                onClick={() => setIncidentPage(p => Math.max(1, p - 1))}
                disabled={incidentPage === 1}
                className="px-4 py-2 text-sm font-medium rounded-md bg-white border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                上一頁
                </button>
                <span className="text-sm font-medium text-slate-600">
                    第 {incidentPage} 頁 / 共 {totalIncidentPages} 頁
                </span>
                <button
                onClick={() => setIncidentPage(p => Math.min(totalIncidentPages, p + 1))}
                disabled={incidentPage === totalIncidentPages}
                className="px-4 py-2 text-sm font-medium rounded-md bg-white border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                下一頁
                </button>
            </div>
            )}
        </TabsContent>

        <TabsContent value="analysis" className="mt-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* B-1 Incident Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>各地區災情統計 (Incident Stats)</CardTitle>
                        <CardDescription>各行政區目前的災情總數</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                             {incidentStats.map((stat, idx) => (
                                 <div key={idx} className="flex justify-between items-center border-b pb-2">
                                     <span>{stat.area_name}</span>
                                     <span className="font-bold">{stat.incident_count}</span>
                                 </div>
                             ))}
                        </div>
                    </CardContent>
                </Card>

                {/* B-2 Top Needed Categories */}
                 <Card>
                    <CardHeader>
                        <CardTitle>最急需物資類別 (Top Shortages)</CardTitle>
                        <CardDescription>目前缺口最大的物資類別 (Required - Current)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                             {topNeeded.map((stat, idx) => (
                                 <div key={idx} className="flex justify-between items-center border-b pb-2">
                                     <span>{stat.category_name}</span>
                                     <span className="font-bold text-red-600">{stat.shortage}</span>
                                 </div>
                             ))}
                        </div>
                    </CardContent>
                </Card>

                 {/* B-5 Volunteer Leaderboard */}
                 <Card>
                    <CardHeader>
                        <CardTitle>志工貢獻度排行 (Volunteer Leaderboard)</CardTitle>
                        <CardDescription>協助請求次數最多的使用者</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                             {leaderboard.map((stat, idx) => (
                                 <div key={idx} className="flex justify-between items-center border-b pb-2">
                                     <div className="flex items-center gap-2">
                                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${idx < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100'}`}>
                                            {idx + 1}
                                        </span>
                                        <span>{stat.name}</span>
                                     </div>
                                     <span className="font-bold text-green-600">{stat.help_count}</span>
                                 </div>
                             ))}
                        </div>
                    </CardContent>
                </Card>
                
                 {/* B-4 Search Keywords */}
                 <Card>
                    <CardHeader>
                        <CardTitle>熱門搜尋關鍵字 (Search Trends)</CardTitle>
                        <CardDescription>使用者最常搜尋的詞彙 (NoSQL Analysis)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                             {keywordStats.map((stat, idx) => (
                                 <div key={idx} className="flex justify-between items-center border-b pb-2">
                                     <span>{stat._id}</span>
                                     <span className="font-bold">{stat.count}</span>
                                 </div>
                             ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

             {/* B-3 Idle Resources */}
             <Card>
                <CardHeader>
                    <CardTitle>閒置高價值庫存 (Idle Resources)</CardTitle>
                    <CardDescription>超過 30 天未變動且數量 &gt; 100 的物資</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-4 py-2">Inventory</th>
                                    <th className="px-4 py-2">Item</th>
                                    <th className="px-4 py-2">Quantity</th>
                                    <th className="px-4 py-2">Last Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {idleResources.map((item, idx) => (
                                    <tr key={idx} className="border-b">
                                        <td className="px-4 py-2">{item.inventory_name}</td>
                                        <td className="px-4 py-2">{item.item_name}</td>
                                        <td className="px-4 py-2 font-mono">{item.qty}</td>
                                        <td className="px-4 py-2 text-muted-foreground">{new Date(item.updated_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="financials" className="mt-6 space-y-8">
            {loadingFinancials ? (
                <div className="flex justify-center items-center py-12">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                     <span className="ml-3 text-slate-600">正在分析百萬筆財務資料...</span>
                </div>
            ) : financialStats && (
                <>
                 {/* Summary Cards */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                             <CardTitle className="text-sm font-medium">年度交易金額 (Annual Volume)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                ${(parseFloat(financialStats.summary.total_amount || 0)).toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                             <CardTitle className="text-sm font-medium">年度交易筆數 (Annual Count)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {parseInt(financialStats.summary.total_count || 0).toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                             <CardTitle className="text-sm font-medium">平均交易額 (Annual Avg)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                ${financialStats.summary.total_count > 0 
                                    ? (financialStats.summary.total_amount / financialStats.summary.total_count).toFixed(0) 
                                    : 0}
                            </div>
                        </CardContent>
                    </Card>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     {/* Monthly Trend Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>每月資金變動趨勢 (Last 12 Months)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[...financialStats.byMonth].reverse()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis 
                                        width={80} 
                                        tickFormatter={(value) => {
                                            if(value >= 1000000) return `${(value/1000000).toFixed(1)}M`;
                                            if(value >= 1000) return `${(value/1000).toFixed(0)}k`;
                                            return value;
                                        }}
                                    />
                                    <Tooltip formatter={(value: any) => `$${parseInt(value).toLocaleString()}`} />
                                    <Area type="monotone" dataKey="total_amount" stroke="#10b981" fill="#ecfdf5" name="Amount" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Purpose Breakdown Pie Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>資金用途分佈 (By Purpose)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={financialPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    >
                                        {/* We need to map over the *processed* data for Cells, but we can't access it easily here if defined inline. 
                                            Let's move the processing out of the JSX or use a Cell map based on index which might be risky if length changes.
                                            Actually, Recharts Pie `data` prop accepts the array. 
                                            I should define the variable before the return statement.
                                        */}
                                    </Pie>
                                    <Tooltip formatter={(value: any) => `$${parseInt(value).toLocaleString()}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Top Donors Bar Chart */}
                    <Card className="col-span-1 lg:col-span-2">
                        <CardHeader>
                            <CardTitle>前五大捐款來源 (Top 5 Sources)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={financialStats.topSources} margin={{ left: 40, right: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} />
                                    <YAxis type="category" dataKey="source" width={120} />
                                    <Tooltip formatter={(value: any) => `$${parseInt(value).toLocaleString()}`} />
                                    <Bar dataKey="total_amount" fill="#ec4899" name="Amount" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                 </div>
                </>
            )}
        </TabsContent>
      </Tabs>

      <Dialog open={warningOpen} onOpenChange={setWarningOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <AlertOctagon className="h-6 w-6" />
              <DialogTitle className="text-xl">警告用戶 (Warn User)</DialogTitle>
            </div>
            <DialogDescription>
              請填寫警告原因，這將會發送通知給用戶。
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
