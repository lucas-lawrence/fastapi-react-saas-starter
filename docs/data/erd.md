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
        timestamptz updated_at
        timestamptz deleted_at
    }

    users ||--o{ refresh_tokens : "has many"
```

## Notes

- `deleted_at` — soft delete; `NULL` means active. Hard delete after 30-day grace period.
- `refresh_tokens.user_id` — cascades on hard delete (`ON DELETE CASCADE`)
- One user can have multiple active refresh tokens (one per device/browser)
