"""Unit tests for AuthService — registration (TDD RED → GREEN)."""

import pytest

from app.models.user import UserRole


def _make_service():
    from unittest.mock import AsyncMock, MagicMock
    from app.services.auth_service import AuthService

    repo = MagicMock()
    repo.find_by_email = AsyncMock(return_value=None)
    repo.create = AsyncMock(return_value="507f1f77bcf86cd799439011")
    return AuthService(repo), repo


# ===========================================================================
# REGISTRATION
# ===========================================================================


@pytest.mark.asyncio
async def test_register_success():
    svc, _ = _make_service()
    result = await svc.register("Alice", "alice@example.com", "StrongPass1!")
    assert result["id"] == "507f1f77bcf86cd799439011"
    assert result["username"] == "Alice"
    assert result["role"] == UserRole.USER


@pytest.mark.asyncio
async def test_register_missing_name_raises():
    from app.services.auth_service import AuthError
    svc, _ = _make_service()
    with pytest.raises(AuthError):
        await svc.register("", "alice@example.com", "StrongPass1!")


@pytest.mark.asyncio
async def test_register_invalid_email_raises():
    from app.services.auth_service import AuthError
    svc, _ = _make_service()
    with pytest.raises(AuthError):
        await svc.register("Alice", "not-an-email", "StrongPass1!")


@pytest.mark.asyncio
async def test_register_invalid_password_raises():
    from app.services.auth_service import AuthError
    svc, _ = _make_service()
    with pytest.raises(AuthError):
        await svc.register("Alice", "alice@example.com", "weak")


@pytest.mark.asyncio
async def test_register_duplicate_email_raises():
    from unittest.mock import AsyncMock, MagicMock
    from app.services.auth_service import AuthError, AuthService

    repo = MagicMock()
    repo.find_by_email = AsyncMock(return_value={"email": "alice@example.com"})
    svc = AuthService(repo)
    with pytest.raises(AuthError):
        await svc.register("Alice", "alice@example.com", "StrongPass1!")


@pytest.mark.asyncio
async def test_register_password_is_hashed():
    from unittest.mock import AsyncMock, MagicMock
    from app.core.security import verify_password
    from app.services.auth_service import AuthService

    captured = {}

    async def fake_create(doc):
        captured["doc"] = doc
        return "abc123"

    repo = MagicMock()
    repo.find_by_email = AsyncMock(return_value=None)
    repo.create = fake_create
    svc = AuthService(repo)
    await svc.register("Alice", "alice@example.com", "StrongPass1!")
    assert verify_password("StrongPass1!", captured["doc"]["password_hash"])


@pytest.mark.asyncio
async def test_register_password_hash_not_returned():
    svc, _ = _make_service()
    result = await svc.register("Alice", "alice@example.com", "StrongPass1!")
    assert "password_hash" not in result
    assert "password" not in result


@pytest.mark.asyncio
async def test_register_assigns_user_role():
    svc, _ = _make_service()
    result = await svc.register("Alice", "alice@example.com", "StrongPass1!")
    assert result["role"] == UserRole.USER


@pytest.mark.asyncio
async def test_register_cannot_set_admin_role():
    from unittest.mock import AsyncMock, MagicMock
    from app.services.auth_service import AuthService

    captured = {}

    async def fake_create(doc):
        captured["doc"] = doc
        return "abc123"

    repo = MagicMock()
    repo.find_by_email = AsyncMock(return_value=None)
    repo.create = fake_create
    svc = AuthService(repo)
    await svc.register("Alice", "alice@example.com", "StrongPass1!")
    assert captured["doc"]["role"] == UserRole.USER


# ===========================================================================
# LOGIN
# ===========================================================================


def _stored_user():
    from app.core.security import hash_password
    return {
        "_id": "507f1f77bcf86cd799439011",
        "username": "Alice",
        "email": "alice@example.com",
        "password_hash": hash_password("StrongPass1!"),
        "role": UserRole.USER,
    }


@pytest.mark.asyncio
async def test_login_valid_credentials():
    from unittest.mock import AsyncMock, MagicMock
    from app.services.auth_service import AuthService

    repo = MagicMock()
    repo.find_by_email = AsyncMock(return_value=_stored_user())
    svc = AuthService(repo)
    result = await svc.login("alice@example.com", "StrongPass1!")
    assert "access_token" in result
    assert result["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_invalid_email_raises():
    from app.services.auth_service import AuthError
    svc, _ = _make_service()
    with pytest.raises(AuthError):
        await svc.login("not-an-email", "StrongPass1!")


@pytest.mark.asyncio
async def test_login_wrong_password_raises():
    from unittest.mock import AsyncMock, MagicMock
    from app.services.auth_service import AuthError, AuthService

    repo = MagicMock()
    repo.find_by_email = AsyncMock(return_value=_stored_user())
    svc = AuthService(repo)
    with pytest.raises(AuthError):
        await svc.login("alice@example.com", "WrongPass1!")


@pytest.mark.asyncio
async def test_login_nonexistent_user_raises():
    from app.services.auth_service import AuthError
    svc, _ = _make_service()  # repo returns None
    with pytest.raises(AuthError):
        await svc.login("ghost@example.com", "StrongPass1!")


@pytest.mark.asyncio
async def test_login_jwt_generated():
    from unittest.mock import AsyncMock, MagicMock
    from app.services.auth_service import AuthService

    repo = MagicMock()
    repo.find_by_email = AsyncMock(return_value=_stored_user())
    svc = AuthService(repo)
    result = await svc.login("alice@example.com", "StrongPass1!")
    assert isinstance(result["access_token"], str) and len(result["access_token"]) > 20


@pytest.mark.asyncio
async def test_login_jwt_contains_user_id():
    from unittest.mock import AsyncMock, MagicMock
    from app.core.security import decode_access_token
    from app.services.auth_service import AuthService

    repo = MagicMock()
    repo.find_by_email = AsyncMock(return_value=_stored_user())
    svc = AuthService(repo)
    result = await svc.login("alice@example.com", "StrongPass1!")
    payload = decode_access_token(result["access_token"])
    assert payload["sub"] == "507f1f77bcf86cd799439011"


@pytest.mark.asyncio
async def test_login_jwt_contains_role():
    from unittest.mock import AsyncMock, MagicMock
    from app.core.security import decode_access_token
    from app.services.auth_service import AuthService

    repo = MagicMock()
    repo.find_by_email = AsyncMock(return_value=_stored_user())
    svc = AuthService(repo)
    result = await svc.login("alice@example.com", "StrongPass1!")
    payload = decode_access_token(result["access_token"])
    assert payload["role"] == UserRole.USER


@pytest.mark.asyncio
async def test_login_jwt_has_expiration():
    from unittest.mock import AsyncMock, MagicMock
    from app.core.security import decode_access_token
    from app.services.auth_service import AuthService

    repo = MagicMock()
    repo.find_by_email = AsyncMock(return_value=_stored_user())
    svc = AuthService(repo)
    result = await svc.login("alice@example.com", "StrongPass1!")
    payload = decode_access_token(result["access_token"])
    assert "exp" in payload


@pytest.mark.asyncio
async def test_login_password_not_returned():
    from unittest.mock import AsyncMock, MagicMock
    from app.services.auth_service import AuthService

    repo = MagicMock()
    repo.find_by_email = AsyncMock(return_value=_stored_user())
    svc = AuthService(repo)
    result = await svc.login("alice@example.com", "StrongPass1!")
    assert "password" not in result and "password_hash" not in result
