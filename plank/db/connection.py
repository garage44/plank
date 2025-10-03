"""Database connection pool management."""

import asyncpg
from plank.config import settings


class Database:
    """Database connection manager."""

    def __init__(self):
        self.pool: asyncpg.Pool | None = None

    async def connect(self):
        """Create database connection pool."""
        self.pool = await asyncpg.create_pool(
            settings.database_url,
            min_size=2,
            max_size=10,
        )
        print("✓ Database pool connected")

    async def disconnect(self):
        """Close database connection pool."""
        if self.pool:
            await self.pool.close()
            print("✓ Database pool closed")

    async def execute(self, query: str, *args):
        """Execute a query."""
        async with self.pool.acquire() as conn:
            return await conn.execute(query, *args)

    async def fetch(self, query: str, *args):
        """Fetch multiple rows."""
        async with self.pool.acquire() as conn:
            return await conn.fetch(query, *args)

    async def fetchrow(self, query: str, *args):
        """Fetch a single row."""
        async with self.pool.acquire() as conn:
            return await conn.fetchrow(query, *args)


# Global database instance
db = Database()
