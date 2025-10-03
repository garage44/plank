/**
 * Form for creating new items
 */
import {$s} from '@/lib/store'
import {getBackendConfig} from '@/lib/config'
import {Icon} from '@/components/ui/icon'
import type {LogEntry} from '@/lib/store'
import {TextField, NumberField} from './ui/field'
import {Button} from './ui/button'

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

export function CreateItemForm() {
    const handleSubmit = async (e: Event) => {
        e.preventDefault()

        const name = $s.item_name.trim()
        const value = parseInt($s.item_value, 10)

        if (!name || isNaN(value)) {
            addLog('Please enter both name and value', 'error')
            return
        }

        const config = getBackendConfig()

        try {
            const response = await fetch(`${config.api_url}/api/items`, {
                body: JSON.stringify({name, value}),
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
            })

            if (response.ok) {
                // Reset form directly
                $s.item_name = ''
                $s.item_value = ''
                addLog('Item created via API (notification will arrive via WebSocket)', 'info')
            } else {
                const error = await response.text()
                addLog(`Error creating item: ${response.statusText} - ${error}`, 'error')
            }
        } catch (error) {
            addLog(`Network error: ${error}`, 'error')
            console.error('Error creating item:', error)
        }
    }

    return (
        <div class="form-section">
            <h3>
                <Icon name="plus" size={18} class="panel-icon" />
                Create Item
            </h3>
            <form id="createForm" onSubmit={handleSubmit}>
                <TextField
                    label="Name:"
                    id="itemName"
                    model={$s.$item_name}
                    placeholder="Enter item name"
                    required
                />
                <NumberField
                    label="Value:"
                    id="itemValue"
                    model={$s.$item_value}
                    placeholder="Enter value"
                    required
                />
                <Button type="submit" variant="primary">
                    Create Item
                </Button>
            </form>
        </div>
    )
}
