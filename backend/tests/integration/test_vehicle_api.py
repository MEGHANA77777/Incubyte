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
    _docs = [_VEHICLE_DOC] if docs is None else docs
    repo.create = AsyncMock(return_value=created_id)
    repo.find_all = AsyncMock(return_value=(_docs, len(_docs)))
    repo.search = AsyncMock(return_value=_docs)
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
    from contextlib import asynccontextmanager
    from app.main import app
    from app.api.dependencies import get_vehicle_repository

    @asynccontextmanager
    async def _client():
        app.dependency_overrides[get_vehicle_repository] = lambda: repo
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
            try:
                yield c
            finally:
                app.dependency_overrides.pop(get_vehicle_repository, None)

    return _client()


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


# ===========================================================================
# GET /api/vehicles — LIST
# ===========================================================================

@pytest.mark.asyncio
async def test_list_vehicles_returns_200():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.get("/api/vehicles")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_list_vehicles_empty_inventory():
    repo = _make_vehicle_repo(docs=[])
    async with _make_client(repo) as c:
        resp = await c.get("/api/vehicles")
    assert resp.status_code == 200
    assert resp.json()["items"] == []
    assert resp.json()["total"] == 0


@pytest.mark.asyncio
async def test_list_vehicles_multiple():
    docs = [_VEHICLE_DOC, {**_VEHICLE_DOC, "_id": "64b1f1f1f1f1f1f1f1f1f1f2"}]
    repo = _make_vehicle_repo(docs=docs)
    async with _make_client(repo) as c:
        resp = await c.get("/api/vehicles")
    assert len(resp.json()["items"]) == 2


@pytest.mark.asyncio
async def test_list_vehicles_pagination_params():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.get("/api/vehicles?page=2&limit=5")
    assert resp.status_code == 200
    assert resp.json()["page"] == 2
    assert resp.json()["limit"] == 5


@pytest.mark.asyncio
async def test_list_vehicles_invalid_page_returns_422():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.get("/api/vehicles?page=0")
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_list_vehicles_invalid_limit_returns_422():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.get("/api/vehicles?limit=0")
    assert resp.status_code == 422


# ===========================================================================
# GET /api/vehicles/search — SEARCH
# ===========================================================================

@pytest.mark.asyncio
async def test_search_by_make_returns_200():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.get("/api/vehicles/search?make=Honda")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_search_by_model_returns_200():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.get("/api/vehicles/search?model=Civic")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_search_by_category_returns_200():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.get("/api/vehicles/search?category=Sedan")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_search_by_min_price_returns_200():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.get("/api/vehicles/search?min_price=10000")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_search_by_max_price_returns_200():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.get("/api/vehicles/search?max_price=30000")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_search_price_range_returns_200():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.get("/api/vehicles/search?min_price=10000&max_price=30000")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_search_combined_filters_returns_200():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.get("/api/vehicles/search?make=Honda&category=Sedan&min_price=10000")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_search_no_results_returns_empty_list():
    repo = _make_vehicle_repo(docs=[])
    async with _make_client(repo) as c:
        resp = await c.get("/api/vehicles/search?make=Unknown")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_search_invalid_price_range_returns_400():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.get("/api/vehicles/search?min_price=50000&max_price=10000")
    assert resp.status_code == 400


# ===========================================================================
# PUT /api/vehicles/{id} — UPDATE
# ===========================================================================

@pytest.mark.asyncio
async def test_update_vehicle_returns_200():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.put(
            "/api/vehicles/64b1f1f1f1f1f1f1f1f1f1f1",
            json={"price": 25000.0},
            headers={"Authorization": f"Bearer {_admin_token()}"},
        )
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_update_vehicle_not_found_returns_404():
    repo = _make_vehicle_repo()
    repo.find_by_id = AsyncMock(return_value=None)
    async with _make_client(repo) as c:
        resp = await c.put(
            "/api/vehicles/64b1f1f1f1f1f1f1f1f1f1f1",
            json={"price": 25000.0},
            headers={"Authorization": f"Bearer {_admin_token()}"},
        )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_update_vehicle_invalid_price_returns_422():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.put(
            "/api/vehicles/64b1f1f1f1f1f1f1f1f1f1f1",
            json={"price": -100.0},
            headers={"Authorization": f"Bearer {_admin_token()}"},
        )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_update_vehicle_invalid_quantity_returns_422():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.put(
            "/api/vehicles/64b1f1f1f1f1f1f1f1f1f1f1",
            json={"quantity": -1},
            headers={"Authorization": f"Bearer {_admin_token()}"},
        )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_update_vehicle_unauthenticated_returns_401():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.put(
            "/api/vehicles/64b1f1f1f1f1f1f1f1f1f1f1",
            json={"price": 25000.0},
        )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_update_vehicle_non_admin_returns_403():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.put(
            "/api/vehicles/64b1f1f1f1f1f1f1f1f1f1f1",
            json={"price": 25000.0},
            headers={"Authorization": f"Bearer {_user_token()}"},
        )
    assert resp.status_code == 403


# ===========================================================================
# DELETE /api/vehicles/{id} — DELETE
# ===========================================================================

@pytest.mark.asyncio
async def test_delete_vehicle_unauthenticated_returns_401():
    repo = _make_vehicle_repo()

    async with _make_client(repo) as c:
        resp = await c.delete(
            "/api/vehicles/64b1f1f1f1f1f1f1f1f1f1f1"
        )

    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_delete_vehicle_non_admin_returns_403():
    repo = _make_vehicle_repo()

    async with _make_client(repo) as c:
        resp = await c.delete(
            "/api/vehicles/64b1f1f1f1f1f1f1f1f1f1f1",
            headers={"Authorization": f"Bearer {_user_token()}"},
        )

    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_delete_vehicle_admin_returns_204():
    repo = _make_vehicle_repo()
    repo.delete = AsyncMock(return_value=True)

    async with _make_client(repo) as c:
        resp = await c.delete(
            "/api/vehicles/64b1f1f1f1f1f1f1f1f1f1f1",
            headers={"Authorization": f"Bearer {_admin_token()}"},
        )

    assert resp.status_code == 204
    repo.delete.assert_awaited_once_with(
        "64b1f1f1f1f1f1f1f1f1f1f1"
    )
    


@pytest.mark.asyncio
async def test_delete_vehicle_not_found_returns_404():
    repo = _make_vehicle_repo()
    repo.delete = AsyncMock(return_value=False)

    async with _make_client(repo) as c:
        resp = await c.delete(
            "/api/vehicles/64b1f1f1f1f1f1f1f1f1f1f1",
            headers={"Authorization": f"Bearer {_admin_token()}"},
        )

    assert resp.status_code == 404
