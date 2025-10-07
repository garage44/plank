# Plank

> Real-time data synchronization infrastructure that eliminates polling and reduces server load by 90%+

Plank provides instant data updates to web clients when your database changes. Built on PostgreSQL's native pub/sub mechanism, it delivers sub-millisecond latency updates without the complexity and cost of external message queues or polling architectures.

## 🎓 About This Project

This is a **learning and exploration project** created to gain hands-on experience with modern real-time architectures, specifically PostgreSQL's NOTIFY/LISTEN mechanism with WebSockets. Built with AI assistance to accelerate development and focus on understanding architectural patterns rather than implementation minutiae.

**Learning Focus:**
- Real-time data synchronization patterns (PostgreSQL pub/sub)
- WebSocket connection lifecycle management
- Modern Python async/await patterns with FastAPI
- Full-stack deployment (Docker, systemd, nginx)
- Modern frontend development with Preact and Bun

This project demonstrates practical understanding of these technologies and serves as a foundation for discussing real-time architecture trade-offs and design decisions.

📖 **Read more:** [Technical Decisions & Trade-offs](docs/TECHNICAL_DECISIONS.md)

## ✨ Features

- 🚀 **FastAPI** - Modern, fast web framework for building APIs
- 🔌 **WebSocket Support** - Real-time bidirectional communication
- 🗄️ **PostgreSQL Integration** - Robust database with built-in pub/sub
- 📡 **Smart Change Detection** - Automatic client updates on database changes
- ⚡ **Async/Await** - Fully asynchronous architecture using asyncio
- 🛠️ **Modern Tooling** - UV for Python, Bun for frontend

## 🏛️ Architecture

```
┌─────────┐         ┌──────────────┐         ┌──────────────┐
│ Client  │◄────────┤   FastAPI    │◄────────┤  PostgreSQL  │
│ Browser │ WebSocket   WebSocket     LISTEN/   Database   │
└─────────┘         │   Handler    │  NOTIFY └──────────────┘
                    └──────────────┘
```

PostgreSQL triggers emit NOTIFY events → FastAPI listens → WebSocket clients receive updates in real-time.

## 📋 Prerequisites

- Python 3.11+
- PostgreSQL 14+
- UV package manager
- Bun 1.0+ (for frontend)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Clone and install
git clone https://github.com/garage44/plank.git
cd plank

# Install UV
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install Python dependencies
uv sync

# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install frontend dependencies
cd frontend && bun install && cd ..
```

### 2. Setup Database

```bash
# Configure database URL (edit as needed)
export DATABASE_URL=postgresql://plank_user:plank_pass@localhost:5432/plank_db

# Initialize database
uv run python -m plank.db.init
```

### 3. Development

```bash
# Terminal 1: Backend
uv run uvicorn plank.main:app --reload

# Terminal 2: Frontend (with hot reload)
cd frontend && bun run dev
```

Access at http://localhost:3000 (dev) or http://localhost:8000/docs (API)

## 🌐 Production Deployment

### Setup PostgreSQL

```bash
# Create user and database
sudo -u postgres psql -c "CREATE USER plank_user WITH PASSWORD 'plank_pass';"
sudo -u postgres psql -c "CREATE DATABASE plank_db OWNER plank_user;"

# Initialize schema
uv run python -m plank.db.init
```

### Build Frontend

```bash
cd frontend
bun run build
cd ..
```

### Systemd Service

Copy `plank.service` to systemd:

```bash
sudo cp docs/plank.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable plank
sudo systemctl start plank
```

Check status: `sudo systemctl status plank`

### Nginx Configuration

Copy `nginx.conf` and configure:

```bash
sudo cp docs/nginx.conf /etc/nginx/sites-available/plank
sudo nano /etc/nginx/sites-available/plank  # Edit domain/IP
sudo ln -s /etc/nginx/sites-available/plank /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

The nginx config includes proper WebSocket support and serves the frontend static files.

## 🐳 Docker Deployment

See `docker-compose.yml` for container setup:

```bash
docker-compose up -d
```

## 📚 Documentation

- [Technical Decisions & Trade-offs](docs/TECHNICAL_DECISIONS.md) - Architecture choices and when to use this pattern
- [Implementation Guide](docs/IMPLEMENTATION.md) - Detailed implementation notes
- [Quick Start](docs/QUICKSTART.md) - Get up and running in 5 minutes
- [Testing Guide](docs/TESTING.md) - How to run and write tests
- [Use Cases](docs/USECASES.md) - When this architecture makes sense

## 💡 Learning Resources

This project explores several modern concepts:

1. **PostgreSQL NOTIFY/LISTEN** - Native pub/sub without external message queues
2. **WebSocket Lifecycle** - Connection management, broadcasting, error handling
3. **Async Python** - FastAPI's async/await patterns with asyncio
4. **Modern Frontend** - Preact with signals for reactive state management
5. **Full Deployment** - Docker, systemd, nginx configuration

See [TECHNICAL_DECISIONS.md](docs/TECHNICAL_DECISIONS.md) for detailed trade-off analysis.

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with FastAPI, WebSockets, and PostgreSQL | Created as a learning project for exploring real-time architectures**
