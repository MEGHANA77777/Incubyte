import re

from pydantic import BaseModel, EmailStr, field_validator


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

    @field_validator("username")
    @classmethod
    def username_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("username is required")
        return v.strip()

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8 or not re.search(r"[A-Z]", v) or not re.search(r"\d", v):
            raise ValueError("password must be ≥8 chars with an uppercase letter and a digit")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
