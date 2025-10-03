# Plank

> A modern, production-ready template for real-time applications using FastAPI, WebSockets, and PostgreSQL pub/sub

Plank is a sophisticated project template that demonstrates real-time database change notifications from PostgreSQL to web clients through WebSockets. It leverages PostgreSQL's LISTEN/NOTIFY mechanism to create a reactive architecture where database changes automatically propagate to connected clients.

## ✨ Features

- 🚀 **FastAPI** - Modern, fast web framework for building APIs
- 🔌 **WebSocket Support** - Real-time bidirectional communication
- 🗄️ **PostgreSQL Integration** - Robust database with built-in pub/sub
- 📡 **Smart Change Detection** - Automatic client updates on database changes
- ⚡ **Async/Await** - Fully asynchronous architecture using asyncio
- 🛠️ **Modern Python Tooling** - UV for dependency management, pyproject.toml configuration
- 🏗️ **Production Ready** - Structured for scalability and maintainability

## 🏛️ Architecture

```
┌─────────┐         ┌──────────────┐         ┌──────────────┐
│ Client  │◄────────┤   FastAPI    │◄────────┤  PostgreSQL  │
│ Browser │ WebSocket   WebSocket     LISTEN/   Database   │
└─────────┘         │   Handler    │  NOTIFY └──────────────┘
                    └──────────────┘
                          ▲
                          │
                    Database Changes
                    Trigger Notifications
```

The system works by:
1. PostgreSQL triggers emit NOTIFY events when data changes
2. FastAPI maintains LISTEN connections to PostgreSQL
3. Changes are pushed to connected WebSocket clients in real-time
4. No polling required - truly event-driven architecture

## 🚀 Tech Stack

- **[Python 3.11+](https://www.python.org/)** - Modern Python with async support
- **[FastAPI](https://fastapi.tiangolo.com/)** - High-performance async web framework
- **[PostgreSQL 14+](https://www.postgresql.org/)** - Advanced relational database with pub/sub
- **[asyncpg](https://github.com/MagicStack/asyncpg)** - Fast PostgreSQL driver for asyncio
- **[UV](https://github.com/astral-sh/uv)** - Blazingly fast Python package installer
- **[Uvicorn](https://www.uvicorn.org/)** - ASGI server for FastAPI

## 📋 Prerequisites

- Python 3.11 or higher
- PostgreSQL 14 or higher
- UV package manager (recommended) or pip

## 🔧 Installation

### Using UV (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/plank.git
cd plank

# Install UV if you haven't already
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies (UV handles virtual environments automatically!)
uv sync
```

### Using pip

```bash
# Clone the repository
git clone https://github.com/yourusername/plank.git
cd plank

# Create virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -e .
```

## ⚙️ Configuration

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Configure your database connection in `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/plank
```

3. Initialize the database:

```bash
# Run migrations and set up triggers
uv run python -m plank.db.init
```

## 🎯 Quick Start

1. **Start the server:**

```bash
uv run uvicorn plank.main:app --reload
```

2. **Open your browser to:**
   - API Documentation: http://localhost:8000/docs
   - WebSocket Test Client: http://localhost:8000

3. **Connect via WebSocket:**

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Database change:', data);
};
```

## 📖 Usage Examples

### WebSocket Client (JavaScript)

```javascript
// Connect to the WebSocket endpoint
const socket = new WebSocket('ws://localhost:8000/ws');

socket.onopen = () => {
  console.log('Connected to server');

  // Subscribe to specific tables or channels
  socket.send(JSON.stringify({
    action: 'subscribe',
    channel: 'users'
  }));
};

socket.onmessage = (event) => {
  const notification = JSON.parse(event.data);

  switch(notification.type) {
    case 'INSERT':
      console.log('New record:', notification.data);
      break;
    case 'UPDATE':
      console.log('Updated record:', notification.data);
      break;
    case 'DELETE':
      console.log('Deleted record:', notification.data);
      break;
  }
};
```

### REST API Client (Python)

```python
import httpx

# Create a new record
async with httpx.AsyncClient() as client:
    response = await client.post(
        'http://localhost:8000/api/items',
        json={'name': 'Example', 'value': 42}
    )
    # Connected WebSocket clients automatically receive notification
```

### PostgreSQL Trigger Setup

```sql
-- Example trigger for real-time notifications
CREATE OR REPLACE FUNCTION notify_changes()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'table_changes',
    json_build_object(
      'table', TG_TABLE_NAME,
      'action', TG_OP,
      'data', row_to_json(NEW)
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_notify
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION notify_changes();
```

## 📁 Project Structure

```
plank/
├── pyproject.toml           # Project configuration and dependencies
├── README.md                # This file
├── .env.example             # Example environment variables
├── plank/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration management
│   ├── api/                 # REST API endpoints
│   │   ├── __init__.py
│   │   └── routes.py
│   ├── websocket/           # WebSocket handlers
│   │   ├── __init__.py
│   │   ├── manager.py       # WebSocket connection manager
│   │   └── handlers.py      # Message handlers
│   ├── db/                  # Database layer
│   │   ├── __init__.py
│   │   ├── connection.py    # Database connection pool
│   │   ├── listener.py      # PostgreSQL LISTEN/NOTIFY handler
│   │   ├── models.py        # Database models
│   │   └── init.py          # Database initialization
│   └── core/                # Core utilities
│       ├── __init__.py
│       └── pubsub.py        # Pub/sub mechanism
└── tests/
    ├── __init__.py
    ├── test_api.py
    ├── test_websocket.py
    └── test_pubsub.py
```

## 🔍 Key Components

### WebSocket Manager

Manages WebSocket connections and broadcasts database notifications to connected clients:

```python
from plank.websocket.manager import ConnectionManager

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages
    except WebSocketDisconnect:
        manager.disconnect(websocket)
```

### PostgreSQL Listener

Listens to database notifications and triggers WebSocket broadcasts:

```python
from plank.db.listener import PostgresListener

listener = PostgresListener(database_url)

@listener.on_notification
async def handle_notification(channel: str, payload: dict):
    # Broadcast to WebSocket clients
    await manager.broadcast(payload)
```

## 🧪 Testing

Run the test suite:

```bash
# Using pytest
pytest

# With coverage
pytest --cov=plank --cov-report=html

# Run specific tests
pytest tests/test_websocket.py -v
```

## 🌐 Deployment

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install UV
RUN pip install uv

# Copy dependency files
COPY pyproject.toml .
RUN uv sync --no-dev

# Copy application
COPY plank/ ./plank/

CMD ["uvicorn", "plank.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/plank
    depends_on:
      - db

  db:
    image: postgres:16
    environment:
      POSTGRES_DB: plank
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the need for real-time, event-driven architectures
- Built on the shoulders of the amazing FastAPI and PostgreSQL communities
- Thanks to all contributors and users of this template

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [PostgreSQL LISTEN/NOTIFY](https://www.postgresql.org/docs/current/sql-notify.html)
- [WebSocket Protocol](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [UV Package Manager](https://github.com/astral-sh/uv)

## 💡 Use Cases

- **Real-time dashboards** - Display live data updates without polling
- **Collaborative applications** - Sync changes across multiple users
- **Monitoring systems** - Push alerts and metrics to clients
- **Chat applications** - Instant message delivery
- **Live notifications** - Alert users of important events
- **Data synchronization** - Keep client-side data in sync with server

---

**Made with ❤️ using FastAPI, WebSockets, and PostgreSQL**
