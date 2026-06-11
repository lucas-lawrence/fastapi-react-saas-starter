# Entity Relationship Diagram

Updated manually when models change. Source of truth is always the Alembic migrations.

```mermaid
erDiagram
    users {
        uuid id PK
        string email UK
        string hashed_password
        string first_name
        string last_name
        string country
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    refresh_tokens {
        uuid id PK
        string token UK
        uuid user_id FK
        timestamptz expires_at
        timestamptz created_at
    }

    organizations {
        uuid id PK
        string name
        string slug UK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    roles {
        uuid id PK
        uuid org_id FK "NULL = system role"
        string name
        boolean is_system
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    role_permissions {
        uuid role_id FK
        string permission_code
    }

    role_assignments {
        uuid id PK
        uuid org_id FK
        uuid user_id FK
        uuid role_id FK
        string resource_type "'organization' | 'shop' | ..."
        uuid resource_id "no FK — polymorphic"
        uuid assigned_by FK
        timestamptz created_at
        timestamptz deleted_at
    }

    users ||--o{ refresh_tokens : "has many"
    organizations ||--o{ roles : "custom roles"
    roles ||--o{ role_permissions : "has many"
    organizations ||--o{ role_assignments : "scopes"
    users ||--o{ role_assignments : "assigned to"
    roles ||--o{ role_assignments : "granted via"
```

## Notes

- `deleted_at` — soft delete; `NULL` means active. Hard delete after 30-day grace period.
- `refresh_tokens` — hard-deleted on logout or expiry; no soft delete, no `updated_at`/`deleted_at`
- `roles.org_id NULL` — system roles (owner, admin, member); shared across all orgs
- `roles.org_id SET` — custom roles scoped to that org; deleted when the org is deleted
- `role_assignments.resource_id` — no FK constraint; points to different tables depending on `resource_type`
- `role_assignments` replaces the old `organization_members` table — a user is "in an org" if they have at least one active assignment for that org
- Permissions for system roles are defined in `app/core/permissions.py` (`SYSTEM_ROLE_PERMISSIONS`); custom roles use the `role_permissions` table
- `assigned_by` — audit trail; SET NULL if the assigner's account is hard-deleted
