import re

from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import UserRole


class AuthError(Exception):
    def __init__(self, message: str, status_code: int = 400) -> None:
        super().__init__(message)
        self.status_code = status_code


_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _validate_email(email: str) -> None:
    if not _EMAIL_RE.match(email):
        raise AuthError("invalid email")


def _validate_password(password: str) -> None:
    if len(password) < 8 or not re.search(r"[A-Z]", password) or not re.search(r"\d", password):
        raise AuthError("password must be ≥8 chars with an uppercase letter and a digit")


class AuthService:
    def __init__(self, repo) -> None:
        self._repo = repo

    async def register(self, username: str, email: str, password: str) -> dict:
        if not username.strip():
            raise AuthError("username is required")
        _validate_email(email)
        _validate_password(password)
        if await self._repo.find_by_email(email):
            raise AuthError("email already registered", status_code=409)

        doc = {
            "username": username.strip(),
            "email": email,
            "password_hash": hash_password(password),
            "role": UserRole.USER,
        }
        user_id = await self._repo.create(doc)
        return {"id": user_id, "username": doc["username"], "role": doc["role"]}

    async def login(self, email: str, password: str) -> dict:
        _validate_email(email)
        user = await self._repo.find_by_email(email)
        if not user or not verify_password(password, user["password_hash"]):
            raise AuthError("invalid credentials", status_code=401)

        role = user["role"].value if isinstance(user["role"], UserRole) else str(user["role"])
        token = create_access_token(sub=str(user["_id"]), role=role)
        return {"access_token": token, "token_type": "bearer"}
