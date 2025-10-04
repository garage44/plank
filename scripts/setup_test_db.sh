#!/bin/bash
# Setup test database for local development

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up test database for Plank...${NC}"

# Check if PostgreSQL is available
if ! command -v psql &> /dev/null; then
    echo "Error: psql not found. Please install PostgreSQL."
    exit 1
fi

# PostgreSQL connection details
PG_HOST="${PG_HOST:-localhost}"
PG_PORT="${PG_PORT:-5432}"
PG_USER="${PG_USER:-plank_user}"
PG_PASS="${PG_PASS:-plank_pass}"
TEST_DB="${TEST_DB:-plank_test_db}"

# Export password for psql
export PGPASSWORD="$PG_PASS"

# Try to create user if it doesn't exist (requires superuser access)
echo "Creating PostgreSQL user (if needed)..."
if command -v sudo &> /dev/null && sudo -u postgres psql -c "" 2>/dev/null; then
    # Running with superuser access
    sudo -u postgres psql -c "CREATE USER $PG_USER WITH PASSWORD '$PG_PASS';" 2>/dev/null || echo "User already exists"
    sudo -u postgres psql -c "ALTER USER $PG_USER CREATEDB;" 2>/dev/null || true
    echo -e "${GREEN}✓ User configured${NC}"
else
    echo -e "${YELLOW}Note: Skipping user creation. Make sure user '$PG_USER' exists with password '$PG_PASS'${NC}"
fi

# Drop and recreate test database
echo "Setting up test database..."
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d postgres -c "DROP DATABASE IF EXISTS $TEST_DB;" 2>/dev/null || true
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d postgres -c "CREATE DATABASE $TEST_DB;"

echo -e "${GREEN}✓ Test database created: $TEST_DB${NC}"
echo ""
echo "You can now run tests with:"
echo "  uv run pytest tests/ -v"
echo ""
echo "Or with custom database URL:"
echo "  TEST_DATABASE_URL=postgresql://$PG_USER:$PG_PASS@$PG_HOST:$PG_PORT/$TEST_DB uv run pytest tests/ -v"
