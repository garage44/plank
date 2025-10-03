/**
 * Main application component
 */
import {useEffect} from 'preact/hooks'
import {wsClient} from '@/lib/websocket'
import {ControlPanel} from '@/components/control-panel'
import {LogPanel} from '@/components/log-panel'
import {ItemsList} from '@/components/items-list'
import {ThemeSwitcher} from '@/components/theme-switcher'
import {Icon} from '@/components/ui/icon'

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
                <div class="header-content">
                    <div class="header-text">
                        <h1>
                            <Icon name="layers" size={28} class="logo-icon" />
                            Plank - Real-time Data Sync
                        </h1>
                        <p>WebSocket connection to receive live PostgreSQL notifications</p>
                    </div>
                    <ThemeSwitcher />
                </div>
            </header>

            <main class="container">
                <ControlPanel />
                <ItemsList />
                <LogPanel />
            </main>
        </>
    )
}
