/**
 * Control panel for WebSocket connection and item creation
 */
import {wsClient} from '@/lib/websocket'
import {$s} from '@/lib/store'
import {Icon} from '@/components/ui/icon'
import {StatusIndicator} from '@/components/status-indicator'
import {CreateItemForm} from '@/components/create-item-form'

export function ControlPanel() {
    return (
        <section class="panel control-panel">
            <h2>
                <Icon name="radio" size={20} class="panel-icon" />
                WebSocket Connection
            </h2>
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
