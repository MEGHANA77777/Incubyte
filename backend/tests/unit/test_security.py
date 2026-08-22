"""Unit tests for security utilities — written BEFORE implementation (TDD)."""

import time

import pytest

from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------


def test_hash_password_returns_string():
    assert isinstance(hash_password("secret"), str)


def test_hash_password_is_not_plaintext():
    assert hash_password("secret") != "secret"


def test_hash_password_produces_unique_hashes():
    # Argon2 salts each hash — same input must not produce same output
    assert hash_password("secret") != hash_password("secret")


# ---------------------------------------------------------------------------
# Password verification
# ---------------------------------------------------------------------------


def test_verify_password_correct():
    hashed = hash_password("correct")
    assert verify_password("correct", hashed) is True


def test_verify_password_wrong():
    hashed = hash_password("correct")
    assert verify_password("wrong", hashed) is False


# ---------------------------------------------------------------------------
# JWT creation
# ---------------------------------------------------------------------------


def test_create_access_token_returns_string():
    token = create_access_token(sub="user123", role="USER")
    assert isinstance(token, str)


def test_create_access_token_contains_expected_claims():
    token = create_access_token(sub="user123", role="ADMIN")
    payload = decode_access_token(token)
    assert payload["sub"] == "user123"
    assert payload["role"] == "ADMIN"
    assert "exp" in payload


def test_create_access_token_no_password_in_payload():
    token = create_access_token(sub="user123", role="USER")
    payload = decode_access_token(token)
    assert "password" not in payload
    assert "password_hash" not in payload


# ---------------------------------------------------------------------------
# JWT decoding & validation
# ---------------------------------------------------------------------------


def test_decode_valid_token():
    token = create_access_token(sub="abc", role="USER")
    payload = decode_access_token(token)
    assert payload["sub"] == "abc"


def test_decode_invalid_token_raises():
    from app.core.security import InvalidTokenError

    with pytest.raises(InvalidTokenError):
        decode_access_token("this.is.garbage")


def test_decode_expired_token_raises():
    from app.core.security import InvalidTokenError

    # Create a token that expires immediately (expires_delta = -1 second)
    token = create_access_token(sub="x", role="USER", expires_delta_seconds=-1)
    time.sleep(0.1)  # ensure expiry
    with pytest.raises(InvalidTokenError):
        decode_access_token(token)


# ---------------------------------------------------------------------------
# Role checking via dependencies
# ---------------------------------------------------------------------------


def test_require_admin_passes_for_admin(monkeypatch):
    """require_admin should return the user unchanged when role is ADMIN."""
    from app.api.dependencies import require_admin
    from app.models.user import UserRole
    from app.schemas.user import TokenData

    admin_user = TokenData(sub="admin1", role=UserRole.ADMIN)
    # require_admin is a plain function (not a FastAPI dependency here)
    result = require_admin(admin_user)
    assert result == admin_user


def test_require_admin_raises_for_user():
    """require_admin must raise 403 when role is USER."""
    from fastapi import HTTPException

    from app.api.dependencies import require_admin
    from app.models.user import UserRole
    from app.schemas.user import TokenData

    regular_user = TokenData(sub="user1", role=UserRole.USER)
    with pytest.raises(HTTPException) as exc_info:
        require_admin(regular_user)
    assert exc_info.value.status_code == 403
