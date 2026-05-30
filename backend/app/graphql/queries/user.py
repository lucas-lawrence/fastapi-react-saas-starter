import strawberry
from jose import JWTError
from sqlalchemy import select
from strawberry.types import Info

from app.core.security import decode_access_token
from app.graphql.types import UserType
from app.models.user import User


@strawberry.type
class UserQuery:
    @strawberry.field
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

        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user:
            return None

        return UserType(id=user.id, email=user.email, is_active=user.is_active)
