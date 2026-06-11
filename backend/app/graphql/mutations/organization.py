import uuid
from datetime import datetime, timezone

import strawberry
from sqlalchemy import select, update
from strawberry.types import Info

from app.core.permissions import P, has_org_permission
from app.graphql.mutations.user import get_current_user
from app.graphql.types import OrganizationType
from app.models.organization import Organization, validate_slug
from app.models.role import Role, RoleAssignment


@strawberry.type
class OrganizationMutation:
    @strawberry.mutation(description="Create a new organization. The authenticated user becomes the owner. Slug becomes the subdomain (e.g. 'acme' → acme.saas.com) and cannot be changed later.")
    async def create_organization(self, name: str, slug: str, info: Info) -> OrganizationType:
        db = info.context["db"]
        user = await get_current_user(info)

        slug = slug.strip().lower()

        error = validate_slug(slug)
        if error:
            raise ValueError(error)

        existing = await db.execute(select(Organization).where(Organization.slug == slug))
        if existing.scalar_one_or_none():
            raise ValueError(f"'{slug}' is already taken.")

        org = Organization(name=name.strip(), slug=slug)
        db.add(org)
        await db.flush()

        owner_role_result = await db.execute(
            select(Role).where(Role.name == "owner", Role.org_id.is_(None), Role.is_system.is_(True))
        )
        owner_role = owner_role_result.scalar_one()

        assignment = RoleAssignment(
            org_id=org.id,
            user_id=user.id,
            role_id=owner_role.id,
            resource_type="organization",
            resource_id=org.id,
            assigned_by=user.id,
        )
        db.add(assignment)
        await db.commit()
        await db.refresh(org)

        return OrganizationType(id=str(org.id), name=org.name, slug=org.slug)

    @strawberry.mutation(description="Update an organization's name. Slug is immutable. Requires owner or admin role.")
    async def update_organization(self, id: strawberry.ID, name: str, info: Info) -> OrganizationType:
        db = info.context["db"]
        user = await get_current_user(info)

        try:
            org_uuid = uuid.UUID(str(id))
        except ValueError:
            raise ValueError("Invalid organization ID.")

        if not await has_org_permission(user.id, org_uuid, P.ORG_SETTINGS_UPDATE, db):
            raise ValueError("Organization not found or insufficient permissions.")

        org_result = await db.execute(
            select(Organization).where(Organization.id == org_uuid, Organization.deleted_at.is_(None))
        )
        org = org_result.scalar_one_or_none()
        if not org:
            raise ValueError("Organization not found.")

        org.name = name.strip()
        await db.commit()
        await db.refresh(org)
        return OrganizationType(id=str(org.id), name=org.name, slug=org.slug)

    @strawberry.mutation(description="Soft-delete an organization. Requires owner role. Permanent deletion occurs after 30 days.")
    async def delete_organization(self, id: strawberry.ID, info: Info) -> bool:
        db = info.context["db"]
        user = await get_current_user(info)

        try:
            org_uuid = uuid.UUID(str(id))
        except ValueError:
            raise ValueError("Invalid organization ID.")

        if not await has_org_permission(user.id, org_uuid, P.ORG_DELETE, db):
            raise ValueError("Organization not found or insufficient permissions.")

        org_result = await db.execute(
            select(Organization).where(Organization.id == org_uuid, Organization.deleted_at.is_(None))
        )
        org = org_result.scalar_one_or_none()
        if not org:
            raise ValueError("Organization not found.")

        now = datetime.now(timezone.utc)
        await db.execute(
            update(RoleAssignment)
            .where(RoleAssignment.org_id == org_uuid, RoleAssignment.deleted_at.is_(None))
            .values(deleted_at=now)
        )
        org.deleted_at = now
        await db.commit()
        return True
