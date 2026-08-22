from datetime import datetime

from pydantic import BaseModel, field_validator


class VehicleCreate(BaseModel):
    make: str
    model: str
    category: str
    price: float
    quantity: int = 0

    @field_validator("make", "model", "category")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("field is required")
        return v.strip()

    @field_validator("price")
    @classmethod
    def price_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("price must be > 0")
        return v

    @field_validator("quantity")
    @classmethod
    def quantity_non_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("quantity must be >= 0")
        return v


class VehicleUpdate(BaseModel):
    make: str | None = None
    model: str | None = None
    category: str | None = None
    price: float | None = None
    quantity: int | None = None

    @field_validator("make", "model", "category")
    @classmethod
    def not_empty(cls, v: str | None) -> str | None:
        if v is not None and not v.strip():
            raise ValueError("field cannot be empty")
        return v.strip() if v is not None else v

    @field_validator("price")
    @classmethod
    def price_positive(cls, v: float | None) -> float | None:
        if v is not None and v <= 0:
            raise ValueError("price must be > 0")
        return v

    @field_validator("quantity")
    @classmethod
    def quantity_non_negative(cls, v: int | None) -> int | None:
        if v is not None and v < 0:
            raise ValueError("quantity must be >= 0")
        return v


class VehicleResponse(BaseModel):
    id: str
    make: str
    model: str
    category: str
    price: float
    quantity: int
    created_at: datetime
    updated_at: datetime


class VehicleListResponse(BaseModel):
    items: list[VehicleResponse]
    total: int
    page: int
    limit: int


class RestockRequest(BaseModel):
    quantity: int

    @field_validator("quantity")
    @classmethod
    def quantity_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("quantity must be > 0")
        return v
