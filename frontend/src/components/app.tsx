/**
 * Main application component
 */
import {useEffect} from 'preact/hooks'
import {wsClient} from '@/lib/websocket'
import {ControlPanel} from '@/components/control-panel'
import {LogPanel} from '@/components/log-panel'

export function App() {
  // Auto-connect on mount
  useEffect(() => {
    wsClient.connect()

    // Cleanup on unmount
    return () => {
      wsClient.disconnect()
    }
  }, [])

  return (
    <>
      <header>
        <h1>🏗️ Plank - Real-time Database Updates</h1>
        <p>WebSocket connection to receive live PostgreSQL notifications</p>
      </header>

      <main class="container">
        <ControlPanel />
        <LogPanel />
      </main>
    </>
  )
}
