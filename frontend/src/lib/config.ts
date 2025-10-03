/**
 * Configuration for frontend environment detection
 */
import type {BackendConfig} from '@/store/types'

// Determine backend URL based on environment
export const getBackendConfig = (): BackendConfig => {
    // In dev mode (port 3000), connect to FastAPI backend on port 8000
    const isDev = window.location.port === '3000'

    return {
        wsUrl: isDev
            ? 'ws://localhost:8000/ws'
            : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`,
        apiUrl: isDev
            ? 'http://localhost:8000'
            : window.location.origin,
    }
}
