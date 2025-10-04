"""Integration tests for Plank's PostgreSQL NOTIFY/LISTEN functionality."""

import asyncio
import json

import asyncpg
import pytest


@pytest.mark.asyncio
async def test_item_insertion_triggers_notification(db_connection, test_db_url):
    """Test that inserting an item triggers a PostgreSQL NOTIFY event."""
    # Create a listener connection
    listener_conn = await asyncpg.connect(test_db_url)

    # Track received notifications
    notifications = []

    def notification_handler(connection, pid, channel, payload):
        """Handle incoming notifications."""
        notifications.append({"channel": channel, "payload": json.loads(payload)})

    try:
        # Subscribe to item_changes channel
        await listener_conn.add_listener("item_changes", notification_handler)

        # Insert an item using the db_connection
        row = await db_connection.fetchrow(
            """
            INSERT INTO items (name, value)
            VALUES ($1, $2)
            RETURNING *
        """,
            "Test Item",
            42,
        )

        # Wait a bit for the notification to be processed
        await asyncio.sleep(0.5)

        # Verify the item was inserted
        assert row is not None
        assert row["name"] == "Test Item"
        assert row["value"] == 42
        assert row["id"] is not None

        # Verify notification was received
        assert len(notifications) == 1, f"Expected 1 notification, got {len(notifications)}"

        notification = notifications[0]
        assert notification["channel"] == "item_changes"

        payload = notification["payload"]
        assert payload["table"] == "items"
        assert payload["action"] == "INSERT"
        assert payload["id"] == row["id"]
        assert payload["data"]["name"] == "Test Item"
        assert payload["data"]["value"] == 42

        print(f"✓ Notification received: {payload}")

    finally:
        await listener_conn.close()


@pytest.mark.asyncio
async def test_item_update_triggers_notification(db_connection, test_db_url):
    """Test that updating an item triggers a PostgreSQL NOTIFY event."""
    # Create a listener connection
    listener_conn = await asyncpg.connect(test_db_url)

    # Track received notifications
    notifications = []

    def notification_handler(connection, pid, channel, payload):
        """Handle incoming notifications."""
        notifications.append({"channel": channel, "payload": json.loads(payload)})

    try:
        # Subscribe to item_changes channel
        await listener_conn.add_listener("item_changes", notification_handler)

        # First, insert an item
        row = await db_connection.fetchrow(
            """
            INSERT INTO items (name, value)
            VALUES ($1, $2)
            RETURNING id
        """,
            "Original Item",
            10,
        )

        item_id = row["id"]

        # Clear notifications from INSERT
        await asyncio.sleep(0.3)
        notifications.clear()

        # Now update the item
        updated_row = await db_connection.fetchrow(
            """
            UPDATE items
            SET name = $1, value = $2
            WHERE id = $3
            RETURNING *
        """,
            "Updated Item",
            99,
            item_id,
        )

        # Wait for notification
        await asyncio.sleep(0.5)

        # Verify the item was updated
        assert updated_row["name"] == "Updated Item"
        assert updated_row["value"] == 99

        # Verify UPDATE notification was received
        assert len(notifications) == 1, f"Expected 1 notification, got {len(notifications)}"

        notification = notifications[0]
        payload = notification["payload"]
        assert payload["action"] == "UPDATE"
        assert payload["id"] == item_id
        assert payload["data"]["name"] == "Updated Item"
        assert payload["data"]["value"] == 99

        print(f"✓ Update notification received: {payload}")

    finally:
        await listener_conn.close()


