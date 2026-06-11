import strawberry
from jose import JWTError
from sqlalchemy import select
from strawberry.types import Info

from app.core.security import decode_access_token
from app.graphql.types import OrganizationType
from app.models.organization import Organization, OrganizationMember


@strawberry.type
class OrganizationQuery:
    @strawberry.field(description="Returns all organizations the authenticated user is a member of.")
    async def my_organizations(self, info: Info) -> list[OrganizationType]:
        request = info.context["request"]
        db = info.context["db"]

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return []

        try:
            email = decode_access_token(auth_header[7:])
        except JWTError:
            return []

        from app.models.user import User
        user_result = await db.execute(select(User).where(User.email == email, User.deleted_at.is_(None)))
        user = user_result.scalar_one_or_none()
        if not user:
            return []

        result = await db.execute(
            select(Organization)
            .join(OrganizationMember, OrganizationMember.organization_id == Organization.id)
            .where(
                OrganizationMember.user_id == user.id,
                OrganizationMember.deleted_at.is_(None),
                Organization.deleted_at.is_(None),
            )
        )
        orgs = result.scalars().all()
        return [OrganizationType(id=str(o.id), name=o.name, slug=o.slug) for o in orgs]
