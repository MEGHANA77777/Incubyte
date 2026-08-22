from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.vehicles import router as vehicles_router
from app.core.config import settings
from app.core.database import close_client, get_client
from app.core.exceptions import validation_exception_handler


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    get_client()  # initialise on startup
    yield
    await close_client()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.add_exception_handler(
    RequestValidationError,
    validation_exception_handler,
)


app.include_router(auth_router)
app.include_router(vehicles_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "healthy"}
