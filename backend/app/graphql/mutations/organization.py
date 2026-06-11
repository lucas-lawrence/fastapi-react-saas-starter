import strawberry
from sqlalchemy import select
from strawberry.types import Info

from app.graphql.mutations.user import get_current_user
from app.graphql.types import OrganizationType
from app.models.organization import Organization, OrganizationMember, validate_slug


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

        member = OrganizationMember(organization_id=org.id, user_id=user.id, role="owner")
        db.add(member)
        await db.commit()
        await db.refresh(org)

        return OrganizationType(id=str(org.id), name=org.name, slug=org.slug)
