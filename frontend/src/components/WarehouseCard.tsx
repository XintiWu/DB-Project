import { MapPin, Warehouse, Package, Users } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from './ui/card'
import { motion } from 'framer-motion'

interface WarehouseCardProps {
  warehouse: any
  onClick: (warehouse: any) => void
  layoutId?: string
}

export function WarehouseCard({ warehouse, onClick, layoutId }: Omit<WarehouseCardProps, 'onDonate'>) {
  const isInactive = warehouse.status === 'Inactive'

  return (
    <motion.div
      layoutId={layoutId}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="h-full"
    >
      <Card 
        className={`flex flex-col h-full hover:shadow-lg transition-all cursor-pointer bg-white ${isInactive ? 'opacity-70' : ''}`}
        onClick={() => onClick(warehouse)}
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Warehouse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight line-clamp-1">
                  {warehouse.name || `倉庫 #${warehouse.inventory_id}`}
                </h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  <span className="line-clamp-1">{warehouse.address}</span>
                </div>
              </div>
            </div>
            <Badge variant={isInactive ? "outline" : "default"} className={isInactive ? "text-slate-500 border-slate-200" : "bg-green-500 hover:bg-green-600"}>
              {isInactive ? '暫停' : '運作中'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 flex-1 space-y-3">
          <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-2">
            <div className="flex justify-between items-center text-slate-600">
                <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    <span>庫存物品</span>
                </div>
                <span className="font-medium">{warehouse.item_count || 0} 項目</span>
            </div>
             <div className="flex justify-between items-center text-slate-600">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>管理 ID</span>
                </div>
                <span className="font-mono text-xs">{warehouse.inventory_id}</span>
            </div>
          </div>
          
          <div className="text-xs text-slate-300 text-right">
             更新: {new Date(warehouse.updated_at).toLocaleDateString()}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button 
            variant="outline"
            className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
            onClick={(e) => {
              e.stopPropagation();
              onClick(warehouse);
            }}
          >
            管理倉庫
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
