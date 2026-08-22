from pymongo import AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase

from app.core.config import settings

_client: AsyncMongoClient | None = None


def get_client() -> AsyncMongoClient:
    global _client
    if _client is None:
        _client = AsyncMongoClient(settings.mongodb_url)
    return _client


def get_database() -> AsyncDatabase:
    return get_client()[settings.database_name]


async def close_client() -> None:
    global _client
    if _client is not None:
        await _client.close()
        _client = None
