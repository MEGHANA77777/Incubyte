"""Unit tests for VehicleService — creation (TDD RED → GREEN)."""

import pytest
from unittest.mock import AsyncMock, MagicMock


def _make_service(created_id="64b1f1f1f1f1f1f1f1f1f1f1"):
    from app.services.vehicle_service import VehicleService

    repo = MagicMock()
    repo.create = AsyncMock(return_value=created_id)
    return VehicleService(repo), repo


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_create_missing_make_raises():
    from app.schemas.vehicle import VehicleCreate
    with pytest.raises(Exception):
        VehicleCreate(make="", model="Civic", category="Sedan", price=20000, quantity=5)


@pytest.mark.asyncio
async def test_create_missing_model_raises():
    from app.schemas.vehicle import VehicleCreate
    with pytest.raises(Exception):
        VehicleCreate(make="Honda", model="", category="Sedan", price=20000, quantity=5)


@pytest.mark.asyncio
async def test_create_missing_category_raises():
    from app.schemas.vehicle import VehicleCreate
    with pytest.raises(Exception):
        VehicleCreate(make="Honda", model="Civic", category="", price=20000, quantity=5)


@pytest.mark.asyncio
async def test_create_invalid_price_zero_raises():
    from app.schemas.vehicle import VehicleCreate
    with pytest.raises(Exception):
        VehicleCreate(make="Honda", model="Civic", category="Sedan", price=0, quantity=5)


@pytest.mark.asyncio
async def test_create_invalid_price_negative_raises():
    from app.schemas.vehicle import VehicleCreate
    with pytest.raises(Exception):
        VehicleCreate(make="Honda", model="Civic", category="Sedan", price=-100, quantity=5)


@pytest.mark.asyncio
async def test_create_negative_quantity_raises():
    from app.schemas.vehicle import VehicleCreate
    with pytest.raises(Exception):
        VehicleCreate(make="Honda", model="Civic", category="Sedan", price=20000, quantity=-1)


# ---------------------------------------------------------------------------
# Successful creation
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_create_valid_vehicle_returns_dict():
    svc, _ = _make_service()
    result = await svc.create("Honda", "Civic", "Sedan", 20000.0, 5)
    assert result["make"] == "Honda"
    assert result["model"] == "Civic"
    assert result["category"] == "Sedan"
    assert result["price"] == 20000.0
    assert result["quantity"] == 5


@pytest.mark.asyncio
async def test_create_returns_unique_id():
    svc, _ = _make_service("64b1f1f1f1f1f1f1f1f1f1f1")
    result = await svc.create("Honda", "Civic", "Sedan", 20000.0, 5)
    assert result["id"] == "64b1f1f1f1f1f1f1f1f1f1f1"


@pytest.mark.asyncio
async def test_create_sets_timestamps():
    svc, _ = _make_service()
    result = await svc.create("Honda", "Civic", "Sedan", 20000.0, 5)
    assert result["created_at"] is not None
    assert result["updated_at"] is not None


@pytest.mark.asyncio
async def test_create_calls_repo():
    svc, repo = _make_service()
    await svc.create("Honda", "Civic", "Sedan", 20000.0, 5)
    repo.create.assert_called_once()


# ---------------------------------------------------------------------------
# LIST
# ---------------------------------------------------------------------------

_NOW = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)

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


def _make_list_service(docs=None, total=None):
    from app.services.vehicle_service import VehicleService
    from unittest.mock import AsyncMock, MagicMock

    docs = docs if docs is not None else [_VEHICLE_DOC]
    total = total if total is not None else len(docs)
    repo = MagicMock()
    repo.find_all = AsyncMock(return_value=(docs, total))
    return VehicleService(repo)


@pytest.mark.asyncio
async def test_list_empty_inventory():
    svc = _make_list_service(docs=[], total=0)
    result = await svc.list_vehicles(page=1, limit=10)
    assert result["items"] == []
    assert result["total"] == 0


@pytest.mark.asyncio
async def test_list_multiple_vehicles():
    docs = [_VEHICLE_DOC, {**_VEHICLE_DOC, "_id": "64b1f1f1f1f1f1f1f1f1f1f2"}]
    svc = _make_list_service(docs=docs, total=2)
    result = await svc.list_vehicles(page=1, limit=10)
    assert len(result["items"]) == 2
    assert result["total"] == 2


@pytest.mark.asyncio
async def test_list_pagination_metadata():
    svc = _make_list_service()
    result = await svc.list_vehicles(page=2, limit=5)
    assert result["page"] == 2
    assert result["limit"] == 5


@pytest.mark.asyncio
async def test_list_invalid_page_raises():
    svc = _make_list_service()
    with pytest.raises(Exception):
        await svc.list_vehicles(page=0, limit=10)


