import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { 
  updateInventory, 
  getInventoryItems, 
  addInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem,
  getInventoryOwners,
  addInventoryOwner,
  removeInventoryOwner,
  getAllItems
} from '../api/client'
import { Trash2, Plus, Save, Users, Package, Settings, Search } from 'lucide-react'
import { ALL_CATEGORIES } from '../lib/constants'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"

interface WarehouseManagerProps {
  isOpen: boolean
  onClose: () => void
  warehouse: any
  onUpdate: () => void
}

export function WarehouseManagerDialog({ isOpen, onClose, warehouse, onUpdate }: WarehouseManagerProps) {
  const [activeTab, setActiveTab] = useState('items')
  const [items, setItems] = useState<any[]>([])
  const [owners, setOwners] = useState<any[]>([])
  const [allItems, setAllItems] = useState<any[]>([]) // For adding new items
  const [loading, setLoading] = useState(false)
  
  // Info Form State
  const [infoForm, setInfoForm] = useState({ name: '', address: '', status: '' })
  
  // New Item State
  const [newItemId, setNewItemId] = useState('')
  const [newItemQty, setNewItemQty] = useState('')

  // New Owner State
  const [newOwnerId, setNewOwnerId] = useState('')

  useEffect(() => {
    if (warehouse && isOpen) {
      setInfoForm({
        name: warehouse.name || '',
        address: warehouse.address || '',
        status: warehouse.status || 'Active'
      })
      fetchDetails()
      fetchAllSystemItems()
    }
  }, [warehouse, isOpen])

  const fetchDetails = async () => {
    setLoading(true)
    try {
      const [itemsData, ownersData] = await Promise.all([
        getInventoryItems(warehouse.inventory_id),
        getInventoryOwners(warehouse.inventory_id)
      ])
      setItems(itemsData)
      setOwners(ownersData)
    } catch (error) {
      console.error('Error fetching warehouse details:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllSystemItems = async () => {
      try {
          const res = await getAllItems()
          setAllItems(res)
      } catch (e) {
          console.error(e)
      }
  }

  // --- Info Actions ---
  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateInventory(warehouse.inventory_id, {
        ...infoForm
      })
      alert('資訊更新成功')
      onUpdate()
    } catch (error) {
      alert('更新失敗')
    }
  }

  // --- Item Actions ---
  const handleAddItem = async () => {
    if (!newItemId || !newItemQty) return
    try {
      await addInventoryItem({
        inventory_id: warehouse.inventory_id,
        item_id: parseInt(newItemId),
        qty: parseInt(newItemQty),
        status: 'Active'
      })
      setNewItemId('')
      setNewItemQty('')
      fetchDetails()
    } catch (error) {
      alert('新增物品失敗')
    }
  }

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('確定要移除此物品嗎？')) return
    try {
      await deleteInventoryItem(warehouse.inventory_id, itemId)
      fetchDetails()
    } catch (error) {
      alert('移除失敗')
    }
  }

  const handleUpdateItemQty = async (itemId: number, newQty: number) => {
      try {
          await updateInventoryItem(warehouse.inventory_id, itemId, {
            qty: newQty,
            status: 'Active' // Preserve status or allow generic update
          })
          fetchDetails()
      } catch (error) {
          console.error(error)
      }
  }

  // --- Owner Actions ---
  const handleAddOwner = async () => {
      if (!newOwnerId) return
      try {
          await addInventoryOwner({
              inventory_id: warehouse.inventory_id,
              user_id: parseInt(newOwnerId)
          })
          setNewOwnerId('')
          fetchDetails()
      } catch (error) {
          alert('新增管理員失敗 (請確認該 ID 存在)')
      }
  }

  const handleRemoveOwner = async (userId: number) => {
      if (!confirm('確定要移除此管理員嗎？')) return
      try {
          await removeInventoryOwner(warehouse.inventory_id, userId)
          fetchDetails()
      } catch (error) {
          alert('移除失敗')
      }
  }

  if (!warehouse) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>管理倉庫: {warehouse.name || '未命名'}</DialogTitle>
          <DialogDescription>ID: {warehouse.inventory_id}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="items"><Package className="w-4 h-4 mr-2"/> 庫存物品</TabsTrigger>
            <TabsTrigger value="info"><Settings className="w-4 h-4 mr-2"/> 基本資訊</TabsTrigger>
            <TabsTrigger value="team"><Users className="w-4 h-4 mr-2"/> 管理團隊</TabsTrigger>
          </TabsList>

          {/* ITEMS TAB */}
          <TabsContent value="items" className="space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row gap-3 items-end border-b pb-6">
               <div className="space-y-2 flex-1 w-full">
                 <Label>選擇物品</Label>
                 <Select value={newItemId} onValueChange={setNewItemId}>
                    <SelectTrigger>
                        <SelectValue placeholder="請選擇物品..." />
                    </SelectTrigger>
                    <SelectContent>
                        {allItems.map(item => (
                            <SelectItem key={item.item_id} value={item.item_id.toString()}>
                                {item.item_name} ({item.unit})
                            </SelectItem>
                        ))}
                    </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2 w-full sm:w-28">
                 <Label>數量</Label>
                 <Input 
                    type="number" 
                    value={newItemQty} 
                    onChange={(e) => setNewItemQty(e.target.value)}
                    placeholder="0"
                 />
               </div>
               <div className="w-full sm:w-auto">
                    <Button onClick={handleAddItem} disabled={!newItemId || !newItemQty} className="w-full">
                        <Plus className="w-4 h-4 mr-2" /> 新增
                    </Button>
               </div>
            </div>

            <div className="space-y-2">
                {items.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8 bg-slate-50 rounded-lg border border-dashed">
                        <Package className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        暫無庫存
                    </div>
                ) : (
                    items.map(item => (
                        <div key={item.item_id} className="flex items-center justify-between p-4 border rounded-xl bg-white hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800">{item.item_name}</div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                        <span className="font-mono">ID: {item.item_id}</span>
                                        {/* Optional: Add Category Badge here if available */}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center bg-slate-100 rounded-lg p-1">
                                   <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-white hover:shadow-sm" onClick={() => handleUpdateItemQty(item.item_id, item.qty - 1)}>-</Button>
                                   <span className="w-16 text-center text-sm font-medium">{item.qty} <span className="text-xs text-muted-foreground">{item.unit}</span></span>
                                   <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-white hover:shadow-sm" onClick={() => handleUpdateItemQty(item.item_id, item.qty + 1)}>+</Button>
                                </div>
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full" onClick={() => handleDeleteItem(item.item_id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
          </TabsContent>

          {/* INFO TAB */}
          <TabsContent value="info" className="space-y-4 mt-6">
             <form onSubmit={handleUpdateInfo} className="space-y-4">
                <div className="space-y-2">
                    <Label>倉庫名稱</Label>
                    <Input 
                        value={infoForm.name} 
                        onChange={(e) => setInfoForm({...infoForm, name: e.target.value})} 
                    />
                </div>
                <div className="space-y-2">
                    <Label>地址 / 位置</Label>
                    <Input 
                        value={infoForm.address} 
                        onChange={(e) => setInfoForm({...infoForm, address: e.target.value})} 
                    />
                </div>
                <div className="space-y-2">
                    <Label>狀態</Label>
                     <Select value={infoForm.status} onValueChange={(val) => setInfoForm({...infoForm, status: val})}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Active">運作中 (Active)</SelectItem>
                            <SelectItem value="Inactive">暫停運作 (Inactive)</SelectItem>
                        </SelectContent>
                     </Select>
                </div>
                <div className="pt-2">
                    <Button type="submit" className="w-full sm:w-auto">
                        <Save className="w-4 h-4 mr-2" /> 儲存變更
                    </Button>
                </div>
             </form>
          </TabsContent>

          {/* TEAM TAB */}
          <TabsContent value="team" className="space-y-4 mt-4">
            <div className="flex gap-2 items-end border-b pb-4">
               <div className="space-y-1 flex-1">
                 <Label>新增管理員 (User ID)</Label>
                 <Input 
                    placeholder="輸入使用者 ID"
                    value={newOwnerId}
                    onChange={(e) => setNewOwnerId(e.target.value)}
                 />
               </div>
               <Button onClick={handleAddOwner} disabled={!newOwnerId}>
                  <Plus className="w-4 h-4 mr-1" /> 新增
               </Button>
            </div>
            
            <div className="space-y-2">
                <Label>目前管理團隊</Label>
                {owners.map(owner => (
                    <div key={owner.owner_id} className="flex items-center justify-between p-3 border rounded bg-slate-50">
                        <div>
                             <div className="font-medium">{owner.name}</div>
                             <div className="text-xs text-muted-foreground">{owner.email} (ID: {owner.owner_id})</div>
                        </div>
                        {owners.length > 1 && (
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleRemoveOwner(owner.owner_id)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
