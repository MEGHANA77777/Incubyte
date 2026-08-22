from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher

from app.core.config import settings

_pwd = PasswordHash([Argon2Hasher()])


class InvalidTokenError(Exception):
    """Raised when a JWT is missing, invalid, or expired."""


def hash_password(plain: str) -> str:
    return _pwd.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return _pwd.verify(plain, hashed)


def create_access_token(
    sub: str,
    role: str,
    expires_delta_seconds: int | None = None,
) -> str:
    expire_seconds = (
        expires_delta_seconds
        if expires_delta_seconds is not None
        else settings.access_token_expire_minutes * 60
    )
    payload = {
        "sub": sub,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(seconds=expire_seconds),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
    except jwt.PyJWTError as exc:
        raise InvalidTokenError(str(exc)) from exc
