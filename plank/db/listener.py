"""PostgreSQL LISTEN/NOTIFY handler."""

import asyncio
import json
from typing import Callable

import asyncpg
from plank.config import settings


class PostgresListener:
    """Listens to PostgreSQL NOTIFY events and triggers callbacks."""

    def __init__(self):
        self.connection: asyncpg.Connection | None = None
        self.callbacks: dict[str, list[Callable]] = {}
        self._running = False

    async def connect(self):
        """Connect to PostgreSQL and start listening."""
        self.connection = await asyncpg.connect(settings.database_url)
        print("✓ Postgres listener connected")

    async def disconnect(self):
        """Disconnect from PostgreSQL."""
        self._running = False
        if self.connection:
            await self.connection.close()
            print("✓ Postgres listener closed")

    def subscribe(self, channel: str, callback: Callable):
        """Subscribe to a channel with a callback."""
        if channel not in self.callbacks:
            self.callbacks[channel] = []
        self.callbacks[channel].append(callback)

    async def listen(self, channel: str):
        """Start listening to a specific channel."""
        if not self.connection:
            await self.connect()

        await self.connection.add_listener(channel, self._notification_handler)
        print(f"✓ Listening on channel: {channel}")

    async def _notification_handler(self, connection, pid, channel, payload):
        """Handle incoming notifications."""
        try:
            data = json.loads(payload)
        except json.JSONDecodeError:
            data = {"raw": payload}

        # Call all registered callbacks for this channel
        if channel in self.callbacks:
            for callback in self.callbacks[channel]:
                try:
                    if asyncio.iscoroutinefunction(callback):
                        await callback(channel, data)
                    else:
                        callback(channel, data)
                except Exception as e:
                    print(f"Error in callback for {channel}: {e}")

    async def start(self):
        """Keep the listener running."""
        self._running = True
        try:
            while self._running:
                await asyncio.sleep(1)
        except asyncio.CancelledError:
            pass


# Global listener instance
listener = PostgresListener()

