# GitHub Actions Workflows

This directory contains CI/CD workflows for the Plank project.

## test.yml

Runs the test suite on every push and pull request to `main` and `develop` branches.

### Features:

- **PostgreSQL Service**: Automatically provisions a PostgreSQL 16 instance for integration tests
- **Python Environment**: Sets up Python 3.11 with all dependencies via `uv`
- **Test Coverage**: Runs tests with coverage reporting
- **Codecov Integration**: Uploads coverage reports to Codecov (optional)

### Services Used:

- **PostgreSQL 16 Alpine**: Provides the database for integration tests
  - Database: `plank_test_db`
  - User: `plank_user`
  - Password: `plank_pass`
  - Port: 5432
  - Health checks ensure database is ready before tests run

### Environment Variables:

- `TEST_DATABASE_URL`: Set to connect to the PostgreSQL service container

### How It Works:

1. Checks out the code
2. Sets up Python 3.11
3. Installs `uv` package manager
4. Installs project dependencies with dev extras
5. Waits for PostgreSQL to be healthy
6. Runs pytest with verbose output
7. Generates coverage report
8. Optionally uploads to Codecov

### Local Testing:

To replicate the CI environment locally, you can use Docker Compose:

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

Or use the setup script:

```bash
./scripts/setup_test_db.sh
uv run pytest tests/ -v
```

## Adding New Workflows

To add new workflows:

1. Create a new `.yml` file in this directory
2. Define triggers (push, pull_request, schedule, etc.)
3. Add jobs with appropriate steps
4. Use service containers if needed for databases, Redis, etc.

## Badges

Add status badges to your README:

```markdown
![Tests](https://github.com/yourusername/plank/workflows/Run%20Tests/badge.svg)
[![codecov](https://codecov.io/gh/yourusername/plank/branch/main/graph/badge.svg)](https://codecov.io/gh/yourusername/plank)
```
