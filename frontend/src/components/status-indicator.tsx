/**
 * Status indicator component showing connection state
 */
import {$s} from '@/lib/store'

export function StatusIndicator() {
    return (
        <div class={`status ${$s.connected ? 'connected' : 'disconnected'}`}>
            {$s.connected ? 'Connected ✓' : 'Disconnected ✗'}
        </div>
    )
}
