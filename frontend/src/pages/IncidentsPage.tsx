import { useState, useEffect } from 'react'
import { getAllIncidents } from '../api/client'
import type { Incident } from '../lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { MapPin, AlertTriangle } from 'lucide-react'
import { IncidentDetailModal } from '../components/IncidentDetailModal'
import { motion, AnimatePresence } from 'framer-motion'

export function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAllIncidents()
        setIncidents(data)
      } catch (err) {
        console.error('Failed to fetch incidents:', err)
        setError('無法載入災情資料')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="text-center py-12">載入中...</div>
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">災情通報</h1>
        <p className="text-muted-foreground mt-2">
          即時掌握各地災情狀況與緊急程度。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {incidents.map((incident) => (
          <motion.div
            key={incident.incident_id}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="h-full"
          >
            <Card
              className="hover:shadow-lg transition-all cursor-pointer hover:border-blue-300 h-full"
              onClick={() => setSelectedIncident(incident)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-5 w-5 ${
                      incident.severity === 'Critical' ? 'text-red-500' :
                      incident.severity === 'High' ? 'text-orange-500' : 'text-yellow-500'
                    }`} />
                    <CardTitle className="text-lg leading-tight">
                      {incident.title}
                    </CardTitle>
                  </div>
                  <Badge variant={incident.status === 'Resolved' ? 'secondary' : 'destructive'}>
                    {incident.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{incident.address}</span>
                </div>

                <p className="text-sm text-slate-600 line-clamp-2">
                  {incident.msg}
                </p>

                <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <span>嚴重程度: {incident.severity}</span>
                  <span>{new Date(incident.created_at || incident.reported_at || Date.now()).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedIncident && (
          <IncidentDetailModal
            key="incident-modal"
            incident={selectedIncident} 
            onClose={() => setSelectedIncident(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}