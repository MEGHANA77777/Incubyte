from pydantic import BaseModel

from app.models.user import UserRole


class TokenData(BaseModel):
    """Decoded JWT payload — safe to pass around; never contains password_hash."""

    sub: str
    role: UserRole


class UserResponse(BaseModel):
    """Public user representation returned by API responses."""

    id: str
    username: str
    role: UserRole

    # password_hash is intentionally absent — it must never appear in responses
