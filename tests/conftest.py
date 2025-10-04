"""Test configuration and fixtures."""

import asyncio
import os

import asyncpg
import pytest
import pytest_asyncio

# Use a test database URL - can be overridden with TEST_DATABASE_URL env var
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql://plank_user:plank_pass@localhost:5432/plank_test_db",
)


@pytest_asyncio.fixture(scope="session")
async def test_db_url():
    """Provide test database URL."""
    return TEST_DATABASE_URL


@pytest_asyncio.fixture(scope="session")
async def init_test_database(test_db_url):
    """Initialize test database with schema."""
    # Connect to postgres database to create test database
    base_url = test_db_url.rsplit("/", 1)[0]
    db_name = test_db_url.rsplit("/", 1)[1]

    # Connect to default postgres database
    conn = await asyncpg.connect(f"{base_url}/postgres")

    try:
        # Drop and recreate test database
        await conn.execute(f"DROP DATABASE IF EXISTS {db_name}")
        await conn.execute(f"CREATE DATABASE {db_name}")
        print(f"✓ Created test database: {db_name}")
    finally:
        await conn.close()

    # Now connect to the test database and initialize schema
    conn = await asyncpg.connect(test_db_url)

    try:
        # Create items table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS items (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                value INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Create notification function
        await conn.execute("""
            CREATE OR REPLACE FUNCTION notify_item_changes()
            RETURNS TRIGGER AS $$
            DECLARE
                payload JSON;
            BEGIN
                IF (TG_OP = 'DELETE') THEN
                    payload = json_build_object(
                        'table', TG_TABLE_NAME,
                        'action', TG_OP,
                        'id', OLD.id,
                        'data', row_to_json(OLD)
                    );
                ELSE
                    payload = json_build_object(
                        'table', TG_TABLE_NAME,
                        'action', TG_OP,
                        'id', NEW.id,
                        'data', row_to_json(NEW)
                    );
                END IF;

                PERFORM pg_notify('item_changes', payload::text);

                IF (TG_OP = 'DELETE') THEN
                    RETURN OLD;
                ELSE
                    RETURN NEW;
                END IF;
            END;
            $$ LANGUAGE plpgsql;
        """)

        # Create trigger
        await conn.execute("""
            DROP TRIGGER IF EXISTS items_notify_trigger ON items;
            CREATE TRIGGER items_notify_trigger
            AFTER INSERT OR UPDATE OR DELETE ON items
            FOR EACH ROW EXECUTE FUNCTION notify_item_changes();
        """)

        # Create update timestamp function
        await conn.execute("""
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        """)

        # Create update timestamp trigger
        await conn.execute("""
            DROP TRIGGER IF EXISTS update_items_updated_at ON items;
            CREATE TRIGGER update_items_updated_at
            BEFORE UPDATE ON items
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        """)

        print("✓ Initialized test database schema")

    finally:
        await conn.close()

    yield test_db_url

    # Cleanup after all tests
    conn = await asyncpg.connect(f"{base_url}/postgres")
    try:
        # Disconnect all users from test database
        await conn.execute(f"""
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = '{db_name}'
            AND pid <> pg_backend_pid()
        """)
        await conn.execute(f"DROP DATABASE IF EXISTS {db_name}")
        print(f"✓ Cleaned up test database: {db_name}")
    finally:
        await conn.close()


@pytest_asyncio.fixture
async def db_connection(init_test_database, test_db_url):
    """Provide a fresh database connection for each test."""
    conn = await asyncpg.connect(test_db_url)

    # Clean up items table before each test
    await conn.execute("TRUNCATE items RESTART IDENTITY CASCADE")

    yield conn

    await conn.close()


@pytest.fixture(scope="session")
def event_loop():
    """Create an event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()
