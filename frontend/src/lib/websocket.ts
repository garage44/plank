/**
 * WebSocket client management
 */
import {$s} from '@/store'
import {getBackendConfig} from '@/lib/config'
import type {LogEntry} from '@/store/types'

// Helper to add log entries
function addLog(message: string, type: LogEntry['type'] = 'info') {
    const entry: LogEntry = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        message,
        type,
    }
    $s.logs = [...$s.logs, entry]
}

export class WebSocketClient {
    private reconnectAttempts = 0
    private maxReconnectAttempts = 5
    private reconnectDelay = 1000

    connect() {
        const config = getBackendConfig()

        try {
            const ws = new WebSocket(config.wsUrl)

            ws.onopen = () => {
                this.reconnectAttempts = 0
                $s.connected = true
                $s.ws = ws
                addLog('Connected to WebSocket', 'info')
            }

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    addLog(JSON.stringify(data, null, 2), data.action || data.type)
                } catch {
                    addLog(`Received: ${event.data}`, 'info')
                }
            }

            ws.onclose = () => {
                $s.connected = false
                $s.ws = null
                addLog('Disconnected from WebSocket', 'info')

                // Attempt reconnection
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    setTimeout(() => {
                        this.reconnectAttempts++
                        addLog(`Reconnecting... (attempt ${this.reconnectAttempts})`, 'info')
                        this.connect()
                    }, this.reconnectDelay * this.reconnectAttempts)
                }
            }

            ws.onerror = (error) => {
                addLog('WebSocket error occurred', 'error')
                console.error('WebSocket error:', error)
            }
        } catch (error) {
            addLog(`Failed to connect: ${error}`, 'error')
        }
    }

    disconnect() {
        if ($s.ws) {
            $s.ws.close()
            $s.ws = null
            $s.connected = false
        }
    }

    toggleConnection() {
        if ($s.connected) {
            this.disconnect()
        } else {
            this.connect()
        }
    }
}

// Export singleton instance
export const wsClient = new WebSocketClient()
