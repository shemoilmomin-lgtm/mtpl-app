// Service worker for MTPL PWA — handles install lifecycle and app updates

self.addEventListener('install', () => {
  // Do not skip waiting — stay in "waiting" state so the update button can detect us
})

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', () => {
  // No caching — pass all requests through to the network
  // This SW exists solely for PWA installability and update detection
})

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
