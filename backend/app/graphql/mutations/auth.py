from datetime import datetime, timedelta, timezone

import strawberry
from sqlalchemy import select
from strawberry.types import Info

from app.config import settings
from app.core.security import create_access_token, generate_refresh_token, hash_password, verify_password
from app.graphql.types import TokenPair, UserType
from app.models.refresh_token import RefreshToken
from app.models.user import User


@strawberry.type
class AuthMutation:
    @strawberry.mutation(description="Create a new user account. Returns the created user.")
    async def register(self, email: str, password: str, info: Info) -> UserType:
        db = info.context["db"]
        result = await db.execute(select(User).where(User.email == email))
        if result.scalar_one_or_none():
            raise ValueError("Email already registered")
        user = User(email=email, hashed_password=hash_password(password))
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return UserType(id=str(user.id), email=user.email, is_active=user.is_active)

    @strawberry.mutation(description="Sign in with email and password. Returns an access token and a refresh token.")
    async def login(self, email: str, password: str, info: Info) -> TokenPair:
        db = info.context["db"]
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user or not verify_password(password, user.hashed_password):
            raise ValueError("Invalid credentials")

        refresh_token = RefreshToken(
            token=generate_refresh_token(),
            user_id=user.id,
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )
        db.add(refresh_token)
        await db.commit()

        return TokenPair(
            access_token=create_access_token(user.email),
            refresh_token=refresh_token.token,
        )

    @strawberry.mutation(description="Exchange a valid refresh token for a new token pair. The old refresh token is invalidated immediately (rotation).")
    async def refresh(self, refresh_token: str, info: Info) -> TokenPair:
        db = info.context["db"]
        result = await db.execute(select(RefreshToken).where(RefreshToken.token == refresh_token))
        db_token = result.scalar_one_or_none()

        if not db_token or db_token.expires_at < datetime.now(timezone.utc):
            raise ValueError("Invalid or expired refresh token")

        user_result = await db.execute(select(User).where(User.id == db_token.user_id))
        user = user_result.scalar_one_or_none()

        await db.delete(db_token)
        new_token = RefreshToken(
            token=generate_refresh_token(),
            user_id=user.id,
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )
        db.add(new_token)
        await db.commit()

        return TokenPair(
            access_token=create_access_token(user.email),
            refresh_token=new_token.token,
        )

    @strawberry.mutation(description="Invalidate the given refresh token, signing the user out. Safe to call even if the token is already expired.")
    async def logout(self, refresh_token: str, info: Info) -> bool:
        db = info.context["db"]
        result = await db.execute(select(RefreshToken).where(RefreshToken.token == refresh_token))
        db_token = result.scalar_one_or_none()
        if db_token:
            await db.delete(db_token)
            await db.commit()
        return True
