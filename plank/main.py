"""FastAPI application entry point."""

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

from plank.config import settings
from plank.db.connection import db
from plank.db.listener import listener
from plank.websocket.manager import manager
from plank.api.routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle."""
    # Startup
    await db.connect()
    await listener.connect()

    # Subscribe to item changes and broadcast to WebSocket clients
    listener.subscribe("item_changes", lambda channel, data: asyncio.create_task(manager.broadcast(data)))

    # Start listening to the channel
    await listener.listen("item_changes")

    # Create background task to keep listener alive
    listener_task = asyncio.create_task(listener.start())

    yield

    # Shutdown
    listener_task.cancel()
    await listener.disconnect()
    await db.disconnect()


app = FastAPI(
    title="Plank",
    description="Real-time PostgreSQL pub/sub with FastAPI and WebSockets",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router)


@app.get("/", response_class=HTMLResponse)
async def index():
    """Serve a simple WebSocket test client."""
    return """
<!DOCTYPE html>
<html>
<head>
    <title>Plank - WebSocket Test Client</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        h1 { color: #333; }
        .container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 20px;
        }
        .panel {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .status {
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
            font-weight: bold;
        }
        .connected { background: #d4edda; color: #155724; }
        .disconnected { background: #f8d7da; color: #721c24; }
        input, button {
            padding: 10px;
            margin: 5px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        button {
            background: #007bff;
            color: white;
            border: none;
            cursor: pointer;
            width: 100%;
        }
        button:hover { background: #0056b3; }
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .log {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            height: 400px;
            overflow-y: auto;
            font-family: 'Courier New', monospace;
            font-size: 12px;
        }
        .log-entry {
            margin: 5px 0;
            padding: 5px;
            border-left: 3px solid #007bff;
            background: white;
        }
        .log-insert { border-left-color: #28a745; }
        .log-update { border-left-color: #ffc107; }
        .log-delete { border-left-color: #dc3545; }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <h1>🏗️ Plank - Real-time Database Updates</h1>
    <p>WebSocket connection to receive live PostgreSQL notifications</p>

    <div class="container">
        <div class="panel">
            <h2>📡 WebSocket Connection</h2>
            <div id="status" class="status disconnected">Disconnected</div>
            <button id="connectBtn" onclick="toggleConnection()">Connect</button>

            <h3 style="margin-top: 30px;">➕ Create Item</h3>
            <div class="form-group">
                <label for="itemName">Name:</label>
                <input type="text" id="itemName" placeholder="Enter item name" />
            </div>
            <div class="form-group">
                <label for="itemValue">Value:</label>
                <input type="number" id="itemValue" placeholder="Enter value" />
            </div>
            <button onclick="createItem()">Create Item</button>
        </div>

        <div class="panel">
            <h2>📋 Real-time Updates</h2>
            <div id="log" class="log"></div>
            <button onclick="clearLog()" style="margin-top: 10px; background: #6c757d;">Clear Log</button>
        </div>
    </div>

    <script>
        let ws = null;
        let connected = false;

        function toggleConnection() {
            if (connected) {
                disconnect();
            } else {
                connect();
            }
        }

        function connect() {
            ws = new WebSocket('ws://' + window.location.host + '/ws');

            ws.onopen = () => {
                connected = true;
                updateStatus(true);
                addLog('Connected to WebSocket', 'info');
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                addLog(JSON.stringify(data, null, 2), data.action);
            };

            ws.onclose = () => {
                connected = false;
                updateStatus(false);
                addLog('Disconnected from WebSocket', 'info');
            };

            ws.onerror = (error) => {
                addLog('WebSocket error: ' + error, 'error');
            };
        }

        function disconnect() {
            if (ws) {
                ws.close();
            }
        }

        function updateStatus(isConnected) {
            const statusEl = document.getElementById('status');
            const btnEl = document.getElementById('connectBtn');

            if (isConnected) {
                statusEl.textContent = 'Connected ✓';
                statusEl.className = 'status connected';
                btnEl.textContent = 'Disconnect';
            } else {
                statusEl.textContent = 'Disconnected ✗';
                statusEl.className = 'status disconnected';
                btnEl.textContent = 'Connect';
            }
        }

        function addLog(message, type) {
            const logEl = document.getElementById('log');
            const entry = document.createElement('div');
            entry.className = 'log-entry log-' + (type || 'info').toLowerCase();
            entry.textContent = new Date().toLocaleTimeString() + ' - ' + message;
            logEl.appendChild(entry);
            logEl.scrollTop = logEl.scrollHeight;
        }

        function clearLog() {
            document.getElementById('log').innerHTML = '';
        }

        async function createItem() {
            const name = document.getElementById('itemName').value;
            const value = parseInt(document.getElementById('itemValue').value);

            if (!name || isNaN(value)) {
                alert('Please enter both name and value');
                return;
            }

            try {
                const response = await fetch('/api/items', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, value }),
                });

                if (response.ok) {
                    document.getElementById('itemName').value = '';
                    document.getElementById('itemValue').value = '';
                    addLog('Item created via API (notification will arrive via WebSocket)', 'info');
                } else {
                    addLog('Error creating item: ' + response.statusText, 'error');
                }
            } catch (error) {
                addLog('Error: ' + error.message, 'error');
            }
        }

        // Auto-connect on page load
        window.onload = () => {
            connect();
        };
    </script>
</body>
</html>
    """


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates."""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and receive messages
            data = await websocket.receive_text()
            # Echo back for now (can add subscription logic here)
            await manager.send_personal_message(
                {"type": "echo", "message": data}, websocket
            )
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy", "database": "connected" if db.pool else "disconnected"}

