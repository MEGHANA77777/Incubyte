"""Integration tests for POST /api/auth/register — TDD RED → GREEN."""

import pytest
from httpx import ASGITransport, AsyncClient
from unittest.mock import AsyncMock, MagicMock


@pytest.fixture
def mock_repo():
    repo = MagicMock()
    repo.find_by_email = AsyncMock(return_value=None)
    repo.create = AsyncMock(return_value="507f1f77bcf86cd799439011")
    return repo


@pytest.fixture
def client(mock_repo):
    from app.main import app
    from app.api.dependencies import get_user_repository

    app.dependency_overrides[get_user_repository] = lambda: mock_repo
    transport = ASGITransport(app=app)
    import httpx
    return httpx.AsyncClient(transport=transport, base_url="http://test")


@pytest.mark.asyncio
async def test_register_returns_201(client):
    async with client as c:
        resp = await c.post("/api/auth/register", json={
            "username": "Alice", "email": "alice@example.com", "password": "StrongPass1!",
        })
    assert resp.status_code == 201


@pytest.mark.asyncio
async def test_register_missing_name_returns_422(client):
    async with client as c:
        resp = await c.post("/api/auth/register", json={
            "username": "", "email": "alice@example.com", "password": "StrongPass1!",
        })
    assert resp.status_code in (400, 422)


@pytest.mark.asyncio
async def test_register_invalid_email_returns_422(client):
    async with client as c:
        resp = await c.post("/api/auth/register", json={
            "username": "Alice", "email": "not-an-email", "password": "StrongPass1!",
        })
    assert resp.status_code in (400, 422)


@pytest.mark.asyncio
async def test_register_weak_password_returns_400(client):
    async with client as c:
        resp = await c.post("/api/auth/register", json={
            "username": "Alice", "email": "alice@example.com", "password": "weak",
        })
    assert resp.status_code in (400, 422)


@pytest.mark.asyncio
async def test_register_duplicate_email_returns_409(client, mock_repo):
    mock_repo.find_by_email = AsyncMock(return_value={"email": "alice@example.com"})
    async with client as c:
        resp = await c.post("/api/auth/register", json={
            "username": "Alice", "email": "alice@example.com", "password": "StrongPass1!",
        })
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_register_password_hash_not_in_response(client):
    async with client as c:
        resp = await c.post("/api/auth/register", json={
            "username": "Alice", "email": "alice@example.com", "password": "StrongPass1!",
        })
    body = resp.json()
    assert "password_hash" not in body
    assert "password" not in body


@pytest.mark.asyncio
async def test_register_cannot_set_admin_role(client):
    async with client as c:
        resp = await c.post("/api/auth/register", json={
            "username": "Alice", "email": "alice@example.com",
            "password": "StrongPass1!", "role": "ADMIN",
        })
    if resp.status_code == 201:
        assert resp.json().get("role") != "ADMIN"


# ===========================================================================
# POST /api/auth/login
# ===========================================================================


def _stored_user():
    from app.core.security import hash_password
    from app.models.user import UserRole
    return {
        "_id": "507f1f77bcf86cd799439011",
        "username": "Alice",
        "email": "alice@example.com",
        "password_hash": hash_password("StrongPass1!"),
        "role": UserRole.USER,
    }


@pytest.fixture
def login_client(mock_repo):
    from app.main import app
    from app.api.dependencies import get_user_repository

    mock_repo.find_by_email = AsyncMock(return_value=_stored_user())
    app.dependency_overrides[get_user_repository] = lambda: mock_repo
    import httpx
    transport = ASGITransport(app=app)
    return httpx.AsyncClient(transport=transport, base_url="http://test")


@pytest.mark.asyncio
async def test_login_valid_returns_200(login_client):
    async with login_client as c:
        resp = await c.post("/api/auth/login", json={"email": "alice@example.com", "password": "StrongPass1!"})
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_login_invalid_email_returns_422(client):
    async with client as c:
        resp = await c.post("/api/auth/login", json={"email": "not-an-email", "password": "StrongPass1!"})
    assert resp.status_code in (400, 422)


@pytest.mark.asyncio
async def test_login_wrong_password_returns_401(login_client):
    async with login_client as c:
        resp = await c.post("/api/auth/login", json={"email": "alice@example.com", "password": "WrongPass1!"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_login_nonexistent_user_returns_401(client):
    async with client as c:
        resp = await c.post("/api/auth/login", json={"email": "ghost@example.com", "password": "StrongPass1!"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_login_returns_access_token(login_client):
    async with login_client as c:
        resp = await c.post("/api/auth/login", json={"email": "alice@example.com", "password": "StrongPass1!"})
    body = resp.json()
    assert "access_token" in body and body["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_jwt_contains_user_id(login_client):
    from app.core.security import decode_access_token
    async with login_client as c:
        resp = await c.post("/api/auth/login", json={"email": "alice@example.com", "password": "StrongPass1!"})
    assert decode_access_token(resp.json()["access_token"])["sub"] == "507f1f77bcf86cd799439011"


@pytest.mark.asyncio
async def test_login_jwt_contains_role(login_client):
    from app.core.security import decode_access_token
    async with login_client as c:
        resp = await c.post("/api/auth/login", json={"email": "alice@example.com", "password": "StrongPass1!"})
    assert "role" in decode_access_token(resp.json()["access_token"])


@pytest.mark.asyncio
async def test_login_jwt_has_expiration(login_client):
    from app.core.security import decode_access_token
    async with login_client as c:
        resp = await c.post("/api/auth/login", json={"email": "alice@example.com", "password": "StrongPass1!"})
    assert "exp" in decode_access_token(resp.json()["access_token"])


@pytest.mark.asyncio
async def test_login_password_not_in_response(login_client):
    async with login_client as c:
        resp = await c.post("/api/auth/login", json={"email": "alice@example.com", "password": "StrongPass1!"})
    body = resp.json()
    assert "password" not in body and "password_hash" not in body
