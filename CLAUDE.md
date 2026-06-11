# CLAUDE.md

Project conventions and pending work for Claude Code to pick up across sessions.

## Pending tasks

- [ ] Enforce `deleted_at IS NULL` on all list queries for future models — never return soft-deleted records in collections
- [ ] Return 404 when a single record lookup hits a soft-deleted row
- [ ] Build nightly cleanup job (APScheduler inside FastAPI) that: (1) hard-deletes rows where `deleted_at < now() - interval '30 days'`, (2) deletes expired refresh tokens where `expires_at < now()`
- [ ] Handle GDPR erasure requests — immediate hard delete, bypassing the 30-day grace period
- [ ] Landing page navbar: replace Sign In + Get Started with a single "Go to app" button when user is authenticated
- [ ] Implement silent refresh token rotation on the frontend (auto-refresh when access token expires)
- [ ] Wire up search bar — add `onChange` handler and results UI (component: `AppHeader`, input is currently uncontrolled)

## Coding conventions

### Soft deletes
- Never use `DELETE` for user-facing records — set `deleted_at = now()` instead
- Every query on a soft-deletable model **must** filter `WHERE deleted_at IS NULL`
- Single record lookups (e.g. `get user by id`) must return 404 if `deleted_at IS NOT NULL`
- `refresh_tokens` are exempt — always hard-deleted on logout or expiry

### Models
- All models inherit `TimestampMixin, Base` — provides `created_at`, `updated_at`, `deleted_at`
- Primary keys are UUID v7 (`uuid6.uuid7`), exposed as `strawberry.ID` (string) in GraphQL

### Timestamps
- Always use `DateTime(timezone=True)` — maps to `TIMESTAMPTZ` in PostgreSQL
- Never use plain `DateTime` without timezone

### ER diagram
- Kept at `backend/docs/data/erd.md` as a Mermaid diagram
- **Update it whenever a model is added or changed** — it is maintained manually alongside migrations

### Migrations
- Always generate and run inside Docker:
  ```bash
  docker compose exec backend uv run alembic revision --autogenerate -m "description"
  docker compose exec backend uv run alembic upgrade head
  ```

### shadcn/ui
- After `npx shadcn@latest add <component>`, move generated files from `@/components/ui/` → `src/components/ui/` and fix imports from `"src/lib/utils"` → `"@/lib/utils"`
- `asChild` prop is not supported (base-nova uses `@base-ui/react`, not Radix) — use `buttonVariants({ variant, size })` on `<Link>` instead
