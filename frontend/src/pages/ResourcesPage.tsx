import { useState, useEffect } from 'react'
import { getAllInventories, getAllItems, getInventoryItems, getMyInventories } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { Inventory, Item } from '../lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { MapPin, Package, Warehouse, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { BorrowDialog } from '../components/BorrowDialog'

export function ResourcesPage() {
  const [inventories, setInventories] = useState<Inventory[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Modal state
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null)
  const [inventoryItems, setInventoryItems] = useState<any[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [borrowItem, setBorrowItem] = useState<any>(null)
  
  const { user } = useAuth()
  const [myInventoryIds, setMyInventoryIds] = useState<Set<number>>(new Set())

  // Fetch Items once
  useEffect(() => {
     getAllItems().then(data => setItems(data)).catch(console.error)
  }, [])

  // Fetch Inventories on page change
  useEffect(() => {
    async function fetchInventories() {
      setLoading(true)
      try {
        const response: any = await getAllInventories({ page, limit: 12 })
        let data = []
        if (response.data) {
            data = response.data
            setTotalPages(response.meta.totalPages)
        } else if (Array.isArray(response)) {
            data = response
        }
        setInventories(data)
      } catch (err) {
        console.error('Failed to fetch resources:', err)
        setError('無法載入資源資料')
      } finally {
        setLoading(false)
      }
    }
    fetchInventories()
  }, [page])

  useEffect(() => {
      if (user) {
          getMyInventories(user.user_id).then(invs => {
              setMyInventoryIds(new Set(invs.map((i: any) => i.inventory_id)))
          }).catch(console.error)
      }
  }, [user])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedInventory) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedInventory])

  const handleInventoryClick = async (inv: Inventory) => {
    setSelectedInventory(inv)
    setLoadingItems(true)
    setInventoryItems([]) // Clear previous items to ensure clean state
    try {
      const items = await getInventoryItems(inv.inventory_id, 'Owned')
      setInventoryItems(items)
    } catch (err) {
      console.error('Failed to fetch inventory items:', err)
    } finally {
      setLoadingItems(false)
    }
  }

  if (loading && page === 1 && inventories.length === 0) return <div className="text-center py-12">載入中...</div>
  
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>

  return (
    <div className="space-y-8 relative">
       {/* ... existing header ... */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">物資資源</h1>
        <p className="text-muted-foreground mt-2">
          檢視各倉庫位置及可用物資清單。
        </p>
      </div>

       {/* ... existing sections ... */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Warehouse className="h-5 w-5" />
          倉庫據點
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {inventories.length === 0 ? (
             <div className="col-span-full text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed">
                <Warehouse className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="text-lg font-medium text-slate-900">目前沒有公開的倉庫</p>
                <p className="text-sm text-slate-500">所有的倉庫目前都處於私有或暫停狀態。</p>
             </div>
          ) : (
             inventories.map((inv) => (
            <motion.div
              layoutId={`card-${inv.inventory_id}`}
              key={inv.inventory_id}
              onClick={() => handleInventoryClick(inv)}
              className="cursor-pointer bg-white rounded-xl"
            >
              <motion.div animate={{ opacity: selectedInventory?.inventory_id === inv.inventory_id ? 0 : 1 }} transition={{ duration: 0.3 }}>
                <Card className="hover:shadow-md transition-shadow hover:border-blue-300 h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Warehouse className="h-5 w-5 text-indigo-500" />
                      <CardTitle className="text-lg">
                      {inv.name || `倉庫 #${inv.inventory_id}`}
                    </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{inv.address}</span>
                    </div>
                    {inv.owner_id && (
                      <div className="mt-2 text-xs text-slate-500">
                        Owner ID: {inv.owner_id}
                      </div>
                    )}
                    <div className="mt-4 text-xs text-blue-600 font-medium">
                      點擊查看庫存 &rarr;
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )))}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-4 mt-8">
            <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium rounded-md bg-white border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            上一頁
            </button>
            <span className="text-sm font-medium text-slate-600">
                第 {page} 頁 / 共 {totalPages} 頁
            </span>
            <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-medium rounded-md bg-white border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            下一頁
            </button>
        </div>
      </section>

      {/* Items Section (Static List - Optional, skipping change here) */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5" />
          所有物資清單
        </h2>
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-700">物品名稱</th>
                <th className="px-4 py-3 font-medium text-slate-700">類別</th>
                <th className="px-4 py-3 font-medium text-slate-700">單位</th>
                <th className="px-4 py-3 font-medium text-slate-700">ID</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => (
                <tr key={item.item_id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{item.item_name}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{item.category_name || '未分類'}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{item.unit}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{item.item_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Warehouse Detail Modal */}
      <AnimatePresence>
        {selectedInventory && (
          <div className="fixed top-0 left-0 h-screen w-screen z-[9999] flex items-center justify-center p-4">
            <motion.div 
              className="absolute inset-0 bg-black/20 backdrop-blur-sm z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInventory(null)}
            />
            
            <motion.div 
              layoutId={`card-${selectedInventory.inventory_id}`}
              className="relative z-50 w-full max-w-2xl max-h-[80vh] flex flex-col rounded-xl overflow-hidden bg-white/85 backdrop-blur-xl shadow-2xl border border-white/20"
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div 
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0 }}
                className="flex flex-col h-full"
              >
                <div className="flex items-center justify-between p-6 border-b border-white/20 bg-white/40">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                      <Warehouse className="h-5 w-5 text-indigo-500" />
                      {selectedInventory.name || `倉庫 #${selectedInventory.inventory_id}`} 庫存詳情
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {selectedInventory.address}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedInventory(null)}
                    className="p-2 hover:bg-black/5 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1">
                  {loadingItems ? (
                    <div className="grid gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <InventoryItemSkeleton key={i} />
                      ))}
                    </div>
                  ) : inventoryItems.length > 0 ? (
                    <Tabs defaultValue="all" className="w-full">
                      <TabsList className="mb-4 flex flex-wrap h-auto gap-2 bg-transparent p-0 justify-start">
                        <TabsTrigger value="all" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700 border border-transparent data-[state=active]:border-indigo-200">
                          全部 ({inventoryItems.length})
                        </TabsTrigger>
                        {Array.from(new Set(inventoryItems.map(i => i.category_name))).map((cat: any) => (
                          <TabsTrigger 
                            key={cat} 
                            value={cat}
                            className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700 border border-transparent data-[state=active]:border-indigo-200"
                          >
                            {cat} ({inventoryItems.filter(i => i.category_name === cat).length})
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      <TabsContent value="all" className="mt-0">
                        <div className="grid gap-4">
                          {inventoryItems.map((item, idx) => (
                            <InventoryItemCard 
                                key={idx} 
                                item={item} 
                                onBorrow={() => setBorrowItem(item)} 
                                isOwner={selectedInventory && myInventoryIds.has(Number(selectedInventory.inventory_id))}
                            />
                          ))}
                        </div>
                      </TabsContent>

                      {Array.from(new Set(inventoryItems.map(i => i.category_name))).map((cat: any) => (
                        <TabsContent key={cat} value={cat} className="mt-0">
                          <div className="grid gap-4">
                            {inventoryItems.filter(i => i.category_name === cat).map((item, idx) => (
                              <InventoryItemCard 
                                key={idx} 
                                item={item} 
                                onBorrow={() => setBorrowItem(item)} 
                                isOwner={selectedInventory && myInventoryIds.has(Number(selectedInventory.inventory_id))}
                              />
                            ))}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  ) : (
                    <div className="text-center py-12 text-slate-500 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                      <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>此倉庫目前沒有庫存</p>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t border-white/20 bg-white/40 flex justify-end">
                  <button 
                    onClick={() => setSelectedInventory(null)}
                    className="px-4 py-2 bg-white/50 border border-white/20 rounded-md hover:bg-white/80 text-sm font-medium transition-colors"
                  >
                    關閉
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BorrowDialog 
        isOpen={!!borrowItem}
        onClose={() => setBorrowItem(null)}
        onSuccess={() => selectedInventory && handleInventoryClick(selectedInventory)}
        inventoryId={Number(selectedInventory?.inventory_id || 0)}
        item={borrowItem}
      />
    </div>
  )
}


function InventoryItemCard({ item, onBorrow, isOwner }: { item: any, onBorrow?: () => void, isOwner?: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 border border-white/20 rounded-lg hover:bg-white/50 bg-white/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
          {item.qty}
        </div>
        <div>
          <p className="font-medium text-slate-900">{item.item_name}</p>
          <p className="text-xs text-slate-500">
            {item.category_name} • ID: {item.item_id}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-slate-600">
          {item.unit}
        </div>
        <button 
            onClick={(e) => {
                if (isOwner) return;
                e.stopPropagation()
                onBorrow?.()
            }}
            disabled={isOwner}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                isOwner 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
        >
            {isOwner ? '持有' : '借用'}
        </button>
      </div>
    </div>
  )
}



function InventoryItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 border border-white/20 rounded-lg bg-white/30">
      <div className="flex items-center gap-3 w-full">
        <div className="relative h-10 w-10 rounded-full bg-slate-200/50 overflow-hidden shrink-0">
           <Shimmer />
        </div>
        <div className="space-y-2 flex-1">
          <div className="relative h-4 w-24 bg-slate-200/50 rounded overflow-hidden">
            <Shimmer />
          </div>
          <div className="relative h-3 w-32 bg-slate-200/50 rounded overflow-hidden">
            <Shimmer />
          </div>
        </div>
      </div>
    </div>
  )
}

function Shimmer() {
  return (
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
      initial={{ x: '-100%' }}
      animate={{ x: '100%' }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
    />
  )
}
