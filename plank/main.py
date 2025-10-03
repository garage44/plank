"""FastAPI application entry point."""

import asyncio
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
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

# Frontend static files
FRONTEND_DIR = Path(__file__).parent.parent / "frontend" / "dist"

# Mount static files (JS, CSS)
if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")


@app.get("/")
async def index():
    """Serve the frontend application."""
    index_file = FRONTEND_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    else:
        # Fallback message if frontend hasn't been built
        return {
            "message": "Plank API is running",
            "note": "Frontend not found. Build the frontend with: cd frontend && bun run build",
            "docs": "/docs"
        }


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
