import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUserRequests, getUserIncidents, updateUser } from '../api/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { NeedCard } from '../components/NeedCard'
import { parseNeed } from '../lib/utils'
import { MapPin, Calendar } from 'lucide-react'

export function ProfilePage() {
  const { user, login } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [incidents, setIncidents] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  })
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        phone: (user as any).phone || '',
        email: user.email
      })
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [incidentsData, requestsData] = await Promise.all([
        getUserIncidents(user.user_id),
        getUserRequests(user.user_id)
      ])
      setIncidents(incidentsData)
      setRequests(requestsData.map(parseNeed))
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const updatedUser = await updateUser(user.user_id, {
        ...formData,
        role: user.role, // Keep existing role
        status: 'Active'
      })
      
      // Update local context
      // Note: updateUser returns the updated user object
      // We need to pass the token as well, which we can get from localStorage or context if exposed
      // For now, let's assume token doesn't change
      const token = localStorage.getItem('disaster-relief-token') || ''
      login(updatedUser, token)
      
      setIsEditing(false)
      alert('資料更新成功')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('更新失敗')
    }
  }

  if (!user) return <div className="p-8 text-center">請先登入</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">個人中心</h1>
        <p className="text-muted-foreground mt-2">
          管理您的個人資料與發布紀錄。
        </p>
      </div>

      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="profile">個人資料</TabsTrigger>
          <TabsTrigger value="incidents">我的災情</TabsTrigger>
          <TabsTrigger value="requests">我的需求</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>基本資料</CardTitle>
              <CardDescription>
                查看或修改您的聯絡資訊。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="name">姓名</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={formData.email}
                    disabled // Email usually not editable or requires verification
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">電話</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="pt-4 flex gap-2">
                  {isEditing ? (
                    <>
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>取消</Button>
                      <Button type="submit">儲存變更</Button>
                    </>
                  ) : (
                    <Button type="button" onClick={() => setIsEditing(true)}>編輯資料</Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {incidents.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                尚無回報紀錄
              </div>
            ) : (
              incidents.map((incident) => (
                <Card key={incident.incident_id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{incident.title}</CardTitle>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        incident.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {incident.status}
                      </span>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {incident.address}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                      {incident.msg}
                    </p>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(incident.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {requests.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                尚無發布需求
              </div>
            ) : (
              requests.map((need) => (
                <NeedCard key={need.id} need={need} onClick={() => {}} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
