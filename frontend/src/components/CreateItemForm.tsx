/**
 * Form for creating new items
 */
import { $s } from '../store';
import { getBackendConfig } from '../lib/config';
import type { LogEntry } from '../store/types';

// Helper to add log entries
function addLog(message: string, type: LogEntry['type'] = 'info') {
  const entry: LogEntry = {
    id: `${Date.now()}-${Math.random()}`,
    timestamp: new Date(),
    message,
    type,
  };
  $s.logs = [...$s.logs, entry];
}

export function CreateItemForm() {
  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    const name = $s.itemName.trim();
    const value = parseInt($s.itemValue, 10);

    if (!name || isNaN(value)) {
      addLog('Please enter both name and value', 'error');
      return;
    }

    const config = getBackendConfig();

    try {
      const response = await fetch(`${config.apiUrl}/api/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, value }),
      });

      if (response.ok) {
        // Reset form directly
        $s.itemName = '';
        $s.itemValue = '';
        addLog('Item created via API (notification will arrive via WebSocket)', 'info');
      } else {
        const error = await response.text();
        addLog(`Error creating item: ${response.statusText} - ${error}`, 'error');
      }
    } catch (error) {
      addLog(`Network error: ${error}`, 'error');
      console.error('Error creating item:', error);
    }
  };

  return (
    <div class="form-section">
      <h3>➕ Create Item</h3>
      <form id="createForm" onSubmit={handleSubmit}>
        <div class="form-group">
          <label for="itemName">Name:</label>
          <input
            type="text"
            id="itemName"
            placeholder="Enter item name"
            value={$s.itemName}
            onInput={(e) => $s.itemName = (e.target as HTMLInputElement).value}
            required
          />
        </div>
        <div class="form-group">
          <label for="itemValue">Value:</label>
          <input
            type="number"
            id="itemValue"
            placeholder="Enter value"
            value={$s.itemValue}
            onInput={(e) => $s.itemValue = (e.target as HTMLInputElement).value}
            required
          />
        </div>
        <button type="submit" class="btn btn-primary">
          Create Item
        </button>
      </form>
    </div>
  );
}
