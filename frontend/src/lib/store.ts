
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

export interface AppState {
    connected: boolean
    // Form state
    item_name: string

    item_value: string

    // Log entries
    logs: LogEntry[]
    // WebSocket state
    ws: WebSocket | null
}

export interface BackendConfig {
    api_url: string
    ws_url: string
}


// Create reactive state using deepsignal
// Use $s convention to indicate state variables
export const $s = deepSignal<AppState>({
    connected: false,
    item_name: '',
    item_value: '',
    logs: [],
    ws: null,
})
