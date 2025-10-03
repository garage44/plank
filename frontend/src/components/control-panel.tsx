/**
 * Control panel for WebSocket connection and item creation
 */
import {wsClient} from '@/lib/websocket'
import {$s} from '@/store'
import {StatusIndicator} from '@/components/status-indicator'
import {CreateItemForm} from '@/components/create-item-form'

export function ControlPanel() {
  return (
    <section class="panel control-panel">
      <h2>📡 WebSocket Connection</h2>
      <StatusIndicator />
      <button
        id="connectBtn"
        class="btn btn-primary"
        onClick={() => wsClient.toggleConnection()}
      >
        {$s.connected ? 'Disconnect' : 'Connect'}
      </button>

      <CreateItemForm />
    </section>
  )
}
