/**
 * Log panel component displaying real-time updates
 */
import {useEffect, useRef} from 'preact/hooks'
import {$s} from '@/lib/store'

export function LogPanel() {
    const logRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom when new logs are added
    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight
        }
    }, [$s.logs.length])

    return (
        <section class="panel log-panel">
            <h2>📋 Real-time Updates</h2>
            <div id="log" class="log" ref={logRef}>
                {$s.logs.map((entry) => (
                    <div key={entry.id} class={`log-entry log-${entry.type}`}>
                        {entry.timestamp.toLocaleTimeString()} - {entry.message}
                    </div>
                ))}
            </div>
            <button
                id="clearLogBtn"
                class="btn btn-secondary"
                onClick={() => $s.logs = []}
            >
                Clear Log
            </button>
        </section>
    )
}
