"""Integration tests for vehicle API endpoints (TDD RED → GREEN)."""

import pytest
import httpx
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_NOW = datetime.now(timezone.utc)

_VEHICLE_DOC = {
    "_id": "64b1f1f1f1f1f1f1f1f1f1f1",
    "make": "Honda",
    "model": "Civic",
    "category": "Sedan",
    "price": 20000.0,
    "quantity": 5,
    "created_at": _NOW,
    "updated_at": _NOW,
}


def _make_vehicle_repo(created_id="64b1f1f1f1f1f1f1f1f1f1f1", docs=None):
    repo = MagicMock()
    repo.create = AsyncMock(return_value=created_id)
    repo.find_all = AsyncMock(return_value=(docs or [_VEHICLE_DOC], len(docs or [_VEHICLE_DOC])))
    repo.search = AsyncMock(return_value=docs or [_VEHICLE_DOC])
    repo.find_by_id = AsyncMock(return_value=_VEHICLE_DOC)
    repo.update = AsyncMock(return_value=True)
    return repo


def _admin_token():
    from app.core.security import create_access_token
    return create_access_token(sub="admin123", role="ADMIN")


def _user_token():
    from app.core.security import create_access_token
    return create_access_token(sub="user123", role="USER")


def _make_client(repo):
    from app.main import app
    from app.api.dependencies import get_vehicle_repository

    app.dependency_overrides[get_vehicle_repository] = lambda: repo
    transport = httpx.ASGITransport(app=app)
    return httpx.AsyncClient(transport=transport, base_url="http://test")


# ===========================================================================
# POST /api/vehicles — CREATE
# ===========================================================================

@pytest.mark.asyncio
async def test_create_vehicle_returns_201():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.post(
            "/api/vehicles",
            json={"make": "Honda", "model": "Civic", "category": "Sedan", "price": 20000, "quantity": 5},
            headers={"Authorization": f"Bearer {_admin_token()}"},
        )
    assert resp.status_code == 201


@pytest.mark.asyncio
async def test_create_vehicle_missing_make_returns_422():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.post(
            "/api/vehicles",
            json={"make": "", "model": "Civic", "category": "Sedan", "price": 20000, "quantity": 5},
            headers={"Authorization": f"Bearer {_admin_token()}"},
        )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_create_vehicle_missing_model_returns_422():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.post(
            "/api/vehicles",
            json={"make": "Honda", "model": "", "category": "Sedan", "price": 20000, "quantity": 5},
            headers={"Authorization": f"Bearer {_admin_token()}"},
        )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_create_vehicle_missing_category_returns_422():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.post(
            "/api/vehicles",
            json={"make": "Honda", "model": "Civic", "category": "", "price": 20000, "quantity": 5},
            headers={"Authorization": f"Bearer {_admin_token()}"},
        )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_create_vehicle_invalid_price_returns_422():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.post(
            "/api/vehicles",
            json={"make": "Honda", "model": "Civic", "category": "Sedan", "price": 0, "quantity": 5},
            headers={"Authorization": f"Bearer {_admin_token()}"},
        )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_create_vehicle_negative_quantity_returns_422():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.post(
            "/api/vehicles",
            json={"make": "Honda", "model": "Civic", "category": "Sedan", "price": 20000, "quantity": -1},
            headers={"Authorization": f"Bearer {_admin_token()}"},
        )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_create_vehicle_unauthenticated_returns_401():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.post(
            "/api/vehicles",
            json={"make": "Honda", "model": "Civic", "category": "Sedan", "price": 20000, "quantity": 5},
        )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_create_vehicle_non_admin_returns_403():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.post(
            "/api/vehicles",
            json={"make": "Honda", "model": "Civic", "category": "Sedan", "price": 20000, "quantity": 5},
            headers={"Authorization": f"Bearer {_user_token()}"},
        )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_create_vehicle_returns_unique_id():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.post(
            "/api/vehicles",
            json={"make": "Honda", "model": "Civic", "category": "Sedan", "price": 20000, "quantity": 5},
            headers={"Authorization": f"Bearer {_admin_token()}"},
        )
    assert resp.status_code == 201
    assert "id" in resp.json()
