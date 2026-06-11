import re
import uuid

import uuid6
from sqlalchemy import String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.mixins import TimestampMixin

RESERVED_SLUGS = frozenset({
    # Infrastructure / routing
    "admin", "api", "app", "www", "mail", "static", "assets", "cdn",
    "health", "webhook", "webhooks", "public", "internal",
    # Auth flows
    "auth", "login", "signup", "account", "settings",
    # App sections
    "dashboard", "console", "billing", "status",
    # Support / docs
    "help", "support", "docs", "blog",
    # Marketing pages
    "about", "pricing", "terms", "privacy", "contact",
    "security", "legal", "careers", "demo", "trial", "home",
    # Internal environments
    "alpha", "beta", "uat", "staging", "stage", "dev", "test",
    "sandbox", "preview", "canary", "prod", "production",
    # Generic / conflict-prone
    "user", "users", "org", "orgs", "me", "new", "null",
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


