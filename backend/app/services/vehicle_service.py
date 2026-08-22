from datetime import datetime, timezone


class VehicleError(Exception):
    def __init__(self, message: str, status_code: int = 400) -> None:
        super().__init__(message)
        self.status_code = status_code


def _serialize(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "make": doc["make"],
        "model": doc["model"],
        "category": doc["category"],
        "price": doc["price"],
        "quantity": doc["quantity"],
        "created_at": doc["created_at"],
        "updated_at": doc["updated_at"],
    }


class VehicleService:
    def __init__(self, repo) -> None:
        self._repo = repo

    async def create(self, make: str, model: str, category: str, price: float, quantity: int) -> dict:
        now = datetime.now(timezone.utc)
        doc = {
            "make": make,
            "model": model,
            "category": category,
            "price": price,
            "quantity": quantity,
            "created_at": now,
            "updated_at": now,
        }
        vehicle_id = await self._repo.create(doc)
        doc["_id"] = vehicle_id
        return _serialize(doc)

    async def list_vehicles(self, page: int, limit: int) -> dict:
        if page < 1:
            raise VehicleError("page must be >= 1")
        if limit < 1 or limit > 100:
            raise VehicleError("limit must be between 1 and 100")
        skip = (page - 1) * limit
        items, total = await self._repo.find_all(skip, limit)
        return {
            "items": [_serialize(v) for v in items],
            "total": total,
            "page": page,
            "limit": limit,
        }

    async def search(
        self,
        make: str | None,
        model: str | None,
        category: str | None,
        min_price: float | None,
        max_price: float | None,
    ) -> list[dict]:
        if min_price is not None and max_price is not None and min_price > max_price:
            raise VehicleError("min_price cannot exceed max_price")
        filters = {
            "make": make,
            "model": model,
            "category": category,
            "min_price": min_price,
            "max_price": max_price,
        }
        items = await self._repo.search(filters)
        return [_serialize(v) for v in items]
    
    async def delete(self, vehicle_id: str) -> bool:
        deleted = await self._repo.delete(vehicle_id)

        if not deleted:
            raise VehicleError("Vehicle not found", 404)

        return True

    async def update(self, vehicle_id: str, updates: dict) -> dict:
        # Disallow immutable fields
        updates.pop("id", None)
        updates.pop("created_at", None)

        existing = await self._repo.find_by_id(vehicle_id)
        if existing is None:
            raise VehicleError("vehicle not found", status_code=404)

        updates["updated_at"] = datetime.now(timezone.utc)
        await self._repo.update(vehicle_id, updates)

        updated = await self._repo.find_by_id(vehicle_id)
        return _serialize(updated)
