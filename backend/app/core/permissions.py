import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class P:
    ORG_READ = "org:read"
    ORG_SETTINGS_UPDATE = "org:settings:update"
    ORG_MEMBERS_MANAGE = "org:members:manage"
    ORG_DELETE = "org:delete"


# System roles: permissions are defined here in code, not in the DB.
# Custom roles (org_id IS NOT NULL) are checked against the role_permissions table.
SYSTEM_ROLE_PERMISSIONS: dict[str, set[str]] = {
    "owner": {"org:*"},
    "admin": {P.ORG_READ, P.ORG_SETTINGS_UPDATE, P.ORG_MEMBERS_MANAGE},
    "member": {P.ORG_READ},
}


async def has_org_permission(
    user_id: uuid.UUID,
    org_uuid: uuid.UUID,
    code: str,
    db: AsyncSession,
) -> bool:
    """Return True if the user holds any active role granting `code` at org level."""
    from app.models.role import Role, RoleAssignment, RolePermission

    result = await db.execute(
        select(Role.name, Role.id, Role.is_system)
        .join(RoleAssignment, RoleAssignment.role_id == Role.id)
        .where(
            RoleAssignment.user_id == user_id,
            RoleAssignment.org_id == org_uuid,
            RoleAssignment.resource_type == "organization",
            RoleAssignment.resource_id == org_uuid,
            RoleAssignment.deleted_at.is_(None),
        )
    )
    roles = result.all()
    if not roles:
        return False

    namespace = code.split(":")[0]
    wildcard = f"{namespace}:*"

    for name, role_id, is_system in roles:
        if is_system:
            perms = SYSTEM_ROLE_PERMISSIONS.get(name, set())
            if wildcard in perms or code in perms:
                return True
        else:
            perm = await db.execute(
                select(RolePermission).where(
                    RolePermission.role_id == role_id,
                    RolePermission.permission_code == code,
                )
            )
            if perm.scalar_one_or_none():
                return True

    return False
