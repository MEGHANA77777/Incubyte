from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies import get_inventory_service, get_vehicle_service, require_admin, get_current_user
from app.schemas.vehicle import RestockRequest, VehicleCreate, VehicleListResponse, VehicleResponse, VehicleUpdate
from app.services.inventory_service import InventoryError, InventoryService
from app.services.vehicle_service import VehicleError, VehicleService

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])


@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
async def create_vehicle(
    body: VehicleCreate,
    svc: VehicleService = Depends(get_vehicle_service),
    _: object = Depends(require_admin),
):
    return await svc.create(body.make, body.model, body.category, body.price, body.quantity)


@router.get("", response_model=VehicleListResponse)
async def list_vehicles(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    svc: VehicleService = Depends(get_vehicle_service),
):
    try:
        return await svc.list_vehicles(page, limit)
    except VehicleError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))


@router.get("/search", response_model=list[VehicleResponse])
async def search_vehicles(
    make: str | None = Query(default=None),
    model: str | None = Query(default=None),
    category: str | None = Query(default=None),
    min_price: float | None = Query(default=None),
    max_price: float | None = Query(default=None),
    svc: VehicleService = Depends(get_vehicle_service),
):
    try:
        return await svc.search(make, model, category, min_price, max_price)
    except VehicleError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))


@router.put("/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(
    vehicle_id: str,
    body: VehicleUpdate,
    svc: VehicleService = Depends(get_vehicle_service),
    _: object = Depends(require_admin),
):
    try:
        updates = body.model_dump(exclude_none=True)
        return await svc.update(vehicle_id, updates)
    except VehicleError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))

@router.delete(
    "/{vehicle_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_vehicle(
    vehicle_id: str,
    svc: VehicleService = Depends(get_vehicle_service),
    _: object = Depends(require_admin),
):
    try:
        await svc.delete(vehicle_id)
    except VehicleError as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=str(e),
        ) from e


@router.post("/{vehicle_id}/purchase", response_model=VehicleResponse)
async def purchase_vehicle(
    vehicle_id: str,
    svc: InventoryService = Depends(get_inventory_service),
    _: object = Depends(get_current_user),
):
    try:
        return await svc.purchase(vehicle_id)
    except InventoryError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))


@router.post("/{vehicle_id}/restock", response_model=VehicleResponse)
async def restock_vehicle(
    vehicle_id: str,
    body: RestockRequest,
    svc: InventoryService = Depends(get_inventory_service),
    _: object = Depends(require_admin),
):
    try:
        return await svc.restock(vehicle_id, body.quantity)
    except InventoryError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))
