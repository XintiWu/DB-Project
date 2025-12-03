import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import type { InventoryItem } from '../lib/types'
import { useLendItem } from '../hooks/useInventoryData'

interface LendDialogProps {
  item: InventoryItem | null
  onClose: () => void
  onSuccess?: () => void
}

export function LendDialog({ item, onClose, onSuccess }: LendDialogProps) {
  const [quantity, setQuantity] = useState(1)
  const [userName, setUserName] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [expectedReturnDate, setExpectedReturnDate] = useState('')
  const [note, setNote] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  
  const { lendItem, loading } = useLendItem()

  if (!item) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (quantity <= 0 || quantity > item.available_qty) {
      alert(`請輸入有效的數量（1-${item.available_qty}）`)
      return
    }

    if (!userName || !userPhone) {
      alert('請填寫姓名和聯絡電話')
      return
    }

    // 暫時使用隨機 user_id，實際應用應從登入系統獲取
    const userId = `USER${Date.now()}`

    const result = await lendItem({
      user_id: userId,
      item_id: item.item_id,
      qty: quantity,
      from_inventory_id: item.inventory_id
    })

    if (result.success) {
      setShowSuccess(true)
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 2000)
    } else {
      alert(result.message || '借用失敗，請稍後再試')
    }
  }

  if (showSuccess) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
            借用成功！
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            您已成功借用 {item.item_name} × {quantity} {item.unit}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            請前往「個人中心 → 我的借用記錄」查看詳情
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b dark:border-slate-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            🛒 借用物品
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 物品資訊 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
              {item.item_name}
            </h3>
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <div>📍 地點：{item.address}</div>
              <div>📦 可借數量：{item.available_qty} {item.unit}</div>
            </div>
          </div>

          {/* 借用數量 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              借用數量 <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                max={item.available_qty}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="flex-1"
                required
              />
              <span className="text-slate-600 dark:text-slate-400">{item.unit}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              最多可借 {item.available_qty} {item.unit}
            </p>
          </div>

          {/* 借用人姓名 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              姓名 <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="請輸入您的姓名"
              required
            />
          </div>

          {/* 聯絡電話 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              聯絡電話 <span className="text-red-500">*</span>
            </label>
            <Input
              type="tel"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              placeholder="0912-345-678"
              required
            />
          </div>

          {/* 預計歸還日期 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              預計歸還日期
            </label>
            <Input
              type="date"
              value={expectedReturnDate}
              onChange={(e) => setExpectedReturnDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* 備註 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              備註
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="有任何特殊需求或說明，請在此填寫"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
              rows={3}
            />
          </div>

          {/* 提示訊息 */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              💡 提醒：借用物品後請妥善保管，使用完畢請盡快歸還，讓資源能幫助更多人。
            </p>
          </div>

          {/* 按鈕 */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              取消
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? '處理中...' : '確認借用'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

