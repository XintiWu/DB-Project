import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUserRequests, getUserIncidents, updateUser, getMyInventories, createInventory, getUserLends } from '../api/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { NeedCard } from '../components/NeedCard'
import { parseNeed } from '../lib/utils'
import { MapPin, Calendar, Warehouse, Plus, ArrowRightLeft, Package } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { WarehouseManagerDialog } from '../components/WarehouseManagerDialog'
import { WarehouseCard } from '../components/WarehouseCard'
import { DonateDialog } from '../components/DonateDialog'
import { Badge } from '../components/ui/badge'

export function ProfilePage() {
  const { user, login } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [incidents, setIncidents] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [inventories, setInventories] = useState<any[]>([])
  const [myLends, setMyLends] = useState<any[]>([])
  
  // Warehouse Dialog State
  const [isManagerOpen, setIsManagerOpen] = useState(false)
  const [isDonateOpen, setIsDonateOpen] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null)
  
  // Create Warehouse Form (Inline or Dialog? Let's do simple inline prompt for now, or simple creation)
  // For simplicity, let's use a prompt or simple state for creation name
  const [newWarehouseName, setNewWarehouseName] = useState('')
  const [newWarehouseAddr, setNewWarehouseAddr] = useState('')

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
    try {
      const [incidentsData, requestsData, inventoriesData, lendsData] = await Promise.all([
        getUserIncidents(user.user_id),
        getUserRequests(user.user_id),
        getMyInventories(user.user_id),
        getUserLends(user.user_id)
      ])
      setIncidents(incidentsData)
      setRequests(requestsData.map(parseNeed))
      setInventories(inventoriesData)
      setMyLends(lendsData || [])
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
        console.log('User data fetched', { inventories })
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
      
      const token = localStorage.getItem('disaster-relief-token') || ''
      login(updatedUser, token)
      
      setIsEditing(false)
      alert('資料更新成功')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('更新失敗')
    }
  }
  
  const handleCreateWarehouse = async () => {
      if (!newWarehouseName || !newWarehouseAddr) {
          alert('請輸入倉庫名稱與地址')
          return
      }
      try {
          await createInventory({
              owner_id: user?.user_id,
              name: newWarehouseName,
              address: newWarehouseAddr
          })
          setNewWarehouseName('')
          setNewWarehouseAddr('')
          fetchUserData()
          alert('倉庫建立成功')
      } catch (e) {
          console.error(e)
          alert('建立失敗')
      }
  }

  const openManager = (warehouse: any) => {
      setSelectedWarehouse(warehouse)
      setIsManagerOpen(true)
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
        <TabsList className="grid w-full grid-cols-5 lg:w-[625px]">
          <TabsTrigger value="profile">個人資料</TabsTrigger>
          <TabsTrigger value="incidents">我的災情</TabsTrigger>
          <TabsTrigger value="requests">我的需求</TabsTrigger>
          <TabsTrigger value="warehouses">我的倉庫</TabsTrigger>
          <TabsTrigger value="lends">我的借用</TabsTrigger>
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

        {/* Warehouses Tab */}
        <TabsContent value="warehouses" className="mt-6">
            <div className="space-y-6">
                {/* Create New */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">建立新倉庫</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 items-end">
                            <div className="space-y-1 flex-1">
                                <Label>倉庫名稱</Label>
                                <Input value={newWarehouseName} onChange={e => setNewWarehouseName(e.target.value)} placeholder="例如: 台北物資中心" />
                            </div>
                            <div className="space-y-1 flex-[2]">
                                <Label>地址</Label>
                                <Input value={newWarehouseAddr} onChange={e => setNewWarehouseAddr(e.target.value)} placeholder="輸入地址" />
                            </div>
                            <Button onClick={handleCreateWarehouse}>
                                <Plus className="w-4 h-4 mr-2" /> 建立
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* List */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {inventories.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-muted-foreground bg-slate-50 rounded-xl border border-dashed">
                             <Warehouse className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                             <p>尚無管理的倉庫</p>
                        </div>
                    ) : (
                        inventories.map((inv) => (
                             <WarehouseCard 
                                key={inv.inventory_id} 
                                warehouse={inv} 
                                onClick={openManager}
                                layoutId={`warehouse-${inv.inventory_id}`}
                                onDonate={() => {
                                    setSelectedWarehouse(inv)
                                    setIsDonateOpen(true)
                                }}
                             />
                        ))
                    )}
                </div>
            </div>
        </TabsContent>

        {/* Lends Tab */}
        <TabsContent value="lends" className="mt-6">
            <div className="space-y-4">
                {myLends.length === 0 ? (
                     <div className="col-span-full text-center py-12 text-muted-foreground bg-slate-50 rounded-xl border border-dashed">
                        <ArrowRightLeft className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                        <p>尚無借用紀錄</p>
                   </div>
                ) : (
                    myLends.map(lend => (
                        <div key={lend.lend_id} className="flex items-center justify-between p-4 border rounded-xl bg-white hover:shadow-sm transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <Package className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800 flex items-center gap-2">
                                        {lend.item_name}
                                        <Badge variant="outline" className="bg-slate-50">x{lend.qty}</Badge>
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1">
                                        申請時間: {new Date(lend.lend_at).toLocaleString()}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1 flex flex-col gap-1">
                                        <span className="flex items-center gap-1">
                                            <Warehouse className="w-3 h-3" />
                                            來源倉庫 ID: {lend.from_inventory_id}
                                        </span>
                                        {lend.to_inventory_id ? (
                                            <span className="flex items-center gap-1 text-blue-600">
                                                <ArrowRightLeft className="w-3 h-3" />
                                                存入倉庫 ID: {lend.to_inventory_id}
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-slate-400">
                                                (未存入倉庫)
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Badge className={`${
                                    lend.status === 'Borrowing' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                    lend.status === 'Pending' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                                    lend.status === 'Rejected' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                                    'bg-slate-100 text-slate-700 hover:bg-slate-100'
                                }`}>
                                    {lend.status === 'Borrowing' ? '借用中' : 
                                     lend.status === 'Pending' ? '審核中' :
                                     lend.status === 'Rejected' ? '已拒絕' : 
                                     lend.status === 'Returned' ? '已歸還' : lend.status}
                                </Badge>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </TabsContent>

      </Tabs>
      
      {/* Dialogs */}
      <AnimatePresence>
        {isManagerOpen && selectedWarehouse && (
          <WarehouseManagerDialog 
            isOpen={isManagerOpen} 
            onClose={() => setIsManagerOpen(false)} 
            warehouse={selectedWarehouse}
            onUpdate={fetchUserData}
            layoutId={`warehouse-${selectedWarehouse.inventory_id}`}
          />
        )}
      </AnimatePresence>

      <DonateDialog 
          isOpen={isDonateOpen}
          onClose={() => setIsDonateOpen(false)}
          warehouse={selectedWarehouse}
          userId={user?.user_id || 0}
      />
    </div>
  )
}
