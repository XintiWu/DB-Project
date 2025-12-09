import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { RequestsPage } from './pages/RequestsPage'
import { ClaimConfirmPage } from './pages/ClaimConfirmPage'
import { ClaimSuccessPage } from './pages/ClaimSuccessPage'
import { PublishPage } from './pages/PublishPage'
import { IncidentsPage } from './pages/IncidentsPage'
import { SheltersPage } from './pages/SheltersPage'
import { ResourcesPage } from './pages/ResourcesPage'
import { FinancialsPage } from './pages/FinancialsPage'

import { AuthProvider } from './context/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

import { AdminDashboard } from './pages/AdminDashboard'
import { ProfilePage } from './pages/ProfilePage'
import { ReportIncidentPage } from './pages/ReportIncidentPage'
import { usePageTracking } from './hooks/useClickTracking'

// 包裝組件以添加頁面追蹤
function TrackedPage({ Component }: { Component: React.ComponentType }) {
  usePageTracking();
  return <Component />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<TrackedPage Component={HomePage} />} />
            <Route path="/login" element={<TrackedPage Component={LoginPage} />} />
            <Route path="/register" element={<TrackedPage Component={RegisterPage} />} />
            <Route path="/profile" element={<TrackedPage Component={ProfilePage} />} />
            <Route path="/report-incident" element={<TrackedPage Component={ReportIncidentPage} />} />
            <Route path="/admin" element={<TrackedPage Component={AdminDashboard} />} />
            <Route path="/requests" element={<TrackedPage Component={RequestsPage} />} />
            <Route path="/claim/confirm" element={<TrackedPage Component={ClaimConfirmPage} />} />
            <Route path="/claim/success" element={<TrackedPage Component={ClaimSuccessPage} />} />
            <Route path="/publish" element={<TrackedPage Component={PublishPage} />} />
            <Route path="/incidents" element={<TrackedPage Component={IncidentsPage} />} />
            <Route path="/shelters" element={<TrackedPage Component={SheltersPage} />} />
            <Route path="/resources" element={<TrackedPage Component={ResourcesPage} />} />
            <Route path="/financials" element={<TrackedPage Component={FinancialsPage} />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
