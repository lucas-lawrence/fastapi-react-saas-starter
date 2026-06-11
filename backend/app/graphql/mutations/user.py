from datetime import datetime, timezone

import strawberry
from email_validator import EmailNotValidError, validate_email
from jose import JWTError
from sqlalchemy import delete, select
from strawberry.types import Info

from app.core.security import decode_access_token, hash_password, verify_password
from app.graphql.types import UserType
from app.models.refresh_token import RefreshToken
from app.models.user import User


async def get_current_user(info: Info) -> User:
    request = info.context["request"]
    db = info.context["db"]

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise ValueError("Authentication required")

    try:
        email = decode_access_token(auth_header[7:])
    except JWTError:
        raise ValueError("Invalid or expired token")

    result = await db.execute(select(User).where(User.email == email, User.deleted_at.is_(None)))
    user = result.scalar_one_or_none()
    if not user:
        raise ValueError("User not found")

    return user


@strawberry.type
class UserMutation:
    @strawberry.mutation(
        description=(
            "Update the authenticated user's profile. "
            "Only provided fields are changed. "
            "To change password, both `currentPassword` and `newPassword` must be supplied."
        )
    )
    async def update_user(
        self,
        info: Info,
        first_name: str | None = strawberry.UNSET,
        last_name: str | None = strawberry.UNSET,
        email: str | None = strawberry.UNSET,
        country: str | None = strawberry.UNSET,
        current_password: str | None = None,
        new_password: str | None = None,
    ) -> UserType:
        db = info.context["db"]
        user = await get_current_user(info)

        if first_name is not strawberry.UNSET:
            user.first_name = first_name

        if last_name is not strawberry.UNSET:
            user.last_name = last_name

        if country is not strawberry.UNSET:
            user.country = country

        if email is not strawberry.UNSET and email is not None:
            try:
                info_email = validate_email(email, check_deliverability=False)
                if '.' not in info_email.domain:
                    raise EmailNotValidError("Invalid email address")
                new_email = info_email.normalized.lower()
            except EmailNotValidError:
                raise ValueError("Invalid email address")

            if new_email != user.email:
                conflict = await db.execute(select(User).where(User.email == new_email))
                if conflict.scalar_one_or_none():
                    raise ValueError("Email already in use")
                user.email = new_email

        if new_password is not None:
            if not current_password:
                raise ValueError("Current password is required to set a new password")
            if not verify_password(current_password, user.hashed_password):
                raise ValueError("Current password is incorrect")
            if len(new_password) < 8:
                raise ValueError("New password must be at least 8 characters")
            user.hashed_password = hash_password(new_password)

        await db.commit()
        await db.refresh(user)

        return UserType(
            id=str(user.id),
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            country=user.country,
            is_active=user.is_active,
        )

    @strawberry.mutation(
        description=(
            "Soft-delete the authenticated user's account. "
            "Sessions are invalidated immediately. "
            "The account is permanently deleted after 30 days; contact support within that window to recover it."
        )
    )
    async def delete_user(self, info: Info) -> bool:
        db = info.context["db"]
        user = await get_current_user(info)

        await db.execute(delete(RefreshToken).where(RefreshToken.user_id == user.id))
        user.deleted_at = datetime.now(timezone.utc)
        await db.commit()
        return True
