import re
import uuid

import uuid6
from sqlalchemy import ForeignKey, String, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.mixins import TimestampMixin

RESERVED_SLUGS = frozenset({
    "admin", "api", "app", "www", "mail", "dashboard", "console",
    "help", "support", "docs", "blog", "status", "billing", "auth",
    "login", "signup", "static", "assets", "cdn", "account", "settings",
    "user", "users", "org", "orgs",
})

_SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]*[a-z0-9]$")


def validate_slug(slug: str) -> str | None:
    if len(slug) < 3 or len(slug) > 63:
        return "Slug must be between 3 and 63 characters."
    if not _SLUG_RE.match(slug):
        return "Slug may only contain lowercase letters, numbers, and hyphens, and must not start or end with a hyphen."
    if slug in RESERVED_SLUGS:
        return f"'{slug}' is reserved and cannot be used as a subdomain."
    return None


class Organization(TimestampMixin, Base):
    __tablename__ = "organizations"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid6.uuid7)
    name: Mapped[str] = mapped_column(String, nullable=False)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)


class OrganizationMember(TimestampMixin, Base):
    __tablename__ = "organization_members"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid6.uuid7)
    organization_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(String, nullable=False, default="member")

    __table_args__ = (UniqueConstraint("organization_id", "user_id"),)
