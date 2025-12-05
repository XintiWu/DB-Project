import { useState, useEffect } from 'react'
import { getAllInventories, getAllItems, getInventoryItems } from '../api/client'
import type { Inventory, Item } from '../lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { MapPin, Package, Warehouse, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function ResourcesPage() {
  const [inventories, setInventories] = useState<Inventory[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal state
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null)
  const [inventoryItems, setInventoryItems] = useState<any[]>([])
  const [loadingItems, setLoadingItems] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [invData, itemData] = await Promise.all([
          getAllInventories(),
          getAllItems()
        ])
        setInventories(invData)
        setItems(itemData)
      } catch (err) {
        console.error('Failed to fetch resources:', err)
        setError('無法載入資源資料')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleInventoryClick = async (inv: Inventory) => {
    setSelectedInventory(inv)
    setLoadingItems(true)
    try {
      const items = await getInventoryItems(inv.inventory_id)
      setInventoryItems(items)
    } catch (err) {
      console.error('Failed to fetch inventory items:', err)
    } finally {
      setLoadingItems(false)
    }
  }

  if (loading) return <div className="text-center py-12">載入中...</div>
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>

  return (
    <div className="space-y-8 relative">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">物資資源</h1>
        <p className="text-muted-foreground mt-2">
          檢視各倉庫位置及可用物資清單。
        </p>
      </div>

      {/* Warehouses Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Warehouse className="h-5 w-5" />
          倉庫據點
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventories.map((inv) => (
            <Card 
              key={inv.inventory_id} 
              className="hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300"
              onClick={() => handleInventoryClick(inv)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Warehouse className="h-5 w-5 text-indigo-500" />
                  <CardTitle className="text-lg">
                    倉庫 #{inv.inventory_id}
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
          ))}
        </div>
      </section>

      {/* Items Section */}
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
      {/* Warehouse Detail Modal */}
      <AnimatePresence>
        {selectedInventory && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              className="absolute inset-0 bg-black/30"
              onClick={() => setSelectedInventory(null)}
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              transition={{ duration: 0.3 }}
            />
            
            <motion.div 
              className="relative w-full max-w-2xl max-h-[80vh] flex flex-col rounded-xl overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                border: '1px solid rgba(255, 255, 255, 0.18)'
              }}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/20 bg-white/40">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                    <Warehouse className="h-5 w-5 text-indigo-500" />
                    倉庫 #{selectedInventory.inventory_id} 庫存詳情
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
                  <div className="text-center py-8 text-slate-500">載入庫存中...</div>
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
                          <InventoryItemCard key={idx} item={item} />
                        ))}
                      </div>
                    </TabsContent>

                    {Array.from(new Set(inventoryItems.map(i => i.category_name))).map((cat: any) => (
                      <TabsContent key={cat} value={cat} className="mt-0">
                        <div className="grid gap-4">
                          {inventoryItems.filter(i => i.category_name === cat).map((item, idx) => (
                            <InventoryItemCard key={idx} item={item} />
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
        )}
      </AnimatePresence>
    </div>
  )
}

function InventoryItemCard({ item }: { item: any }) {
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
      <div className="text-sm text-slate-600">
        {item.unit}
      </div>
    </div>
  )
}
