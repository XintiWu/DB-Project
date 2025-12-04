import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ClaimProvider } from './context/ClaimContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClaimProvider>
      <App />
    </ClaimProvider>
  </StrictMode>,
)
