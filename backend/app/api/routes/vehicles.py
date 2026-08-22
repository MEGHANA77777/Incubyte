from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies import get_vehicle_service, require_admin
from app.schemas.vehicle import VehicleCreate, VehicleListResponse, VehicleResponse, VehicleUpdate
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
