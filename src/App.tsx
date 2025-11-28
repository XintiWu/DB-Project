import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ClaimProvider } from './context/ClaimContext'
import { ThemeProvider } from './context/ThemeContext'
import { HomePage } from './pages/HomePage'
import { VolunteerPage } from './pages/VolunteerPage'
import { ClaimConfirmPage } from './pages/ClaimConfirmPage'
import { ClaimSuccessPage } from './pages/ClaimSuccessPage'
import { PublishNeedPage } from './pages/PublishNeedPage'
import { PublishSuccessPage } from './pages/PublishSuccessPage'
import { Suspense } from 'react'

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Router>
          <ClaimProvider>
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center dark:bg-slate-900">
                <div className="text-center">
                  <div className="text-4xl mb-4">⏳</div>
                  <p className="text-gray-600 dark:text-slate-400">載入中...</p>
                </div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/volunteer" element={<VolunteerPage />} />
                <Route path="/claim/confirm" element={<ClaimConfirmPage />} />
                <Route path="/claim/success" element={<ClaimSuccessPage />} />
                <Route path="/publish" element={<PublishNeedPage />} />
                <Route path="/publish/success" element={<PublishSuccessPage />} />
              </Routes>
            </Suspense>
          </ClaimProvider>
        </Router>
      </div>
    </ThemeProvider>
  )
}

export default App
