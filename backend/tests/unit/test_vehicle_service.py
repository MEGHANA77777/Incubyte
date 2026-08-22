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
