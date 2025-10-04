# Plank Tests

This directory contains tests for the Plank project, including integration tests that verify PostgreSQL NOTIFY/LISTEN functionality.

## Prerequisites

- PostgreSQL running locally (or accessible via connection string)
- Python 3.11+
- Project dependencies installed

## Setup

1. Install dependencies with dev extras:
```bash
uv sync --all-extras
```

2. Ensure PostgreSQL is running. The tests will create a separate test database (`plank_test_db` by default).

## Running Tests

### Run all tests:
```bash
uv run pytest tests/ -v
```

### Run with coverage:
```bash
uv run pytest tests/ --cov=plank --cov-report=term-missing
```

### Run only integration tests:
```bash
uv run pytest tests/test_integration.py -v
```

### Run only API tests:
```bash
uv run pytest tests/test_api.py -v
```

## Configuration

### Custom Database URL

By default, tests use:
```
postgresql://plank_user:plank_pass@localhost:5432/plank_test_db
```

You can override this with the `TEST_DATABASE_URL` environment variable:

```bash
export TEST_DATABASE_URL="postgresql://user:pass@host:5432/testdb"
uv run pytest tests/ -v
```

### Using Docker Compose

If you want to run tests against a PostgreSQL instance in Docker:

```bash
# Start PostgreSQL
docker-compose up -d db

# Wait for it to be ready
until pg_isready -h localhost -p 5432 -U plank_user; do
  echo "Waiting for postgres..."
  sleep 2
done

# Run tests
uv run pytest tests/ -v

# Cleanup
docker-compose down
```

## Test Structure

- `conftest.py` - Shared fixtures including database setup/teardown
- `test_api.py` - API endpoint tests (existing)
- `test_integration.py` - Integration tests for PostgreSQL NOTIFY/LISTEN functionality

## Integration Tests

The integration tests (`test_integration.py`) verify that:

1. **Item insertion** triggers PostgreSQL NOTIFY events
2. **Item updates** trigger NOTIFY events with correct payload
3. **Item deletion** triggers NOTIFY events
4. **Multiple operations** generate multiple notifications
5. **Timestamp triggers** update `updated_at` correctly

These tests ensure that Plank's real-time synchronization mechanism works correctly at the database level.

## CI/CD

Tests are automatically run on GitHub Actions for:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

The workflow uses PostgreSQL service container and runs all tests with coverage reporting.
