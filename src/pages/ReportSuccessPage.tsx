import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'

export function ReportSuccessPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
          通報成功！
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          您的災情通報已成功提交，我們的管理團隊將盡快審核並處理。
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm">
            📌 接下來會發生什麼？
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
            <li>管理員將在 24 小時內審核您的通報</li>
            <li>審核通過後，災情將顯示在災情列表中</li>
            <li>相關單位將根據情況採取行動</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => navigate('/incidents')}
            className="w-full"
          >
            查看災情列表
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="w-full"
          >
            返回首頁
          </Button>
        </div>
      </div>
    </div>
  )
}

