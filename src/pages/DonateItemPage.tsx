import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'

export function DonateItemPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary dark:text-slate-100">📦 捐贈物品</h1>
            <Button variant="ghost" onClick={() => navigate('/inventory')}>
              ← 返回物資查詢
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 text-center max-w-2xl mx-auto">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            功能開發中
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            物品捐贈功能正在開發中，敬請期待！
          </p>
          <Button onClick={() => navigate('/inventory')}>
            返回物資查詢
          </Button>
        </div>
      </div>
    </div>
  )
}

