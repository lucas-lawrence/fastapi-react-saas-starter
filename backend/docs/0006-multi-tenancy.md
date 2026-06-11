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

### Role model (RBAC)

Roles and permissions are modelled as three tables:

- **`roles`** — named roles, either system-wide (`org_id IS NULL`) or custom per org (`org_id IS NOT NULL`)
- **`role_permissions`** — permission codes for custom roles; system role permissions are defined in `app/core/permissions.py`
- **`role_assignments`** — grants a role to a user for a specific resource (`resource_type` + `resource_id`)

System roles:

| Role | Key permissions |
|---|---|
| `owner` | `org:*` — full control via wildcard |
| `admin` | `org:read`, `org:settings:update`, `org:members:manage` |
| `member` | `org:read` |

A user can hold multiple roles simultaneously. Permissions accumulate — the union of all assigned roles determines access. Org-level roles (`resource_type = 'organization'`) cascade to sub-resources in application logic.

`role_assignments` replaces the old `organization_members` table. A user is considered "in an org" if they have at least one active role assignment for that org. Removing all role assignments removes the user from the org.

### Resource scoping

`resource_type` and `resource_id` make role assignments polymorphic:

- `resource_type = 'organization'`, `resource_id = org.id` → org-level role
- `resource_type = 'shop'`, `resource_id = shop.id` → shop-level role (future)

This means a user can be an admin in Shop A and a viewer in Shop B, with no schema changes required when new resource types are added.

### Soft delete

`organizations` uses `TimestampMixin` (soft delete via `deleted_at`). `role_assignments` has `created_at` and `deleted_at` only (no `updated_at` — assignments are created and removed, not updated). When an organisation is deleted:
1. All `role_assignments` rows for that org are soft-deleted atomically in the same transaction
2. The organisation row is soft-deleted
3. The nightly cleanup job hard-deletes both after the 30-day grace period

## Consequences

- A user can belong to many organisations; access is always checked via `role_assignments`
- All organisation queries must join through `role_assignments` and filter `deleted_at IS NULL` on both tables
- Slug uniqueness is enforced at the DB level (unique constraint) and at the API level (pre-insert check with a user-friendly error)
- Slug immutability means no rename endpoint; a new org must be created if a slug change is needed
- System role permissions are defined in code (`SYSTEM_ROLE_PERMISSIONS`); modifying them requires a code deploy — by design, to prevent privilege escalation via the DB
- Custom roles write permissions to the `role_permissions` table; a role-builder UI for org admins is a future feature