@pytest.mark.asyncio
async def test_item_deletion_triggers_notification(db_connection, test_db_url):
    """Test that deleting an item triggers a PostgreSQL NOTIFY event."""
    # Create a listener connection
    listener_conn = await asyncpg.connect(test_db_url)

    # Track received notifications
    notifications = []

    def notification_handler(connection, pid, channel, payload):
        """Handle incoming notifications."""
        notifications.append({"channel": channel, "payload": json.loads(payload)})

    try:
        # Subscribe to item_changes channel
        await listener_conn.add_listener("item_changes", notification_handler)

        # First, insert an item
        row = await db_connection.fetchrow(
            """
            INSERT INTO items (name, value)
            VALUES ($1, $2)
            RETURNING id, name, value
        """,
            "Item to Delete",
            777,
        )

        item_id = row["id"]
        item_name = row["name"]
        item_value = row["value"]

        # Clear notifications from INSERT
        await asyncio.sleep(0.3)
        notifications.clear()

        # Now delete the item
        result = await db_connection.execute(
            """
            DELETE FROM items WHERE id = $1
        """,
            item_id,
        )

        # Wait for notification
        await asyncio.sleep(0.5)

        # Verify the item was deleted
        assert result == "DELETE 1"

        # Verify DELETE notification was received
        assert len(notifications) == 1, f"Expected 1 notification, got {len(notifications)}"

        notification = notifications[0]
        payload = notification["payload"]
        assert payload["action"] == "DELETE"
        assert payload["id"] == item_id
        assert payload["data"]["name"] == item_name
        assert payload["data"]["value"] == item_value

        print(f"✓ Delete notification received: {payload}")

    finally:
        await listener_conn.close()


@pytest.mark.asyncio
async def test_multiple_items_trigger_multiple_notifications(db_connection, test_db_url):
    """Test that multiple item insertions trigger multiple notifications."""
    # Create a listener connection
    listener_conn = await asyncpg.connect(test_db_url)

    # Track received notifications
    notifications = []

    def notification_handler(connection, pid, channel, payload):
        """Handle incoming notifications."""
        notifications.append(json.loads(payload))

    try:
        # Subscribe to item_changes channel
        await listener_conn.add_listener("item_changes", notification_handler)

        # Insert multiple items
        items_to_insert = [
            ("Item 1", 100),
            ("Item 2", 200),
            ("Item 3", 300),
        ]

        inserted_ids = []
        for name, value in items_to_insert:
            row = await db_connection.fetchrow(
                """
                INSERT INTO items (name, value)
                VALUES ($1, $2)
                RETURNING id
            """,
                name,
                value,
            )
            inserted_ids.append(row["id"])

        # Wait for all notifications
        await asyncio.sleep(0.5)

        # Verify we received 3 notifications
        assert len(notifications) == 3, f"Expected 3 notifications, got {len(notifications)}"

        # Verify each notification corresponds to the inserted items
        for i, notification in enumerate(notifications):
            assert notification["action"] == "INSERT"
            assert notification["id"] == inserted_ids[i]
            assert notification["data"]["name"] == items_to_insert[i][0]
            assert notification["data"]["value"] == items_to_insert[i][1]

        print(f"✓ All {len(notifications)} notifications received correctly")

    finally:
        await listener_conn.close()


@pytest.mark.asyncio
async def test_updated_at_timestamp_changes_on_update(db_connection):
    """Test that the updated_at timestamp changes when an item is updated."""
    # Insert an item
    row = await db_connection.fetchrow(
        """
        INSERT INTO items (name, value)
        VALUES ($1, $2)
        RETURNING id, created_at, updated_at
    """,
        "Timestamp Test",
        123,
    )

    item_id = row["id"]
    original_created_at = row["created_at"]
    original_updated_at = row["updated_at"]

    # Wait a moment to ensure timestamp difference
    await asyncio.sleep(0.1)

    # Update the item
    updated_row = await db_connection.fetchrow(
        """
        UPDATE items
        SET value = $1
        WHERE id = $2
        RETURNING created_at, updated_at
    """,
        456,
        item_id,
    )

    # Verify created_at hasn't changed but updated_at has
    assert updated_row["created_at"] == original_created_at
    assert updated_row["updated_at"] > original_updated_at

    print("✓ Timestamp triggers working correctly")
