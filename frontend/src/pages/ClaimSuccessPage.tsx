import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { CheckCircle } from 'lucide-react'

export function ClaimSuccessPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
      <div className="text-green-500">
        <CheckCircle className="h-24 w-24" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">認領成功！</h1>
        <p className="text-slate-600 max-w-md mx-auto">
          感謝您的愛心！系統已收到您的認領資訊，需求發布者將會盡快與您聯繫確認後續事宜。
        </p>
      </div>

      <div className="flex gap-4">
        <Button onClick={() => navigate('/')} variant="outline">
          返回首頁
        </Button>
        <Button onClick={() => navigate('/volunteer')} className="bg-blue-600 hover:bg-blue-700">
          繼續認領
        </Button>
      </div>
    </div>
  )
}
