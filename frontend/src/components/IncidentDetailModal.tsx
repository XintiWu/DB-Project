import { useState, useEffect } from 'react'
import { X, AlertTriangle, MapPin, Calendar, ArrowRight, ShieldCheck, UserCheck, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Incident, Need, HumanpowerNeed } from '../lib/types'
import { getRequestsByIncidentId, reviewIncident } from '../api/client'
import { parseNeed } from '../lib/utils'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { ClaimDialog } from './ClaimDialog'
import { useAuth } from '../context/AuthContext'

interface IncidentDetailModalProps {
  incident: Incident
  onClose: () => void
}

export function IncidentDetailModal({ incident, onClose }: IncidentDetailModalProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [requests, setRequests] = useState<Need[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'Material' | 'Tool' | 'Humanpower'>('Material')
  const [selectedClaimNeed, setSelectedClaimNeed] = useState<Need | null>(null)
  const [reviewing, setReviewing] = useState(false)

  useEffect(() => {
    async function fetchRequests() {
      try {
        const data = await getRequestsByIncidentId(incident.incident_id)
        setRequests(data.map(parseNeed))
      } catch (err) {
        console.error('Failed to fetch incident requests:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchRequests()
  }, [incident.incident_id])

  const filteredRequests = requests.filter(req =>
    activeTab === 'Material' ? req.needType === 'Material' :
      activeTab === 'Tool' ? req.needType === 'Tool' :
        req.needType === 'Humanpower'
  )

  const handleClaimClick = (req: Need) => {
    setSelectedClaimNeed(req)
  }

  const handleReview = async (status: 'Approved' | 'Rejected') => {
    if (!user) return
    setReviewing(true)
    try {
      await reviewIncident(incident.incident_id, {
        reviewer_id: user.user_id,
        review_status: status,
        review_note: status === 'Approved' ? 'Verified by admin' : 'Rejected by admin'
      })
      alert(`已成功${status === 'Approved' ? '核准' : '駁回'}此災情`)
      onClose()
      window.location.reload() // Simple reload to refresh list
    } catch (err) {
      console.error('Review failed:', err)
      alert('審核失敗')
    } finally {
      setReviewing(false)
    }
  }

  return (
    <div className="fixed top-0 left-0 h-screen w-screen z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop with blur */}
      <motion.div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm z-0"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Modal Content */}
      <motion.div
        layoutId={`incident-${incident.incident_id}`}
        className="relative z-50 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col bg-white/85 backdrop-blur-xl shadow-2xl border border-white/20"
        transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
      >

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/20 bg-white/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant={incident.severity === 'High' || incident.severity === 'Critical' ? 'destructive' : 'default'}>
                {incident.severity}
              </Badge>
              {incident.review_status === 'Approved' && (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 gap-1 pl-1 pr-2">
                  <ShieldCheck className="h-3 w-3" />
                  已審核
                </Badge>
              )}
              {incident.review_status === 'Pending' && (
                <Badge variant="outline" className="text-orange-500 border-orange-200 bg-orange-50">
                  未審核
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">{incident.type}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{incident.title}</h2>
            <div className="flex items-center gap-4 text-sm text-slate-600 mt-2">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {incident.area_name || '未知區域'} ({incident.latitude ? `${Number(incident.latitude).toFixed(4)}, ${Number(incident.longitude).toFixed(4)}` : '未定位'})
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(incident.created_at || incident.reported_at || Date.now()).toLocaleDateString()}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-black/5 transition-colors"
          >
            <X className="h-6 w-6 text-slate-500" />
          </button>
        </div>

        {/* Review Controls for Admin */}
        {user?.role === 'Admin' && incident.review_status === 'Pending' && (
          <div className="px-6 py-3 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between">
            <span className="text-sm text-blue-800 font-medium flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              管理員審核操作
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => handleReview('Rejected')}
                disabled={reviewing}
              >
                <ThumbsDown className="mr-1 h-3 w-3" /> 駁回
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleReview('Approved')}
                disabled={reviewing}
              >
                <ThumbsUp className="mr-1 h-3 w-3" /> 核准
              </Button>
            </div>
          </div>
        )}

        {/* Review Info Section (Show if Reviewed) */}
        {incident.review_status && (incident.review_status === 'Approved' || incident.review_status === 'Rejected') && (
          <div className="px-6 pt-4 pb-0">
            <div className={`p-3 rounded-lg border text-sm flex gap-3 ${incident.review_status === 'Approved'
                ? 'bg-green-50/50 border-green-100 text-green-800'
                : 'bg-red-50/50 border-red-100 text-red-800'
              }`}>
              <UserCheck className="h-5 w-5 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="font-medium flex items-center justify-between">
                  <span>管理員審核：{incident.review_status === 'Approved' ? '通過' : '駁回'}</span>
                  {incident.reviewed_at && <span className="text-xs opacity-70">{new Date(incident.reviewed_at).toLocaleDateString()}</span>}
                </div>
                {incident.review_note && (
                  <div className="flex items-start gap-1 mt-1 opacity-90">
                    <MessageSquare className="h-3 w-3 mt-0.5" />
                    {incident.review_note}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* Description */}
          <section>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              災情描述
            </h3>
            <p className="text-slate-700 leading-relaxed bg-white/50 p-4 rounded-lg border border-white/20">
              {incident.msg || '暫無詳細描述'}
            </p>
          </section>

          {/* Requests Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">相關需求</h3>

              {/* Tabs */}
              <div className="flex bg-slate-100/50 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('Material')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'Material'
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  物資需求
                </button>
                <button
                  onClick={() => setActiveTab('Tool')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'Tool'
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  工具需求
                </button>
                <button
                  onClick={() => setActiveTab('Humanpower')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'Humanpower'
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  人力需求
                </button>
              </div>
            </div>

            <div className="mb-4 flex justify-end">
              <Button
                variant="outline"
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={() => navigate('/publish', { state: { incidentId: incident.incident_id, incidentTitle: incident.title } })}
              >
                + 發布需求
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">載入需求中...</div>
            ) : filteredRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRequests.map(req => (
                  <Card key={req.id} className="bg-white/60 border-white/40 hover:bg-white/80 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900">{req.title}</h4>
                        <div className="text-sm text-slate-500 mt-1">
                          {(req.needType === 'Material' || req.needType === 'Tool') ? (
                            <div className="space-y-1">
                              {(req as any).items && (req as any).items.length > 0 ? (
                                (req as any).items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <span className="font-medium text-slate-700">{item.itemName}</span>
                                    <span>x {item.quantity} {item.unit}</span>
                                    {item.isTool && <Badge variant="outline" className="text-[10px] h-4 px-1">工具</Badge>}
                                  </div>
                                ))
                              ) : (
                                <span>需求: {req.itemName} x {req.requiredQuantity} {req.unit}</span>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {(req as any).headcount && <div>需求人數: {(req as any).headcount} 人</div>}
                              {(req as HumanpowerNeed).skills && (req as HumanpowerNeed).skills.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {(req as HumanpowerNeed).skills.map((s: any, i: number) => (
                                    <Badge key={i} variant="secondary" className="text-[10px]">
                                      {s.skillName} {s.quantity ? `x${s.quantity}` : ''}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {(req as any).equipments && (req as any).equipments.length > 0 && (
                                <div className="text-xs">
                                  需要設備: {(req as any).equipments.map((e: any) => `${e.equipmentName} x${e.quantity}`).join(', ')}
                                </div>
                              )}
                              {/* Fallback display */}
                              {!(req as any).headcount && (!(req as HumanpowerNeed).skills || (req as HumanpowerNeed).skills.length === 0) && (!(req as any).equipments || (req as any).equipments.length === 0) && (
                                <span>需求: {req.category}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleClaimClick(req)}
                      >
                        前往認領
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-500">
                目前沒有相關的{activeTab === 'Material' ? '物資' : '救援'}需求
                <div className="mt-4 text-xs text-slate-400">
                  Debug: IncidentID={incident.incident_id}, TotalRequests={requests.length}
                </div>
              </div>
            )}
          </section>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedClaimNeed && (
          <ClaimDialog
            need={selectedClaimNeed as Need}
            onClose={() => setSelectedClaimNeed(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
