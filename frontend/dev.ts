// Development server with Bun.serve and API proxy
import index from './src/index.html'

const FRONTEND_PORT = 3000
const BACKEND_URL = 'http://localhost:8000'

console.log('🚀 Starting Bun development server with HMR...\n')

const server = Bun.serve({
  port: FRONTEND_PORT,

  routes: {
    '/': index,
  },

  // Enable development mode for HMR and detailed errors
  development: true,

  async fetch(req) {
    const url = new URL(req.url)

    // Proxy API requests to FastAPI backend
    if (url.pathname.startsWith('/api')) {
      const backendUrl = `${BACKEND_URL}${url.pathname}${url.search}`
      return fetch(backendUrl, {
        method: req.method,
        headers: req.headers,
        body: req.body,
      })
    }

    // WebSocket: Clients connect directly to backend (port 8000)
    // The config.ts module handles environment detection

    // For health check
    if (url.pathname === '/health') {
      return fetch(`${BACKEND_URL}/health`)
    }

    return new Response('Not Found', { status: 404 })
  },
})

console.log(`✅ Frontend dev server running on http://localhost:${FRONTEND_PORT}`)
console.log(`📡 Proxying /api requests to ${BACKEND_URL}`)
console.log('🔌 WebSocket connects directly to backend on port 8000')
console.log('🔥 Hot Module Reloading enabled')
console.log('📝 TypeScript & Preact with deepsignal state management\n')
