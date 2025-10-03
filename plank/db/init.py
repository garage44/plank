"""Database initialization script."""

import asyncio

import asyncpg

from plank.config import settings


async def init_database():
    """Initialize database with tables and triggers."""
    conn = await asyncpg.connect(settings.database_url)

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
        print("✓ Created items table")

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
        print("✓ Created notification function")

        # Create trigger
        await conn.execute("""
            DROP TRIGGER IF EXISTS items_notify_trigger ON items;
            CREATE TRIGGER items_notify_trigger
            AFTER INSERT OR UPDATE OR DELETE ON items
            FOR EACH ROW EXECUTE FUNCTION notify_item_changes();
        """)
        print("✓ Created trigger on items table")

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
        print("✓ Created updated_at trigger")

        print("\n✅ Database initialized successfully!")

    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(init_database())

