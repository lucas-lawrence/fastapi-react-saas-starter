import uuid

import strawberry
from sqlalchemy import select
from strawberry.types import Info

from app.graphql.types import OrganizationType
from app.models.organization import Organization
from app.models.role import RoleAssignment


async def _user_from_token(info: Info):
    from jose import JWTError
    from app.core.security import decode_access_token
    from app.models.user import User
    request = info.context["request"]
    db = info.context["db"]
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None, db
    try:
        email = decode_access_token(auth_header[7:])
    except JWTError:
        return None, db
    result = await db.execute(select(User).where(User.email == email, User.deleted_at.is_(None)))
    return result.scalar_one_or_none(), db


@strawberry.type
class OrganizationQuery:
    @strawberry.field(description="Returns an organization by ID. Returns null if not found, soft-deleted, or the caller is not a member.")
    async def organization(self, id: strawberry.ID, info: Info) -> OrganizationType | None:
        user, db = await _user_from_token(info)
        if not user:
            return None
        try:
            org_uuid = uuid.UUID(str(id))
        except ValueError:
            return None
        result = await db.execute(
            select(Organization)
            .join(RoleAssignment, RoleAssignment.resource_id == Organization.id)
            .where(
                Organization.id == org_uuid,
                Organization.deleted_at.is_(None),
                RoleAssignment.user_id == user.id,
                RoleAssignment.resource_type == "organization",
                RoleAssignment.deleted_at.is_(None),
            )
        )
        org = result.scalar_one_or_none()
        if not org:
            return None
        return OrganizationType(id=str(org.id), name=org.name, slug=org.slug)

    @strawberry.field(description="Returns all organizations the authenticated user is a member of.")
    async def my_organizations(self, info: Info) -> list[OrganizationType]:
        user, db = await _user_from_token(info)
        if not user:
            return []

        result = await db.execute(
            select(Organization)
            .join(RoleAssignment, RoleAssignment.resource_id == Organization.id)
            .where(
                RoleAssignment.user_id == user.id,
                RoleAssignment.resource_type == "organization",
                RoleAssignment.deleted_at.is_(None),
                Organization.deleted_at.is_(None),
            )
            .distinct()
        )
        orgs = result.scalars().all()
        return [OrganizationType(id=str(o.id), name=o.name, slug=o.slug) for o in orgs]
