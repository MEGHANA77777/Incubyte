from bson import ObjectId
from pymongo.asynchronous.database import AsyncDatabase


class VehicleRepository:
    def __init__(self, db: AsyncDatabase) -> None:
        self._col = db["vehicles"]

    async def create(self, doc: dict) -> str:
        result = await self._col.insert_one(doc)
        return str(result.inserted_id)

    async def find_all(self, skip: int, limit: int) -> tuple[list[dict], int]:
        total = await self._col.count_documents({})
        cursor = self._col.find({}).skip(skip).limit(limit)
        items = await cursor.to_list(length=limit)
        return items, total

    async def search(self, filters: dict) -> list[dict]:
        query: dict = {}
        if filters.get("make"):
            query["make"] = {"$regex": filters["make"], "$options": "i"}
        if filters.get("model"):
            query["model"] = {"$regex": filters["model"], "$options": "i"}
        if filters.get("category"):
            query["category"] = {"$regex": filters["category"], "$options": "i"}

        price_filter: dict = {}
        if filters.get("min_price") is not None:
            price_filter["$gte"] = filters["min_price"]
        if filters.get("max_price") is not None:
            price_filter["$lte"] = filters["max_price"]
        if price_filter:
            query["price"] = price_filter

        cursor = self._col.find(query)
        return await cursor.to_list(length=None)

    async def find_by_id(self, vehicle_id: str) -> dict | None:
        try:
            oid = ObjectId(vehicle_id)
        except Exception:
            return None
        return await self._col.find_one({"_id": oid})

    async def update(self, vehicle_id: str, updates: dict) -> bool:
        try:
            oid = ObjectId(vehicle_id)
        except Exception:
            return False
        result = await self._col.update_one({"_id": oid}, {"$set": updates})
        return result.matched_count > 0
