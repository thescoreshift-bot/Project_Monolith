import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import './styles/embed-host.css'
import App from './App.tsx'

if (window.self !== window.top) {
  document.documentElement.classList.add('is-embedded')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
)
