from app.services.vehicle_service import _serialize


class InventoryError(Exception):
    def __init__(self, message: str, status_code: int = 400) -> None:
        super().__init__(message)
        self.status_code = status_code


class InventoryService:
    def __init__(self, repo) -> None:
        self._repo = repo

    async def purchase(self, vehicle_id: str) -> dict:
        """Attempt an atomic purchase (quantity - 1 where quantity > 0).

        If the atomic update finds no matching document, we distinguish
        'not found' from 'out of stock' by fetching the vehicle separately.
        """
        purchased = await self._repo.purchase(vehicle_id)
        if not purchased:
            vehicle = await self._repo.find_by_id(vehicle_id)
            if vehicle is None:
                raise InventoryError("vehicle not found", status_code=404)
            raise InventoryError("vehicle is out of stock", status_code=409)
        vehicle = await self._repo.find_by_id(vehicle_id)
        return _serialize(vehicle)

    async def restock(self, vehicle_id: str, quantity: int) -> dict:
        """Atomically increment vehicle quantity."""
        if quantity <= 0:
            raise InventoryError("quantity must be > 0", status_code=400)
        restocked = await self._repo.restock(vehicle_id, quantity)
        if not restocked:
            vehicle = await self._repo.find_by_id(vehicle_id)
            if vehicle is None:
                raise InventoryError("vehicle not found", status_code=404)
        vehicle = await self._repo.find_by_id(vehicle_id)
        return _serialize(vehicle)
