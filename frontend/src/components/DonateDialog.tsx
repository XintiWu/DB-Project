import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog' // Adjusted import path
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { createLend, createProvide, getAllItems } from '../api/client' // Ensure paths are correct
import { HandHeart, ArrowRightLeft } from 'lucide-react'

interface DonateDialogProps {
  isOpen: boolean
  onClose: () => void
  warehouse: any
  userId: string | number
}

export function DonateDialog({ isOpen, onClose, warehouse, userId }: DonateDialogProps) {
  const [actionType, setActionType] = useState<'donate' | 'lend'>('donate')
  const [itemId, setItemId] = useState('')
  const [qty, setQty] = useState('')
  const [allItems, setAllItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
        fetchAllItems()
    }
  }, [isOpen])

  const fetchAllItems = async () => {
      try {
          const res = await getAllItems()
          setAllItems(res)
      } catch (e) {
          console.error(e)
      }
  }

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!itemId || !qty) return
      
      setLoading(true)
      try {
          if (actionType === 'donate') {
              await createProvide({
                  user_id: userId,
                  inventory_id: warehouse.inventory_id,
                  item_id: parseInt(itemId),
                  qty: parseInt(qty)
              })
              alert('捐贈成功！感謝您的愛心。')
          } else {
              // Lend: User lends TO warehouse
              await createLend({
                  user_id: userId,
                  from_inventory_id: warehouse.inventory_id, // "Target" inventory for LEND type
                  item_id: parseInt(itemId),
                  qty: parseInt(qty),
                  type: 'LEND'
              })
               alert('出借成功！物品已加入倉庫。')
          }
          onClose()
      } catch (error: any) {
          alert('操作失敗: ' + error.message)
      } finally {
          setLoading(false)
      }
  }

  if (!warehouse) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>提供物資給: {warehouse.name}</DialogTitle>
          <DialogDescription>
             請選擇您要捐贈或出借的物品。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            
            <div className="space-y-3">
                <Label>操作類型</Label>
                <RadioGroup defaultValue="donate" value={actionType} onValueChange={(v) => setActionType(v as 'donate' | 'lend')} className="grid grid-cols-2 gap-4">
                    <div>
                        <RadioGroupItem value="donate" id="donate" className="peer sr-only" />
                        <Label
                            htmlFor="donate"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer"
                        >
                            <HandHeart className="mb-2 h-6 w-6" />
                            捐贈 (Donate)
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="lend" id="lend" className="peer sr-only" />
                        <Label
                            htmlFor="lend"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer"
                        >
                            <ArrowRightLeft className="mb-2 h-6 w-6" />
                            出借 (Lend)
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="space-y-2">
                 <Label>選擇物品</Label>
                 <Select value={itemId} onValueChange={setItemId}>
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

            <div className="space-y-2">
                 <Label>數量</Label>
                 <Input 
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    placeholder="輸入數量"
                    min="1"
                 />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '處理中...' : '確認提交'}
            </Button>

        </form>
      </DialogContent>
    </Dialog>
  )
}
