/**
 * Application state management using deepsignal
 * Following expressio's pattern with $s convention
 */
import {deepSignal} from 'deepsignal'
import type {AppState} from './types'

// Create reactive state using deepsignal
// Use $s convention to indicate state variables
export const $s = deepSignal<AppState>({
    ws: null,
    connected: false,
    logs: [],
    itemName: '',
    itemValue: '',
})
