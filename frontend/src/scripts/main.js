/**
 * WebSocket client for Plank real-time updates
 */
import { getBackendConfig } from './config.js';

class PlankClient {
  constructor() {
    console.log("PLANK")
    this.ws = null;
    this.connected = false;
    this.elements = this.initializeElements();
    this.attachEventListeners();
  }

  initializeElements() {
    return {
      status: document.getElementById('status'),
      connectBtn: document.getElementById('connectBtn'),
      log: document.getElementById('log'),
      clearLogBtn: document.getElementById('clearLogBtn'),
      createForm: document.getElementById('createForm'),
      itemName: document.getElementById('itemName'),
      itemValue: document.getElementById('itemValue')
    };
  }

  attachEventListeners() {
    this.elements.connectBtn.addEventListener('click', () => this.toggleConnection());
    this.elements.clearLogBtn.addEventListener('click', () => this.clearLog());
    this.elements.createForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.createItem();
    });
  }

  toggleConnection() {
    if (this.connected) {
      this.disconnect();
    } else {
      this.connect();
    }
  }

  connect() {
    const config = getBackendConfig();
    this.ws = new WebSocket(config.wsUrl);

    this.ws.onopen = () => {
      this.connected = true;
      this.updateStatus(true);
      this.addLog('Connected to WebSocket', 'info');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.addLog(JSON.stringify(data, null, 2), data.action || data.type);
      } catch (error) {
        this.addLog(`Received: ${event.data}`, 'info');
      }
    };

    this.ws.onclose = () => {
      this.connected = false;
      this.updateStatus(false);
      this.addLog('Disconnected from WebSocket', 'info');
    };

    this.ws.onerror = (error) => {
      this.addLog('WebSocket error occurred', 'error');
      console.error('WebSocket error:', error);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  updateStatus(isConnected) {
    if (isConnected) {
      this.elements.status.textContent = 'Connected ✓';
      this.elements.status.className = 'status connected';
      this.elements.connectBtn.textContent = 'Disconnect';
    } else {
      this.elements.status.textContent = 'Disconnected ✗';
      this.elements.status.className = 'status disconnected';
      this.elements.connectBtn.textContent = 'Connect';
    }
  }

  addLog(message, type = 'info') {
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type.toLowerCase()}`;

    const timestamp = new Date().toLocaleTimeString();
    entry.textContent = `${timestamp} - ${message}`;

    this.elements.log.appendChild(entry);
    this.elements.log.scrollTop = this.elements.log.scrollHeight;
  }

  clearLog() {
    this.elements.log.innerHTML = '';
  }

  async createItem() {
    const name = this.elements.itemName.value.trim();
    const value = parseInt(this.elements.itemValue.value, 10);

    if (!name || isNaN(value)) {
      this.addLog('Please enter both name and value', 'error');
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
        this.elements.itemName.value = '';
        this.elements.itemValue.value = '';
        this.addLog('Item created via API (notification will arrive via WebSocket)', 'info');
      } else {
        const error = await response.text();
        this.addLog(`Error creating item: ${response.statusText} - ${error}`, 'error');
      }
    } catch (error) {
      this.addLog(`Network error: ${error.message}`, 'error');
      console.error('Error creating item:', error);
    }
  }

  // Auto-connect on initialization
  init() {
    this.connect();
  }
}

// Initialize the client when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const client = new PlankClient();
    client.init();
  });
} else {
  const client = new PlankClient();
  client.init();
}
