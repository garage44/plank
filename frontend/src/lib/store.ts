
/**
 * Application state management using deepsignal
 * Following expressio's pattern with $s convention
 */
import {deepSignal} from 'deepsignal'

/**
 * Type definitions for the application state
 */

export interface LogEntry {
    id: string
    message: string
    timestamp: Date
    type: 'info' | 'insert' | 'update' | 'delete' | 'error'
}

export interface Item {
    created_at: string
    id: number
    name: string
    updated_at: string
    value: number
}

export interface AppState {
    connected: boolean
    // Form state
    item_name: string

    item_value: string

    // Items from database
    items: Item[]

    // Log entries
    logs: LogEntry[]
    // Theme state
    theme: 'light' | 'dark'
    // WebSocket state
    ws: WebSocket | null
}

export interface BackendConfig {
    api_url: string
    ws_url: string
}


// Initialize theme from localStorage or system preference
const getInitialTheme = (): 'light' | 'dark' => {
    const stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark') {
        return stored
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark'
    }
    return 'light'
}

// Create reactive state using deepsignal
// Use $s convention to indicate state variables
export const $s = deepSignal<AppState>({
    connected: false,
    item_name: '',
    item_value: '',
    items: [],
    logs: [],
    theme: getInitialTheme(),
    ws: null,
})

// Set initial theme on document
document.documentElement.setAttribute('data-theme', $s.theme)
