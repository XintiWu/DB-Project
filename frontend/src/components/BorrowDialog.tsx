import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { createLend, getMyInventories } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface BorrowDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  inventoryId: number
  item: any
}

export function BorrowDialog({ isOpen, onClose, onSuccess, inventoryId, item }: BorrowDialogProps) {
  const { user } = useAuth()
  const [qty, setQty] = useState('')
  const [targetWarehouseId, setTargetWarehouseId] = useState<string>('')
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && user) {
        getMyInventories(user.user_id)
            .then(data => setWarehouses(data || []))
            .catch(err => console.error(err))
    }
  }, [isOpen, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!qty) return
    if (!user) {
        alert('請先登入')
        return
    }

    setLoading(true)
    try {
      await createLend({
         user_id: user.user_id,
         from_inventory_id: inventoryId,
         item_id: item.item_id,
         qty: parseInt(qty),
         type: 'BORROW',
         status: 'Pending',
         to_inventory_id: (targetWarehouseId && targetWarehouseId !== "0") ? parseInt(targetWarehouseId) : null
      })
      alert('申請已送出，請等待管理員核准。')
      onSuccess()
      onClose()
    } catch (error: any) {
      alert('借用失敗: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!item) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-white z-[99999]">
        <DialogHeader>
          <DialogTitle>借用物品: {item.item_name}</DialogTitle>
          <DialogDescription>
             填寫借用數量與選擇存放倉庫（選填）。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>數量 (庫存: {item.qty})</Label>
                <Input 
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    max={item.qty}
                    min="1"
                    placeholder="輸入數量"
                />
            </div>

            <div className="space-y-2">
                <Label>存放至我的倉庫 (選填)</Label>
                <Select value={targetWarehouseId} onValueChange={setTargetWarehouseId}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="選擇倉庫 (預設不存入)" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-[100000]">
                        <SelectItem value="0">不存入倉庫</SelectItem>
                        {warehouses.filter(w => w.inventory_id !== inventoryId).map(w => (
                            <SelectItem key={w.inventory_id} value={w.inventory_id.toString()}>
                                {w.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">若選擇倉庫，核准後物品將以「Borrowed」狀態加入該倉庫。</p>
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>取消</Button>
                <Button type="submit" disabled={loading}>確認借用</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
