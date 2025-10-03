# Quick Start Guide

Get Plank running in 5 minutes!

## Option 1: Docker Compose (Easiest)

```bash
# Start everything (PostgreSQL + API)
docker-compose up

# The API will be available at http://localhost:8000
```

That's it! The database will be automatically initialized.

## Option 2: Local Development

### 1. Install UV

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 2. Install Dependencies

```bash
uv sync
```

### 3. Set Up PostgreSQL

Make sure PostgreSQL is running, then create a database:

```bash
createdb plank_db
createuser plank_user
```

Or use Docker for just the database:

```bash
docker run -d \
  --name plank-postgres \
  -e POSTGRES_DB=plank_db \
  -e POSTGRES_USER=plank_user \
  -e POSTGRES_PASSWORD=plank_pass \
  -p 5432:5432 \
  postgres:16-alpine
```

### 4. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database credentials if needed
```

### 5. Initialize Database

```bash
uv run python -m plank.db.init
```

### 6. Start the Server

```bash
uv run uvicorn plank.main:app --reload
```

### 7. Open Your Browser

Visit http://localhost:8000 to see the WebSocket test client!

## Try It Out

1. Open http://localhost:8000 in your browser
2. The WebSocket will auto-connect
3. Create an item using the form
4. Watch it appear in real-time via WebSocket!

You can also:
- View API docs: http://localhost:8000/docs
- Check health: http://localhost:8000/health

## What's Happening?

1. When you create an item via the API, it's inserted into PostgreSQL
2. A database trigger fires and sends a NOTIFY event
3. The FastAPI app listens to these events
4. Changes are broadcast to all connected WebSocket clients
5. Your browser receives the update in real-time!

## Next Steps

- Check out the API documentation at `/docs`
- Modify the database models in `plank/db/models.py`
- Add more tables and triggers in `plank/db/init.py`
- Customize the WebSocket logic in `plank/websocket/manager.py`
- Build your own frontend to consume the WebSocket events!

## Troubleshooting

**Can't connect to database?**
- Make sure PostgreSQL is running
- Check your DATABASE_URL in `.env`
- Verify the database and user exist

**WebSocket not connecting?**
- Check the browser console for errors
- Make sure the server is running on port 8000
- Check CORS settings in `plank/config.py`

**No real-time updates?**
- Verify the database triggers are created: `uv run python -m plank.db.init`
- Check the server logs for errors
- Make sure the WebSocket is connected (green status)

