import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ClaimProvider } from './context/ClaimContext'
import { ThemeProvider } from './context/ThemeContext'
import { HomePage } from './pages/HomePage'
import { VolunteerPage } from './pages/VolunteerPage'
import { ClaimConfirmPage } from './pages/ClaimConfirmPage'
import { ClaimSuccessPage } from './pages/ClaimSuccessPage'
import { PublishNeedPage } from './pages/PublishNeedPage'
import { PublishSuccessPage } from './pages/PublishSuccessPage'
import { IncidentListPage } from './pages/IncidentListPage'
import { ReportIncidentPage } from './pages/ReportIncidentPage'
import { IncidentDetailPage } from './pages/IncidentDetailPage'
import { ReportSuccessPage } from './pages/ReportSuccessPage'
import { InventoryPage } from './pages/InventoryPage'
import { DonateItemPage } from './pages/DonateItemPage'
import { MyLendsPage } from './pages/MyLendsPage'
import { DonationListPage } from './pages/DonationListPage'
import { ProfilePage } from './pages/ProfilePage'
import { ShelterListPage } from './pages/ShelterListPage'
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
                
                {/* 災情通報模組 */}
                <Route path="/incidents" element={<IncidentListPage />} />
                <Route path="/incidents/report" element={<ReportIncidentPage />} />
                <Route path="/incidents/report/success" element={<ReportSuccessPage />} />
                <Route path="/incidents/:id" element={<IncidentDetailPage />} />
                
                {/* 物品庫系統模組 */}
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/inventory/donate" element={<DonateItemPage />} />
                <Route path="/profile/lends" element={<MyLendsPage />} />
                
                {/* 捐贈金流模組 */}
                <Route path="/donations" element={<DonationListPage />} />
                
                {/* 避難所模組 */}
                <Route path="/shelters" element={<ShelterListPage />} />
                
                {/* 個人中心 */}
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </Suspense>
          </ClaimProvider>
        </Router>
      </div>
    </ThemeProvider>
  )
}

export default App
