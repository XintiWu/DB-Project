import { useState, useEffect } from 'react'
import { X, AlertTriangle, MapPin, Calendar, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Incident, Need } from '../lib/types'
import { getRequestsByIncidentId } from '../api/client'
import { parseNeed } from '../lib/utils'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { motion } from 'framer-motion'

interface IncidentDetailModalProps {
  incident: Incident
  onClose: () => void
}

export function IncidentDetailModal({ incident, onClose }: IncidentDetailModalProps) {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<Need[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'material' | 'tool' | 'manpower'>('material')

  useEffect(() => {
    async function fetchRequests() {
      try {


// ...

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
    activeTab === 'material' ? req.needType === 'material' : 
    activeTab === 'tool' ? req.needType === 'tool' :
    req.needType === 'manpower'
  )

  const handleClaimClick = (req: Need) => {
    // Navigate to requests page with query params or state to highlight/filter
    // For now, we'll just go to the requests page with the correct tab
    // Ideally, we would pass the incident ID to filter, but RequestsPage needs to support it
    navigate('/requests', { state: { incidentId: incident.incident_id, type: req.needType } })
  }

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop with blur */}
      <motion.div 
        className="absolute inset-0 bg-black/30" 
        onClick={onClose}
        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        transition={{ duration: 0.3 }}
      />

      {/* Modal Content */}
      <motion.div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          border: '1px solid rgba(255, 255, 255, 0.18)'
        }}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
      >
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/20 bg-white/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant={incident.severity === 'High' || incident.severity === 'Critical' ? 'destructive' : 'default'}>
                {incident.severity}
              </Badge>
              <span className="text-sm text-muted-foreground">{incident.type}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{incident.title}</h2>
            <div className="flex items-center gap-4 text-sm text-slate-600 mt-2">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {incident.address}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(incident.created_at).toLocaleDateString()}
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
                  onClick={() => setActiveTab('material')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'material' 
                      ? 'bg-white shadow-sm text-blue-600' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  物資需求
                </button>
                <button
                  onClick={() => setActiveTab('tool')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'tool' 
                      ? 'bg-white shadow-sm text-blue-600' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  工具需求
                </button>
                <button
                  onClick={() => setActiveTab('manpower')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'manpower' 
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
                          {(req.needType === 'material' || req.needType === 'tool') ? (
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
                              {(req as any).skills && (req as any).skills.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {(req as any).skills.map((s: any, i: number) => (
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
                              {!(req as any).headcount && (!(req as any).skills || (req as any).skills.length === 0) && (!(req as any).equipments || (req as any).equipments.length === 0) && (
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
                目前沒有相關的{activeTab === 'material' ? '物資' : '救援'}需求
                <div className="mt-4 text-xs text-slate-400">
                  Debug: IncidentID={incident.incident_id}, TotalRequests={requests.length}
                </div>
              </div>
            )}
          </section>
        </div>
      </motion.div>
    </motion.div>
  )
}
