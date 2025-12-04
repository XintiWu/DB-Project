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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/report-incident" element={<ReportIncidentPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/claim/confirm" element={<ClaimConfirmPage />} />
            <Route path="/claim/success" element={<ClaimSuccessPage />} />
            <Route path="/publish" element={<PublishPage />} />
            <Route path="/incidents" element={<IncidentsPage />} />
            <Route path="/shelters" element={<SheltersPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/financials" element={<FinancialsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
