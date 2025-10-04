# Testing Guide for Plank

This guide explains how to run tests for Plank, including integration tests that verify PostgreSQL NOTIFY/LISTEN functionality.

## Overview

Plank includes two types of tests:

1. **API Tests** (`test_api.py`) - Basic endpoint tests that don't require database
2. **Integration Tests** (`test_integration.py`) - Full integration tests that verify:
   - Item insertion triggers PostgreSQL NOTIFY events
   - Item updates trigger notifications with correct payload
   - Item deletions trigger notifications
   - Multiple operations generate multiple notifications
   - Timestamp triggers work correctly

## Quick Start

### Run All Tests (requires PostgreSQL)

```bash
# Option 1: Using Docker Compose (recommended)
docker-compose up -d db
uv run pytest tests/ -v
docker-compose down

# Option 2: Using local PostgreSQL with setup script
./scripts/setup_test_db.sh
uv run pytest tests/ -v
```

### Run API Tests Only (no database required)

```bash
uv run pytest tests/test_api.py -v
```

## GitHub Actions CI

The project includes a GitHub Actions workflow (`.github/workflows/test.yml`) that:

✅ Automatically runs on push/PR to `main` and `develop` branches
✅ Provisions a PostgreSQL 16 service container
✅ Runs all tests with proper database credentials
✅ Generates coverage reports
✅ Optionally uploads to Codecov

**No additional setup required** - the workflow handles everything automatically!

## Local Development Setup

### Prerequisites

- Python 3.11+
- PostgreSQL (running via Docker or locally)
- `uv` package manager

### Installation

```bash
# Install dependencies with dev extras
uv sync --all-extras
```

### Database Setup Options

#### Option 1: Docker Compose (Easiest)

The project includes a `docker-compose.yml` that sets up PostgreSQL with the correct credentials:

```bash
# Start PostgreSQL
docker-compose up -d db

# Check it's running
pg_isready -h localhost -p 5432 -U plank_user

# Run tests
uv run pytest tests/ -v

# When done
docker-compose down
```

#### Option 2: Local PostgreSQL

If you have PostgreSQL installed locally, use the setup script:

```bash
# Run the setup script (requires sudo for user creation)
./scripts/setup_test_db.sh

# Or manually create the user and database:
sudo -u postgres psql -c "CREATE USER plank_user WITH PASSWORD 'plank_pass' CREATEDB;"
psql -U plank_user -d postgres -c "CREATE DATABASE plank_test_db;"

# Run tests
uv run pytest tests/ -v
```

#### Option 3: Custom Database URL

You can use any PostgreSQL instance by setting the `TEST_DATABASE_URL` environment variable:

```bash
export TEST_DATABASE_URL="postgresql://user:pass@host:port/testdb"
uv run pytest tests/ -v
```

## Test Structure

### `tests/conftest.py`

Shared pytest fixtures:

- `test_db_url`: Provides the test database URL
- `init_test_database`: Creates and initializes the test database schema
- `db_connection`: Provides a fresh database connection for each test

### `tests/test_integration.py`

Integration tests that verify the core Plank functionality:

#### `test_item_insertion_triggers_notification`
Verifies that when an item is inserted into the database, a PostgreSQL NOTIFY event is triggered with the correct payload.

#### `test_item_update_triggers_notification`
Verifies that updating an item triggers a notification with the updated data.

#### `test_item_deletion_triggers_notification`
Verifies that deleting an item triggers a notification with the deleted item's data.

#### `test_multiple_items_trigger_multiple_notifications`
Verifies that multiple operations generate multiple notifications in the correct order.

#### `test_updated_at_timestamp_changes_on_update`
Verifies that the `updated_at` timestamp changes when an item is updated, but `created_at` remains unchanged.

## Running Tests

### Run all tests
```bash
uv run pytest tests/ -v
```

### Run specific test file
```bash
uv run pytest tests/test_integration.py -v
```

### Run specific test
```bash
uv run pytest tests/test_integration.py::test_item_insertion_triggers_notification -v
```

### Run with coverage
```bash
uv run pytest tests/ --cov=plank --cov-report=term-missing
```

### Run with coverage HTML report
```bash
uv run pytest tests/ --cov=plank --cov-report=html
open htmlcov/index.html
```

## How the Integration Tests Work

The integration tests verify Plank's core feature: real-time database change propagation via PostgreSQL LISTEN/NOTIFY.

### Architecture

1. **PostgreSQL Triggers**: When items are inserted/updated/deleted, a trigger calls `notify_item_changes()`
2. **NOTIFY Function**: Sends a JSON payload to the `item_changes` channel
3. **Test Listener**: Tests create a separate connection that listens to this channel
4. **Verification**: Tests verify that notifications are received with correct data

### Example Test Flow

```python
# 1. Test creates a listener connection
listener_conn = await asyncpg.connect(test_db_url)
await listener_conn.add_listener("item_changes", handler)

# 2. Test inserts an item via regular connection
await db_connection.fetchrow(
    "INSERT INTO items (name, value) VALUES ($1, $2)",
    "Test Item", 42
)

# 3. PostgreSQL trigger fires and sends NOTIFY
# 4. Listener receives notification
# 5. Test verifies notification payload matches inserted data
```

This ensures that the real-time synchronization that Plank provides to WebSocket clients actually works at the database level.

## Troubleshooting

### "password authentication failed for user 'plank_user'"

Your local PostgreSQL doesn't have the test user configured. Either:
- Use Docker Compose: `docker-compose up -d db`
- Run the setup script: `./scripts/setup_test_db.sh`
- Set a custom `TEST_DATABASE_URL` pointing to your database

### "database 'plank_test_db' does not exist"

The test fixtures create this automatically, but if you're connecting manually:
```bash
psql -U plank_user -d postgres -c "CREATE DATABASE plank_test_db;"
```

### Tests hang or timeout

Check that PostgreSQL is actually running:
```bash
pg_isready -h localhost -p 5432 -U plank_user
```

### Docker daemon not running

If using Docker Compose:
```bash
sudo systemctl start docker
# or on Mac:
open -a Docker
```

## CI/CD Integration

The GitHub Actions workflow (`.github/workflows/test.yml`) automatically:

1. Provisions PostgreSQL 16 in a service container
2. Waits for it to be healthy
3. Sets `TEST_DATABASE_URL` to point to the service
4. Runs all tests
5. Generates and uploads coverage

**You don't need to configure anything** - just push your code and the tests will run automatically!

## Contributing

When adding new tests:

1. Add unit/API tests to `test_api.py`
2. Add integration tests to `test_integration.py`
3. Use the `db_connection` fixture for database access
4. Ensure tests clean up after themselves (fixtures handle this)
5. Run tests locally before pushing

## Coverage Goals

- Aim for 80%+ code coverage
- All critical paths should be tested
- Integration tests should cover the NOTIFY/LISTEN mechanism
- API tests should cover all endpoints

Check coverage with:
```bash
uv run pytest tests/ --cov=plank --cov-report=term-missing
```
