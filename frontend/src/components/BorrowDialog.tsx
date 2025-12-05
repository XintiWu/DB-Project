import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { createLend } from '../api/client'
import { useAuth } from '../context/AuthContext'

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
  const [loading, setLoading] = useState(false)

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
         status: 'Pending'
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
             填寫借用數量。
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
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>取消</Button>
                <Button type="submit" disabled={loading}>確認借用</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
