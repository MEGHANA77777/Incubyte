"""Integration tests for inventory API endpoints (TDD RED → GREEN)."""

import pytest
import httpx
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime, timezone

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


def _make_vehicle_repo(purchase_result=True, restock_result=True, find_result=_VEHICLE_DOC):
    repo = MagicMock()
    repo.purchase = AsyncMock(return_value=purchase_result)
    repo.restock = AsyncMock(return_value=restock_result)
    repo.find_by_id = AsyncMock(return_value=find_result)
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
# POST /api/vehicles/{id}/purchase
# ===========================================================================


@pytest.mark.asyncio
async def test_purchase_authenticated_user_succeeds():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.post(
            "/api/vehicles/64b1f1f1f1f1f1f1f1f1f1f1/purchase",
            headers={"Authorization": f"Bearer {_user_token()}"},
        )
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_purchase_unauthenticated_returns_401():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.post("/api/vehicles/64b1f1f1f1f1f1f1f1f1f1f1/purchase")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_purchase_vehicle_not_found_returns_404():
    repo = _make_vehicle_repo(purchase_result=False, find_result=None)
    async with _make_client(repo) as c:
        resp = await c.post(
            "/api/vehicles/64b1f1f1f1f1f1f1f1f1f1f1/purchase",
            headers={"Authorization": f"Bearer {_user_token()}"},
        )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_purchase_vehicle_with_stock_returns_200():
    repo = _make_vehicle_repo(purchase_result=True)
    async with _make_client(repo) as c:
        resp = await c.post(
            "/api/vehicles/64b1f1f1f1f1f1f1f1f1f1f1/purchase",
            headers={"Authorization": f"Bearer {_user_token()}"},
        )
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_purchase_returns_vehicle_with_decremented_quantity():
    decremented_doc = {**_VEHICLE_DOC, "quantity": 4}
    repo = _make_vehicle_repo(purchase_result=True, find_result=decremented_doc)
    async with _make_client(repo) as c:
        resp = await c.post(
            "/api/vehicles/64b1f1f1f1f1f1f1f1f1f1f1/purchase",
            headers={"Authorization": f"Bearer {_user_token()}"},
        )
    assert resp.status_code == 200
    assert resp.json()["quantity"] == 4


@pytest.mark.asyncio
async def test_purchase_zero_stock_returns_409():
    zero_stock_doc = {**_VEHICLE_DOC, "quantity": 0}
    repo = _make_vehicle_repo(purchase_result=False, find_result=zero_stock_doc)
    async with _make_client(repo) as c:
        resp = await c.post(
            "/api/vehicles/64b1f1f1f1f1f1f1f1f1f1f1/purchase",
            headers={"Authorization": f"Bearer {_user_token()}"},
        )
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_purchase_quantity_never_negative():
    """Atomic update ensures quantity cannot go below zero."""
    # When stock is 0, purchase returns False (atomic condition quantity > 0 fails)
    zero_stock_doc = {**_VEHICLE_DOC, "quantity": 0}
    repo = _make_vehicle_repo(purchase_result=False, find_result=zero_stock_doc)
    async with _make_client(repo) as c:
        resp = await c.post(
            "/api/vehicles/64b1f1f1f1f1f1f1f1f1f1f1/purchase",
            headers={"Authorization": f"Bearer {_user_token()}"},
        )
    # Must be rejected — quantity must never go negative
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_purchase_concurrent_oversell_prevented():
    """
    Simulates concurrent purchases exhausting stock.
    The atomic MongoDB update (find where quantity > 0, then $inc: -1) ensures
    only one of two concurrent requests on a quantity=1 vehicle succeeds.
    The second call returns purchase_result=False → 409.
    """
    call_count = 0

    async def atomic_purchase(vehicle_id: str) -> bool:
        nonlocal call_count
        call_count += 1
        # First call succeeds (stock was 1), second fails (stock now 0)
        return call_count == 1

    repo = MagicMock()
    repo.purchase = AsyncMock(side_effect=atomic_purchase)
    repo.find_by_id = AsyncMock(return_value={**_VEHICLE_DOC, "quantity": 0})

    from app.main import app
    from app.api.dependencies import get_vehicle_repository

    app.dependency_overrides[get_vehicle_repository] = lambda: repo
    transport = httpx.ASGITransport(app=app)
    try:
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
            token = _user_token()
            r1 = await c.post(
                "/api/vehicles/64b1f1f1f1f1f1f1f1f1f1f1/purchase",
                headers={"Authorization": f"Bearer {token}"},
            )
            r2 = await c.post(
                "/api/vehicles/64b1f1f1f1f1f1f1f1f1f1f1/purchase",
                headers={"Authorization": f"Bearer {token}"},
            )
        assert r1.status_code == 200
        assert r2.status_code == 409
    finally:
        app.dependency_overrides.pop(get_vehicle_repository, None)


# ===========================================================================
# POST /api/vehicles/{id}/restock
# ===========================================================================


@pytest.mark.asyncio
async def test_restock_admin_succeeds():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.post(
            "/api/vehicles/64b1f1f1f1f1f1f1f1f1f1f1/restock",
            json={"quantity": 10},
            headers={"Authorization": f"Bearer {_admin_token()}"},
        )
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_restock_normal_user_returns_403():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.post(
            "/api/vehicles/64b1f1f1f1f1f1f1f1f1f1f1/restock",
            json={"quantity": 10},
            headers={"Authorization": f"Bearer {_user_token()}"},
        )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_restock_unauthenticated_returns_401():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.post(
            "/api/vehicles/64b1f1f1f1f1f1f1f1f1f1f1/restock",
            json={"quantity": 10},
        )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_restock_vehicle_not_found_returns_404():
    repo = _make_vehicle_repo(restock_result=False, find_result=None)
    async with _make_client(repo) as c:
        resp = await c.post(
            "/api/vehicles/64b1f1f1f1f1f1f1f1f1f1f1/restock",
            json={"quantity": 10},
            headers={"Authorization": f"Bearer {_admin_token()}"},
        )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_restock_zero_quantity_returns_422():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.post(
            "/api/vehicles/64b1f1f1f1f1f1f1f1f1f1f1/restock",
            json={"quantity": 0},
            headers={"Authorization": f"Bearer {_admin_token()}"},
        )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_restock_negative_quantity_returns_422():
    repo = _make_vehicle_repo()
    async with _make_client(repo) as c:
        resp = await c.post(
            "/api/vehicles/64b1f1f1f1f1f1f1f1f1f1f1/restock",
            json={"quantity": -5},
            headers={"Authorization": f"Bearer {_admin_token()}"},
        )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_restock_increases_quantity_correctly():
    restocked_doc = {**_VEHICLE_DOC, "quantity": 15}
    repo = _make_vehicle_repo(find_result=restocked_doc)
    async with _make_client(repo) as c:
        resp = await c.post(
            "/api/vehicles/64b1f1f1f1f1f1f1f1f1f1f1/restock",
            json={"quantity": 10},
            headers={"Authorization": f"Bearer {_admin_token()}"},
        )
    assert resp.status_code == 200
    assert resp.json()["quantity"] == 15
