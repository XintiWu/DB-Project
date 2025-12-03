import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { useTheme } from '../context/ThemeContext'

export function ProfilePage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const menuItems = [
    {
      icon: '📋',
      title: '我的需求發布',
      description: '查看和管理您發布的需求',
      path: '/publish',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    },
    {
      icon: '🤝',
      title: '我的認領記錄',
      description: '查看您認領的需求項目',
      path: '/claim/confirm',
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    },
    {
      icon: '🚨',
      title: '我的災情通報',
      description: '查看您通報的災情',
      path: '/incidents',
      color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    },
    {
      icon: '📦',
      title: '我的借用記錄',
      description: '管理您借用的物品',
      path: '/profile/lends',
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
    },
    {
      icon: '💰',
      title: '捐款紀錄',
      description: '查看平台捐款透明度報告',
      path: '/donations',
      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 sticky top-0 z-40 backdrop-blur-lg bg-opacity-95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="cursor-pointer" onClick={() => navigate('/')}>
              <h1 className="text-2xl font-bold text-primary dark:text-slate-100">🚨 救災資源配對平台</h1>
              <p className="text-sm text-muted-foreground dark:text-slate-400">個人中心</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {theme === 'dark' ? '🌞' : '🌙'}
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                🏠 首頁
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-3xl font-bold text-white mb-2">
            個人中心
          </h2>
          <p className="text-white/90">
            管理您的所有活動和記錄
          </p>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 功能選單 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {menuItems.map((item) => (
              <Card
                key={item.path}
                className="p-6 hover:shadow-lg transition-all cursor-pointer dark:bg-slate-800 dark:border-slate-700 group"
                onClick={() => navigate(item.path)}
              >
                <div className="flex items-start gap-4">
                  <div className={`text-4xl p-3 rounded-lg ${item.color}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {item.description}
                    </p>
                  </div>
                  <div className="text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    →
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* 快速操作 */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">
              ⚡ 快速操作
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate('/publish')}>
                ➕ 發布需求
              </Button>
              <Button variant="outline" onClick={() => navigate('/incidents/report')}>
                🚨 通報災情
              </Button>
              <Button variant="outline" onClick={() => navigate('/volunteer')}>
                📋 瀏覽需求
              </Button>
              <Button variant="outline" onClick={() => navigate('/inventory')}>
                📦 查詢物資
              </Button>
              <Button variant="outline" onClick={() => navigate('/shelters')}>
                🏠 查看避難所
              </Button>
            </div>
          </div>

          {/* 說明 */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
              💡 使用提示
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-disc list-inside">
              <li>您可以在個人中心查看和管理所有活動記錄</li>
              <li>發布需求時請提供詳細資訊，有助於志工快速協助</li>
              <li>借用物品後請妥善保管，使用完畢盡快歸還</li>
              <li>通報災情時請確保資訊真實準確</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

