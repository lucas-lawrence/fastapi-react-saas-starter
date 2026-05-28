from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.security import create_access_token, generate_refresh_token, hash_password, verify_password
from app.database import get_db
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.user import RefreshRequest, TokenPair, UserCreate, UserRead

router = APIRouter(prefix="/auth", tags=["auth"])


def _build_refresh_token(user_id: int) -> RefreshToken:
    return RefreshToken(
        token=generate_refresh_token(),
        user_id=user_id,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(body: UserCreate, db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(select(User).where(User.email == body.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=body.email, hashed_password=hash_password(body.password))
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=TokenPair)
async def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(User).where(User.email == form.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    refresh_token = _build_refresh_token(user.id)
    db.add(refresh_token)
    await db.commit()

    return TokenPair(
        access_token=create_access_token(user.email),
        refresh_token=refresh_token.token,
    )


@router.post("/refresh", response_model=TokenPair)
async def refresh(body: RefreshRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(select(RefreshToken).where(RefreshToken.token == body.refresh_token))
    db_token = result.scalar_one_or_none()

    if not db_token or db_token.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user_result = await db.execute(select(User).where(User.id == db_token.user_id))
    user = user_result.scalar_one_or_none()

    # rotate: delete old token, issue new one
    await db.delete(db_token)
    new_refresh_token = _build_refresh_token(user.id)
    db.add(new_refresh_token)
    await db.commit()

    return TokenPair(
        access_token=create_access_token(user.email),
        refresh_token=new_refresh_token.token,
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(body: RefreshRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(select(RefreshToken).where(RefreshToken.token == body.refresh_token))
    db_token = result.scalar_one_or_none()
    if db_token:
        await db.delete(db_token)
        await db.commit()
