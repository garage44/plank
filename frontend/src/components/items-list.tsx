/**
 * Items list component - displays all items from the database
 * Updates in real-time via WebSocket notifications
 */
import {useEffect} from 'preact/hooks'
import {$s} from '@/lib/store'
import {getBackendConfig} from '@/lib/config'
import type {Item, LogEntry} from '@/lib/store'

// Helper to add log entries
function addLog(message: string, type: LogEntry['type'] = 'info') {
    const entry: LogEntry = {
        id: `${Date.now()}-${Math.random()}`,
        message,
        timestamp: new Date(),
        type,
    }
    $s.logs = [...$s.logs, entry]
}

// Helper to handle websocket messages
function handleWebSocketMessage(event: MessageEvent) {
    try {
        const notification = JSON.parse(event.data)

        // Only handle item_changes notifications
        if (notification.table === 'items' && notification.data) {
            const item: Item = notification.data

            switch (notification.action) {
                case 'INSERT':
                    // Add new item to the list
                    $s.items = [item, ...$s.items]
                    break

                case 'UPDATE':
                    // Update existing item
                    $s.items = $s.items.map((i) => (i.id === item.id ? item : i))
                    break

                case 'DELETE':
                    // Remove item from list
                    $s.items = $s.items.filter((i) => i.id !== notification.id)
                    break
            }
        }
    } catch (error) {
        console.error('Error handling WebSocket message:', error)
    }
}

// Helper to delete an item
async function deleteItem(itemId: number, itemName: string) {
    const config = getBackendConfig()

    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) {
        return
    }

    try {
        const response = await fetch(`${config.api_url}/api/items/${itemId}`, {
            method: 'DELETE',
        })

        if (response.ok) {
            addLog(`Item "${itemName}" deleted (notification will arrive via WebSocket)`, 'info')
        } else {
            const error = await response.text()
            addLog(`Error deleting item: ${response.statusText} - ${error}`, 'error')
        }
    } catch (error) {
        addLog(`Network error deleting item: ${error}`, 'error')
        console.error('Error deleting item:', error)
    }
}

export function ItemsList() {
    // Fetch items on component mount
    useEffect(() => {
        const fetchItems = async () => {
            const config = getBackendConfig()
            try {
                const response = await fetch(`${config.api_url}/api/items`)
                if (response.ok) {
                    const items = await response.json()
                    $s.items = items
                    addLog(`Loaded ${items.length} items from database`, 'info')
                } else {
                    addLog(`Error fetching items: ${response.statusText}`, 'error')
                }
            } catch (error) {
                addLog(`Network error fetching items: ${error}`, 'error')
                console.error('Error fetching items:', error)
            }
        }

        fetchItems()

        // Subscribe to websocket messages
        const ws = $s.ws
        if (ws) {
            ws.addEventListener('message', handleWebSocketMessage)
        }

        // Cleanup: remove event listener on unmount
        return () => {
            if (ws) {
                ws.removeEventListener('message', handleWebSocketMessage)
            }
        }
    }, [])

    // Re-subscribe when websocket reconnects
    useEffect(() => {
        const ws = $s.ws
        if (ws) {
            ws.addEventListener('message', handleWebSocketMessage)
            return () => {
                ws.removeEventListener('message', handleWebSocketMessage)
            }
        }
    }, [$s.connected])

    if ($s.items.length === 0) {
        return (
            <div class="panel">
                <h2>📦 Items</h2>
                <p class="empty-state">No items yet. Create one using the form!</p>
            </div>
        )
    }

    return (
        <div class="panel">
            <h2>📦 Items ({$s.items.length})</h2>
            <div class="items-list">
                {$s.items.map((item) => (
                    <div key={item.id} class="item-card">
                        <div class="item-header">
                            <h3 class="item-name">{item.name}</h3>
                            <div class="item-actions">
                                <span class="item-value">{item.value}</span>
                                <button
                                    class="item-delete-btn"
                                    onClick={() => deleteItem(item.id, item.name)}
                                    title="Delete item"
                                    aria-label={`Delete ${item.name}`}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                        <div class="item-meta">
                            <span class="item-id">ID: {item.id}</span>
                            <span class="item-date">
                                {new Date(item.created_at).toLocaleString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
