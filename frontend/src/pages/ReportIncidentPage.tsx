import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createIncident } from '../api/client'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { AlertTriangle } from 'lucide-react'

const INCIDENT_TYPES = ['Earthquake', 'Flood', 'Fire', 'Landslide', 'Typhoon', 'Other']
const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical']

export function ReportIncidentPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    type: 'Earthquake',
    severity: 'Medium',
    address: '',
    msg: '',
    area_id: 1 // Default to 1 for now, ideally selectable
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert('請先登入')
      navigate('/login')
      return
    }

    setLoading(true)
    setError('')

    try {
      await createIncident({
        ...formData,
        reporter_id: user.user_id,
        status: 'Active',
        latitude: null, // Optional
        longitude: null // Optional
      })
      alert('災情通報成功')
      navigate('/incidents')
    } catch (err: any) {
      console.error('Failed to report incident:', err)
      setError(err.message || '通報失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="h-12 w-12 text-yellow-500" />
        <h2 className="text-xl font-bold">請先登入以通報災情</h2>
        <Button onClick={() => navigate('/login')}>前往登入</Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">通報災情</h1>
        <p className="text-muted-foreground mt-2">
          請詳細填寫災情資訊，以利相關單位協助。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>災情資訊表單</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">標題</Label>
              <Input
                id="title"
                placeholder="例如：中山路淹水"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">災情類型</Label>
                <select
                  id="type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {INCIDENT_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">嚴重程度</Label>
                <select
                  id="severity"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                >
                  {SEVERITY_LEVELS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">地點</Label>
              <Input
                id="address"
                placeholder="詳細地址或描述"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="msg">詳細描述</Label>
              <textarea
                id="msg"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="請描述現場狀況..."
                value={formData.msg}
                onChange={(e) => setFormData({ ...formData, msg: e.target.value })}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/incidents')}>
              取消
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={loading}>
              {loading ? '通報中...' : '確認通報'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
