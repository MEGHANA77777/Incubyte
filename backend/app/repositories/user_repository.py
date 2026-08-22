from pymongo.asynchronous.database import AsyncDatabase


class UserRepository:
    def __init__(self, db: AsyncDatabase) -> None:
        self._col = db["users"]

    async def find_by_email(self, email: str) -> dict | None:
        return await self._col.find_one({"email": email})

    async def create(self, doc: dict) -> str:
        result = await self._col.insert_one(doc)
        return str(result.inserted_id)
