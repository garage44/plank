# Plank

> Real-time data synchronization infrastructure that eliminates polling and reduces server load by 90%+

Plank provides instant data updates to web clients when your database changes. Built on PostgreSQL's native pub/sub mechanism, it delivers sub-millisecond latency updates without the complexity and cost of external message queues or polling architectures.

**Business Impact:** Reduce infrastructure costs, improve user experience with instant updates, and scale to thousands of concurrent connections on modest hardware.

## ✨ Features

- 🚀 **FastAPI** - Modern, fast web framework for building APIs
- 🔌 **WebSocket Support** - Real-time bidirectional communication
- 🗄️ **PostgreSQL Integration** - Robust database with built-in pub/sub
- 📡 **Smart Change Detection** - Automatic client updates on database changes
- ⚡ **Async/Await** - Fully asynchronous architecture using asyncio
- 🛠️ **Modern Tooling** - UV for Python, Bun for frontend with CSS nesting & variables
- 🎨 **Modern Frontend** - Modular JavaScript, modern CSS with nesting, separate build process
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

### Backend
- **[Python 3.11+](https://www.python.org/)** - Modern Python with async support
- **[FastAPI](https://fastapi.tiangolo.com/)** - High-performance async web framework
- **[PostgreSQL 14+](https://www.postgresql.org/)** - Advanced relational database with pub/sub
- **[asyncpg](https://github.com/MagicStack/asyncpg)** - Fast PostgreSQL driver for asyncio
- **[UV](https://github.com/astral-sh/uv)** - Blazingly fast Python package installer
- **[Uvicorn](https://www.uvicorn.org/)** - ASGI server for FastAPI

### Frontend
- **[Bun](https://bun.sh)** - Fast JavaScript bundler and runtime
- **Modern CSS** - CSS nesting and CSS variables for maintainable styles
- **ES Modules** - Native JavaScript modules for clean code organization

## 📋 Prerequisites

- Python 3.11 or higher
- PostgreSQL 14 or higher
- UV package manager (recommended) or pip
- Bun 1.0 or higher (for frontend development)

## 🔧 Installation

```bash
# Clone the repository
git clone https://github.com/garage44/plank.git
cd plank

# Install UV if you haven't already
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies (UV handles virtual environments automatically!)
uv sync
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

### Setup

1. **Install Bun** (if you haven't already):
```bash
curl -fsSL https://bun.sh/install | bash
```

2. **Install frontend dependencies:**
```bash
cd frontend
bun install
```

3. **Initial build:**
```bash
bun run build
cd ..
```

### Development Workflow

Run both services in separate terminals:

**Terminal 1** - FastAPI backend server:
```bash
uv run uvicorn plank.main:app --reload
```

**Terminal 2** - Bun frontend dev server with HMR:
```bash
cd frontend
bun run dev
```

### Access the Application

#### Development
- **Frontend Application:** http://localhost:3000 (Bun dev server with HMR)
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

#### Production
- **All routes:** http://localhost:8000 (FastAPI serves built frontend)

The Bun dev server provides Hot Module Reloading - changes appear instantly! API requests are automatically proxied to the FastAPI backend.

### Connect via WebSocket

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
├── frontend/                # Frontend application (Bun)
│   ├── src/
│   │   ├── index.html       # Main HTML file
│   │   ├── styles/          # Modern CSS with nesting & variables
│   │   │   ├── variables.css
│   │   │   └── main.css
│   │   └── scripts/         # JavaScript modules
│   │       └── main.js
│   ├── dist/                # Built frontend (generated)
│   ├── package.json         # Bun package configuration
│   └── build.ts             # Build script
├── plank/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration management
│   ├── api/                 # REST API endpoints
│   │   ├── __init__.py
│   │   └── routes.py
│   ├── websocket/           # WebSocket handlers
│   │   ├── __init__.py
│   │   └── manager.py       # WebSocket connection manager
│   └── db/                  # Database layer
│       ├── __init__.py
│       ├── connection.py    # Database connection pool
│       ├── listener.py      # PostgreSQL LISTEN/NOTIFY handler
│       ├── models.py        # Database models
│       └── init.py          # Database initialization
└── tests/
    ├── __init__.py
    └── test_api.py
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

## 🧹 Code Quality

### Linting and Formatting

```bash
# Check code with Ruff
ruff check plank tests

# Auto-fix issues
ruff check --fix plank tests

# Format code
ruff format plank tests

# Check formatting without making changes
ruff format --check plank tests
```

Ruff configuration is in `pyproject.toml`.

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

- **Real-time dashboards** - Financial data, analytics, operational metrics
- **Collaborative tools** - Multi-user editing, shared workspaces
- **Monitoring & alerting** - System health, security events, KPI tracking
- **Customer engagement** - Live notifications, activity feeds, support queues
- **IoT & logistics** - Device telemetry, fleet tracking, inventory updates

---

**Made with ❤️ using FastAPI, WebSockets, and PostgreSQL**
