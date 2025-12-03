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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
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
    </BrowserRouter>
  )
}

export default App
