# 0006 — Multi-Tenancy Model

**Status:** Accepted

## Context

A SaaS product needs a way to group users under a shared workspace. The core question is whether a user belongs to one organisation or many, and how that relationship is modelled in the schema.

## Decision

### Membership table (not a FK on users)

Users belong to organisations through a separate `organization_members` join table rather than an `organization_id` column on `users`. This allows:
- A user to belong to multiple organisations (common in team-based SaaS)
- Role assignment per membership (owner / admin / member)
- Future: invitation flow, audit log, per-org settings

A FK on `users` was rejected because it locks each user to exactly one organisation and makes role modelling awkward.

### Slug as subdomain handle

Each organisation has a `slug` — a URL-safe identifier used as the subdomain (`acme.saas.com`). Rules:
- Lowercase alphanumeric and hyphens only; must start and end with alphanumeric
- 3–63 characters (DNS subdomain limits)
- Unique across all organisations
- **Immutable after creation** — changing a subdomain breaks bookmarks, shared links, and SSO configuration
- Reserved list blocks infrastructure names (`admin`, `api`, `app`, `www`), internal environments (`staging`, `uat`, `beta`, `prod`), and common marketing/legal paths (`about`, `pricing`, `terms`, etc.)

### Role model

Three roles enforced at the API layer:

| Role | Permissions |
|---|---|
| `owner` | Full control — update, delete, manage members |
| `admin` | Update org name; manage members (future) |
| `member` | Read access only |

Roles are stored as a plain string column. An enum was considered but rejected — a string is simpler to query and extend without a migration.

### Soft delete

Both `organizations` and `organization_members` use `TimestampMixin` (soft delete via `deleted_at`). When an organisation is deleted:
1. All `organization_members` rows for that org are soft-deleted atomically in the same transaction
2. The organisation row is soft-deleted
3. The nightly cleanup job hard-deletes both after the 30-day grace period

## Consequences

- A user can belong to many organisations; access is always checked via a membership join
- All organisation queries must join through `organization_members` and filter `deleted_at IS NULL` on both tables
- Slug uniqueness is enforced at the DB level (unique constraint) and at the API level (pre-insert check with a user-friendly error)
- Slug immutability means no rename endpoint; a new org must be created if a slug change is needed
