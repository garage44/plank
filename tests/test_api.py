"""Tests for API endpoints."""

import pytest
from httpx import ASGITransport, AsyncClient

from plank.main import app


@pytest.mark.asyncio
async def test_health_endpoint():
    """Test health check endpoint."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data


@pytest.mark.asyncio
async def test_root_endpoint():
    """Test root endpoint returns HTML or JSON fallback."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/")
        assert response.status_code == 200
        # Should return HTML if frontend is built, or JSON fallback if not
        content_type = response.headers["content-type"]
        assert "html" in content_type or "json" in content_type
