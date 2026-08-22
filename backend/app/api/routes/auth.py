from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_auth_service
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserResponse
from app.services.auth_service import AuthError, AuthService

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, svc: AuthService = Depends(get_auth_service)):
    try:
        return await svc.register(body.username, body.email, body.password)
    except AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, svc: AuthService = Depends(get_auth_service)):
    try:
        return await svc.login(body.email, body.password)
    except AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))
