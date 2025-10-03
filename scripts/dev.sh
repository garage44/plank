#!/bin/bash
# Development helper script

set -e

echo "🏗️  Plank Development Script"
echo ""

# Check if UV is installed
if ! command -v uv &> /dev/null; then
    echo "❌ UV is not installed. Install it with:"
    echo "   curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

echo "✓ UV is installed"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
uv sync

# Check if .env exists
if [ ! -f .env ]; then
    echo ""
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✓ Created .env file - please update with your database credentials"
fi

# Check PostgreSQL connection
echo ""
echo "🔍 Checking database connection..."
if uv run python -c "import asyncio; import asyncpg; from plank.config import settings; asyncio.run(asyncpg.connect(settings.database_url))" 2>/dev/null; then
    echo "✓ Database connection successful"

    # Initialize database
    echo ""
    echo "🗄️  Initializing database..."
    uv run python -m plank.db.init
else
    echo "❌ Could not connect to database"
    echo "   Make sure PostgreSQL is running and credentials in .env are correct"
    echo "   Quick start with Docker: docker-compose up db -d"
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Starting development server..."
echo "   API: http://localhost:8000"
echo "   Docs: http://localhost:8000/docs"
echo ""

uv run uvicorn plank.main:app --reload

