import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { transferInventory, getInventoryById } from '../api/client'
import { MapPin, Warehouse, Loader2 } from 'lucide-react'

interface TransferDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  sourceInventoryId: number
  item: any
}

export function TransferDialog({ isOpen, onClose, onSuccess, sourceInventoryId, item }: TransferDialogProps) {
  const [targetId, setTargetId] = useState('')
  const [qty, setQty] = useState('')
  const [step, setStep] = useState<'input' | 'confirm'>('input')
  const [targetWarehouse, setTargetWarehouse] = useState<any>(null)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleNext = async () => {
      setError('')
      if (!targetId || !qty) {
          setError('請輸入目標倉庫 ID 與數量')
          return
      }

      if (parseInt(targetId) === sourceInventoryId) {
          setError('不能轉移到同一個倉庫')
          return
      }
      
      setLoading(true)
      try {
          const inv = await getInventoryById(parseInt(targetId))
          if (!inv || !inv.length) {
              setError('找不到該倉庫 ID')
          } else {
              setTargetWarehouse(inv[0]) // array returned
              setStep('confirm')
          }
      } catch (e) {
          setError('無法取得倉庫資訊，請確認 ID 是否正確')
      } finally {
          setLoading(false)
      }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await transferInventory({
         from_inventory_id: sourceInventoryId,
         to_inventory_id: parseInt(targetId),
         item_id: item.item_id,
         qty: parseInt(qty)
      })
      alert('轉移成功！')
      onSuccess()
      handleClose()
    } catch (error: any) {
      alert('轉移失敗: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
      setStep('input')
      setTargetId('')
      setQty('')
      setError('')
      setTargetWarehouse(null)
      onClose()
  }

  if (!item) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>轉移物資: {item.item_name}</DialogTitle>
          <DialogDescription>
             將物資捐贈/轉移至其他倉庫。
          </DialogDescription>
        </DialogHeader>

        {step === 'input' ? (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>目標倉庫 ID</Label>
                    <Input 
                        value={targetId}
                        onChange={(e) => setTargetId(e.target.value)}
                        placeholder="輸入對方倉庫 ID"
                    />
                </div>
                <div className="space-y-2">
                    <Label>數量 (庫存: {item.qty} {item.unit})</Label>
                    <Input 
                        type="number"
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                        max={item.qty}
                        min="1"
                        placeholder="輸入數量"
                    />
                </div>
                
                {error && <p className="text-sm text-red-500">{error}</p>}

                <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={handleClose}>取消</Button>
                    <Button onClick={handleNext} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        下一步: 確認資訊
                    </Button>
                </DialogFooter>
            </div>
        ) : (
            <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg space-y-3 border">
                    <h3 className="font-medium text-slate-900 flex items-center gap-2">
                        <Warehouse className="w-4 h-4 text-slate-500" />
                        目標倉庫資訊
                    </h3>
                    <div className="grid grid-cols-[80px_1fr] gap-2 text-sm">
                        <span className="text-slate-500">名稱:</span>
                        <span className="font-medium">{targetWarehouse?.name}</span>
                        
                        <span className="text-slate-500">ID:</span>
                        <span className="font-mono">{targetWarehouse?.inventory_id}</span>
                        
                        <span className="text-slate-500">地址:</span>
                        <span className="flex items-start gap-1">
                            <MapPin className="w-3 h-3 mt-1 text-slate-400" />
                            {targetWarehouse?.address}
                        </span>
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                     <h3 className="font-medium text-blue-900 mb-2">確認轉移內容</h3>
                     <div className="flex items-center justify-between text-blue-800">
                        <span>{item.item_name}</span>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">{qty}</span>
                            <span className="text-sm">{item.unit}</span>
                        </div>
                     </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={() => setStep('input')}>上一步</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        確認轉移
                    </Button>
                </DialogFooter>
            </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
