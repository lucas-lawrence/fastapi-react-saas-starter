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

    organization_members {
        uuid id PK
        uuid organization_id FK
        uuid user_id FK
        string role
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    users ||--o{ refresh_tokens : "has many"
    organizations ||--o{ organization_members : "has many"
    users ||--o{ organization_members : "member of"
```

## Notes

- `deleted_at` — soft delete; `NULL` means active. Hard delete after 30-day grace period.
- `refresh_tokens` — hard-deleted on logout or expiry; no soft delete, no `updated_at`/`deleted_at`
- `refresh_tokens.user_id`, `organization_members.organization_id`, `organization_members.user_id` — all cascade on hard delete (`ON DELETE CASCADE`)
- One user can have multiple active refresh tokens (one per device/browser)
- `organization_members` has a unique constraint on `(organization_id, user_id)` — one membership record per user per org
- `organizations.slug` — immutable after creation; used as subdomain (e.g. `acme.saas.com`)