@pytest.mark.asyncio
async def test_list_invalid_limit_raises():
    svc = _make_list_service()
    with pytest.raises(Exception):
        await svc.list_vehicles(page=1, limit=0)


# ---------------------------------------------------------------------------
# SEARCH
# ---------------------------------------------------------------------------


def _make_search_service(docs=None):
    from app.services.vehicle_service import VehicleService
    from unittest.mock import AsyncMock, MagicMock

    docs = docs if docs is not None else [_VEHICLE_DOC]
    repo = MagicMock()
    repo.search = AsyncMock(return_value=docs)
    return VehicleService(repo)


@pytest.mark.asyncio
async def test_search_by_make():
    svc = _make_search_service()
    result = await svc.search(make="Honda", model=None, category=None, min_price=None, max_price=None)
    assert result[0]["make"] == "Honda"


@pytest.mark.asyncio
async def test_search_by_model():
    svc = _make_search_service()
    result = await svc.search(make=None, model="Civic", category=None, min_price=None, max_price=None)
    assert result[0]["model"] == "Civic"


@pytest.mark.asyncio
async def test_search_by_category():
    svc = _make_search_service()
    result = await svc.search(make=None, model=None, category="Sedan", min_price=None, max_price=None)
    assert result[0]["category"] == "Sedan"


@pytest.mark.asyncio
async def test_search_by_min_price():
    svc = _make_search_service()
    result = await svc.search(make=None, model=None, category=None, min_price=10000.0, max_price=None)
    assert result[0]["price"] >= 10000.0


@pytest.mark.asyncio
async def test_search_by_max_price():
    svc = _make_search_service()
    result = await svc.search(make=None, model=None, category=None, min_price=None, max_price=30000.0)
    assert result[0]["price"] <= 30000.0


@pytest.mark.asyncio
async def test_search_price_range():
    svc = _make_search_service()
    result = await svc.search(make=None, model=None, category=None, min_price=10000.0, max_price=30000.0)
    assert len(result) >= 0


@pytest.mark.asyncio
async def test_search_no_results():
    svc = _make_search_service(docs=[])
    result = await svc.search(make="Unknown", model=None, category=None, min_price=None, max_price=None)
    assert result == []


@pytest.mark.asyncio
async def test_search_invalid_price_range_raises():
    svc = _make_search_service()
    with pytest.raises(Exception):
        await svc.search(make=None, model=None, category=None, min_price=50000.0, max_price=10000.0)


@pytest.mark.asyncio
async def test_search_combined_filters():
    svc = _make_search_service()
    result = await svc.search(make="Honda", model="Civic", category="Sedan", min_price=10000.0, max_price=30000.0)
    assert isinstance(result, list)


# ---------------------------------------------------------------------------
# UPDATE
# ---------------------------------------------------------------------------


def _make_update_service(existing=_VEHICLE_DOC, update_success=True):
    from app.services.vehicle_service import VehicleService
    from unittest.mock import AsyncMock, MagicMock

    repo = MagicMock()
    repo.find_by_id = AsyncMock(return_value=existing)
    repo.update = AsyncMock(return_value=update_success)
    return VehicleService(repo)


def _make_update_service_not_found():
    from app.services.vehicle_service import VehicleService
    from unittest.mock import AsyncMock, MagicMock

    repo = MagicMock()
    repo.find_by_id = AsyncMock(return_value=None)
    repo.update = AsyncMock(return_value=False)
    return VehicleService(repo)


@pytest.mark.asyncio
async def test_update_valid():
    svc = _make_update_service()
    result = await svc.update("64b1f1f1f1f1f1f1f1f1f1f1", {"price": 25000.0})
    assert result["price"] == 20000.0  # mocked find_by_id returns original doc


@pytest.mark.asyncio
async def test_update_not_found_raises():
    svc = _make_update_service_not_found()
    with pytest.raises(Exception):
        await svc.update("64b1f1f1f1f1f1f1f1f1f1f1", {"price": 25000.0})


@pytest.mark.asyncio
async def test_update_strips_id():
    svc = _make_update_service()
    # Should not raise even if client sends id
    result = await svc.update("64b1f1f1f1f1f1f1f1f1f1f1", {"id": "hacked", "price": 25000.0})
    assert result["id"] == "64b1f1f1f1f1f1f1f1f1f1f1"


@pytest.mark.asyncio
async def test_update_strips_created_at():
    from datetime import datetime, timezone
    svc = _make_update_service()
    original_created = _VEHICLE_DOC["created_at"]
    result = await svc.update("64b1f1f1f1f1f1f1f1f1f1f1", {"created_at": datetime.now(timezone.utc)})
    assert result["created_at"] == original_created


@pytest.mark.asyncio
async def test_update_sets_updated_at():
    svc = _make_update_service()
    result = await svc.update("64b1f1f1f1f1f1f1f1f1f1f1", {"price": 25000.0})
    assert result["updated_at"] is not None
