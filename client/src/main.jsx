import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Apply saved theme before first render
const savedTheme = localStorage.getItem('mtpl_theme') || 'light'
document.documentElement.classList.toggle('dark', savedTheme === 'dark')

// Register service worker for PWA installability and update detection
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      window.__swRegistration = registration

      // Detect when a new SW has installed and is waiting
      const checkWaiting = () => {
        if (registration.waiting) {
          window.__swUpdateAvailable = true
          window.dispatchEvent(new Event('swUpdateAvailable'))
        }
      }

      checkWaiting()

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') checkWaiting()
        })
      })

      // When a new SW takes control, reload the page
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })
    }).catch(() => {})
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
