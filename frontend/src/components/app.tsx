/**
 * Main application component
 */
import {useEffect} from 'preact/hooks'
import {wsClient} from '@/lib/websocket'
import {ControlPanel} from '@/components/control-panel'
import {LogPanel} from '@/components/log-panel'
import {ItemsList} from '@/components/items-list'
import {ThemeSwitcher} from '@/components/theme-switcher'

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
                        <h1>🏗️ Plank - Real-time Database Updates</h1>
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
