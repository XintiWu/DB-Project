import { Link, Outlet, useLocation } from 'react-router-dom'
import { HeartHandshake, Home, PlusCircle, ShoppingCart, AlertTriangle, Package, DollarSign, Shield } from 'lucide-react'
import { cn } from '../lib/utils'
import { useAuth } from '../context/AuthContext'
import { useClaimContext } from '../context/ClaimContext'
import { useClickTracking } from '../hooks/useClickTracking'

function ClaimBadge() {
  const { getTotalItems } = useClaimContext()
  const count = getTotalItems()
  
  if (count === 0) return null
  
  return (
    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
      {count}
    </span>
  )
}

function AuthButtons() {
  const { user, logout, isAuthenticated } = useAuth()
  const { track } = useClickTracking()

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        <Link 
          to="/profile" 
          onClick={() => track('profile_click', '個人資料')}
          className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
        >
          Hi, {user.name} ({user.role})
        </Link>
        <button 
          onClick={() => {
            track('logout_click', '登出')
            logout()
          }}
          className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
        >
          登出
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link 
        to="/login" 
        onClick={() => track('login_click', '登入')}
        className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
      >
        登入
      </Link>
      <Link 
        to="/register" 
        onClick={() => track('register_click', '註冊')}
        className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
      >
        註冊
      </Link>
    </div>
  )
}

export function Layout() {
  const location = useLocation()
  const { user } = useAuth()
  const { track } = useClickTracking()

  const navItems = [
    { href: '/', label: '首頁', icon: Home },
    { href: '/publish', label: '發布需求', icon: PlusCircle },
  ]

  const handleNavClick = (href: string, label: string) => {
    track('nav_click', label, { href })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-blue-600 hover:opacity-80 transition-opacity">
            <HeartHandshake className="h-8 w-8" />
            <span className="font-bold text-xl tracking-tight">DisasterRelief</span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link 
              to="/requests" 
              onClick={() => handleNavClick('/requests', '需求列表')}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors px-4 py-2 rounded-full hover:bg-white/50"
            >
              <HeartHandshake className="h-4 w-4" />
              <span>需求列表</span>
            </Link>
            <Link 
              to="/incidents" 
              onClick={() => handleNavClick('/incidents', '災情')}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors px-4 py-2 rounded-full hover:bg-white/50"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>災情</span>
            </Link>
            <Link 
              to="/shelters" 
              onClick={() => handleNavClick('/shelters', '避難所')}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors px-4 py-2 rounded-full hover:bg-white/50"
            >
              <Home className="h-4 w-4" />
              <span>避難所</span>
            </Link>
            <Link 
              to="/resources" 
              onClick={() => handleNavClick('/resources', '資源')}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors px-4 py-2 rounded-full hover:bg-white/50"
            >
              <Package className="h-4 w-4" />
              <span>資源</span>
            </Link>
            <Link 
              to="/financials" 
              onClick={() => handleNavClick('/financials', '財務')}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors px-4 py-2 rounded-full hover:bg-white/50"
            >
              <DollarSign className="h-4 w-4" />
              <span>財務</span>
            </Link>
            {(user?.role === 'Admin' || user?.role === 'admin') && (
              <Link 
                to="/admin" 
                onClick={() => handleNavClick('/admin', '管理後台')}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors px-4 py-2 rounded-full hover:bg-white/50"
              >
                <Shield className="h-4 w-4" />
                <span>管理後台</span>
              </Link>
            )}
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => handleNavClick(item.href, item.label)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                    isActive 
                      ? "bg-blue-50/80 text-blue-600" 
                      : "text-slate-600 hover:bg-white/50 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
            
            <Link
              to="/claim/confirm"
              onClick={() => track('cart_click', '購物車')}
              className="ml-2 relative p-2 text-slate-600 hover:text-blue-600 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              <ClaimBadge />
            </Link>

            <div className="ml-4 border-l pl-4 flex items-center gap-2">
              <AuthButtons />
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2024 DisasterRelief Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
