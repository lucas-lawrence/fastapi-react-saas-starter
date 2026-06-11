import strawberry
from jose import JWTError
from sqlalchemy import select
from strawberry.types import Info

from app.core.security import decode_access_token
from app.graphql.types import UserType
from app.models.user import User


@strawberry.type
class UserQuery:
    @strawberry.field(description="Returns the currently authenticated user. Requires a valid `Authorization: Bearer <access_token>` header. Returns null if unauthenticated.")
    async def me(self, info: Info) -> UserType | None:
        request = info.context["request"]
        db = info.context["db"]

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None

        try:
            email = decode_access_token(auth_header[7:])
        except JWTError:
            return None

        result = await db.execute(select(User).where(User.email == email, User.deleted_at.is_(None)))
        user = result.scalar_one_or_none()
        if not user:
            return None

        return UserType(id=str(user.id), email=user.email, first_name=user.first_name, last_name=user.last_name, country=user.country, is_active=user.is_active)
