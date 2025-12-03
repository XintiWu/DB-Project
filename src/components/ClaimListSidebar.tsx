import { useClaimContext } from '../context/ClaimContext'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ALL_CATEGORIES } from '../lib/constants'
import { useNavigate } from 'react-router-dom'

export function ClaimListSidebar() {
  const { claimItems, removeFromClaimList, getTotalItems } = useClaimContext()
  const navigate = useNavigate()

  if (getTotalItems() === 0) {
    return (
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg dark:text-slate-100">認領清單</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground dark:text-slate-400">
            <p className="text-4xl mb-2">🛒</p>
            <p className="text-sm">尚無認領項目</p>
            <p className="text-xs mt-1">點擊「認領此需求」將項目加入清單</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg dark:text-slate-100">認領清單</CardTitle>
          <Badge variant="secondary">{getTotalItems()} 項</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="max-h-96 overflow-y-auto space-y-2">
          {claimItems.map((item) => {
            const category = ALL_CATEGORIES[item.category]
            return (
              <div
                key={item.needId}
                className="border dark:border-slate-600 rounded-lg p-3 space-y-2 hover:bg-accent/50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1 dark:text-slate-200">{item.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs">{category.icon}</span>
                      <span className="text-xs text-muted-foreground dark:text-slate-400">{category.name}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromClaimList(item.needId)}
                    className="text-muted-foreground dark:text-slate-400 hover:text-destructive dark:hover:text-red-400 transition-colors"
                    title="移除"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-sm">
                  <span className="font-medium dark:text-slate-200">{item.quantity}</span>
                  <span className="text-muted-foreground dark:text-slate-400"> {item.unit}</span>
                </div>
                {item.note && (
                  <p className="text-xs text-muted-foreground dark:text-slate-400 line-clamp-2">
                    備註：{item.note}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button 
          className="w-full" 
          size="lg"
          onClick={() => navigate('/claim/confirm')}
        >
          前往確認送出 ({getTotalItems()})
        </Button>
        <p className="text-xs text-muted-foreground dark:text-slate-400 text-center">
          送出前可隨時調整認領項目
        </p>
      </CardFooter>
    </Card>
  )
}


