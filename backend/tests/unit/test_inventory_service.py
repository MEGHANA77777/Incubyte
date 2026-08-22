"""Unit tests for InventoryService — purchase and restock (TDD RED → GREEN)."""

import pytest
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


def _make_service(purchase_result=True, restock_result=True, find_result=_VEHICLE_DOC):
    from app.services.inventory_service import InventoryService

    repo = MagicMock()
    repo.purchase = AsyncMock(return_value=purchase_result)
    repo.restock = AsyncMock(return_value=restock_result)
    repo.find_by_id = AsyncMock(return_value=find_result)
    return InventoryService(repo), repo


# ===========================================================================
# PURCHASE
# ===========================================================================


@pytest.mark.asyncio
async def test_purchase_success_returns_vehicle():
    svc, _ = _make_service()
    result = await svc.purchase("64b1f1f1f1f1f1f1f1f1f1f1")
    assert result["id"] == "64b1f1f1f1f1f1f1f1f1f1f1"


@pytest.mark.asyncio
async def test_purchase_calls_repo_purchase():
    svc, repo = _make_service()
    await svc.purchase("64b1f1f1f1f1f1f1f1f1f1f1")
    repo.purchase.assert_called_once_with("64b1f1f1f1f1f1f1f1f1f1f1")


@pytest.mark.asyncio
async def test_purchase_vehicle_not_found_raises_404():
    from app.services.inventory_service import InventoryError

    # purchase returns False (no document matched — either not found or out of stock)
    # find_by_id returns None → not found
    svc, _ = _make_service(purchase_result=False, find_result=None)
    with pytest.raises(InventoryError) as exc_info:
        await svc.purchase("64b1f1f1f1f1f1f1f1f1f1f1")
    assert exc_info.value.status_code == 404


@pytest.mark.asyncio
async def test_purchase_out_of_stock_raises_409():
    from app.services.inventory_service import InventoryError

    # purchase returns False, but vehicle exists → out of stock
    out_of_stock_doc = {**_VEHICLE_DOC, "quantity": 0}
    svc, _ = _make_service(purchase_result=False, find_result=out_of_stock_doc)
    with pytest.raises(InventoryError) as exc_info:
        await svc.purchase("64b1f1f1f1f1f1f1f1f1f1f1")
    assert exc_info.value.status_code == 409


@pytest.mark.asyncio
async def test_purchase_when_stock_available_succeeds():
    svc, _ = _make_service(purchase_result=True)
    result = await svc.purchase("64b1f1f1f1f1f1f1f1f1f1f1")
    assert result is not None


@pytest.mark.asyncio
async def test_purchase_zero_quantity_raises_409():
    from app.services.inventory_service import InventoryError

    zero_stock = {**_VEHICLE_DOC, "quantity": 0}
    svc, _ = _make_service(purchase_result=False, find_result=zero_stock)
    with pytest.raises(InventoryError) as exc_info:
        await svc.purchase("64b1f1f1f1f1f1f1f1f1f1f1")
    assert exc_info.value.status_code == 409


# ===========================================================================
# RESTOCK
# ===========================================================================


@pytest.mark.asyncio
async def test_restock_success_returns_vehicle():
    svc, _ = _make_service()
    result = await svc.restock("64b1f1f1f1f1f1f1f1f1f1f1", 10)
    assert result["id"] == "64b1f1f1f1f1f1f1f1f1f1f1"


@pytest.mark.asyncio
async def test_restock_calls_repo_restock():
    svc, repo = _make_service()
    await svc.restock("64b1f1f1f1f1f1f1f1f1f1f1", 10)
    repo.restock.assert_called_once_with("64b1f1f1f1f1f1f1f1f1f1f1", 10)


@pytest.mark.asyncio
async def test_restock_vehicle_not_found_raises_404():
    from app.services.inventory_service import InventoryError

    svc, _ = _make_service(restock_result=False, find_result=None)
    with pytest.raises(InventoryError) as exc_info:
        await svc.restock("64b1f1f1f1f1f1f1f1f1f1f1", 10)
    assert exc_info.value.status_code == 404


@pytest.mark.asyncio
async def test_restock_zero_quantity_raises_400():
    from app.services.inventory_service import InventoryError

    svc, _ = _make_service()
    with pytest.raises(InventoryError) as exc_info:
        await svc.restock("64b1f1f1f1f1f1f1f1f1f1f1", 0)
    assert exc_info.value.status_code == 400


@pytest.mark.asyncio
async def test_restock_negative_quantity_raises_400():
    from app.services.inventory_service import InventoryError

    svc, _ = _make_service()
    with pytest.raises(InventoryError) as exc_info:
        await svc.restock("64b1f1f1f1f1f1f1f1f1f1f1", -5)
    assert exc_info.value.status_code == 400


@pytest.mark.asyncio
async def test_restock_increases_quantity():
    restocked_doc = {**_VEHICLE_DOC, "quantity": 15}
    svc, repo = _make_service()
    # After restock, find_by_id returns updated doc
    repo.find_by_id = AsyncMock(return_value=restocked_doc)
    result = await svc.restock("64b1f1f1f1f1f1f1f1f1f1f1", 10)
    assert result["quantity"] == 15
