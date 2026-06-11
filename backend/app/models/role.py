import uuid
from datetime import datetime

import uuid6
from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, UniqueConstraint, Uuid, text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.database import Base
from app.models.mixins import TimestampMixin


class Role(TimestampMixin, Base):
    __tablename__ = "roles"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid6.uuid7)
    org_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    is_system: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    __table_args__ = (
        # System roles (org_id IS NULL): unique by name globally
        Index("uq_roles_system_name", "name", unique=True, postgresql_where=text("org_id IS NULL")),
        # Custom roles (org_id IS NOT NULL): unique by name per org
        Index("uq_roles_org_name", "org_id", "name", unique=True, postgresql_where=text("org_id IS NOT NULL")),
    )


class RolePermission(Base):
    """Permission codes assigned to custom (non-system) roles. System role permissions live in SYSTEM_ROLE_PERMISSIONS."""

    __tablename__ = "role_permissions"

    role_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True
    )
    permission_code: Mapped[str] = mapped_column(String, primary_key=True)


class RoleAssignment(Base):
    """Grants a role to a user for a specific resource (org, shop, project, etc.)."""

    __tablename__ = "role_assignments"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid6.uuid7)
    org_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    role_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("roles.id", ondelete="CASCADE"), nullable=False
    )
    resource_type: Mapped[str] = mapped_column(String, nullable=False)  # 'organization' | 'shop' | ...
    resource_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)  # no FK — points to different tables
    assigned_by: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        UniqueConstraint("user_id", "role_id", "resource_type", "resource_id", name="uq_role_assignment"),
    )
