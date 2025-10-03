/**
 * Status indicator component showing connection state
 */
import {$s} from '@/lib/store'
import {Icon} from '@/components/ui/icon'

export function StatusIndicator() {
    return (
        <div class={`status ${$s.connected ? 'connected' : 'disconnected'}`}>
            {$s.connected ? (
                <>
                    Connected <Icon name="check" size={16} />
                </>
            ) : (
                <>
                    Disconnected <Icon name="close" size={16} />
                </>
            )}
        </div>
    )
}
