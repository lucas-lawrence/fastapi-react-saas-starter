# Backend

FastAPI service that acts as the **data gatekeeper** for the application. Every write passes through Pydantic and Strawberry validation before touching the database. Every read is filtered by ownership and soft-delete rules before leaving.

The frontend knows nothing about the database — it only ever sees what the GraphQL schema explicitly exposes.

## Why FastAPI + PostgreSQL?

**FastAPI**
- Pydantic validation at every boundary — invalid data is rejected before it reaches the DB
- Async-first: async SQLAlchemy + asyncpg keeps I/O non-blocking
- Auto-generated OpenAPI docs at `/docs` for free (useful for debugging, even with GraphQL as the primary API)

**PostgreSQL**
- `TIMESTAMPTZ` for all timestamps — timezone-aware by default, no silent UTC bugs
- `ON DELETE CASCADE` for FK relationships — DB enforces referential integrity even if application logic has a gap
- Mature async driver ecosystem (asyncpg)

Full rationale: [BE 0001 — Core tech stack](docs/0001-tech-stack.md)

## Structure

```
app/
  models/         SQLAlchemy models — schema of record
    mixins.py     TimestampMixin: created_at, updated_at, deleted_at
  graphql/
    types.py      Strawberry output types (what the API exposes)
    queries/      Read operations — one file per model
    mutations/    Write operations — one file per model
    schema.py     Wires queries + mutations into the schema
    context.py    Injects DB session into every request
  core/
    security.py     JWT creation/verification, password hashing
    permissions.py  Permission constants (P) + has_org_permission() helper
  config.py       Settings from environment variables
  database.py     Async engine + session factory
  main.py         FastAPI app + router mounts
alembic/
  versions/       Migration files — always generate inside Docker
tests/            Integration tests — HTTP → GraphQL → DB → response
docs/             Decision records + ERD
```

## Development workflow

**Always plan before writing code.**

1. **Design the schema** — what tables, what fields, what relationships? Update the [ERD](docs/data/erd.md) first.
2. **Add the model** — run `/add-model <name>` and follow each step.
3. **Complete CRUDL** — run `/crudl <name>` to implement and test all five operations (Create, Read, Update, Delete, List). Every model must have all five before it is considered done.
4. **Document the decision** — if you made a non-obvious architectural choice, add a doc to `backend/docs/`.

## Key conventions

**Soft deletes — mandatory**
- Never `DELETE` a user-facing row. Set `deleted_at = now()`.
- Every query on a soft-deletable model **must** filter `WHERE deleted_at IS NULL`.
- Single-record lookups must return `null` / raise an error if `deleted_at IS NOT NULL`.
- `refresh_tokens` are exempt — always hard-deleted (no audit value, session data only).

**Ownership — always verify**
- Before any mutation, confirm the caller owns or has the right role for the target record.
- Never trust the ID in the request alone — join against the caller's identity.

**RBAC — roles and permissions**
- System roles (`owner`, `admin`, `member`) are seeded globally; permissions are defined in `core/permissions.py` (`SYSTEM_ROLE_PERMISSIONS`).
- Custom roles (future) are org-scoped and store permission codes in the `role_permissions` table.
- Use `has_org_permission(user_id, org_uuid, P.SOME_PERMISSION, db)` to check access — never hardcode role name strings in mutations.
- `role_assignments` is the single source of truth for membership: a user is "in an org" if they have at least one active assignment. Multiple roles per user are supported; permissions accumulate.
- When adding a new sub-resource (shop, project), assign `resource_type = '<resource>'` on `RoleAssignment` — no schema change needed.

**Timestamps**
- Always `DateTime(timezone=True)` → `TIMESTAMPTZ` in PostgreSQL. Never plain `DateTime`.

**Primary keys**
- UUID v7 (`uuid6.uuid7`) — time-ordered, globally unique, safe to expose in APIs. See [BE 0004](docs/0004-uuid-v7-primary-keys.md).

**Validation**
- Raise `ValueError` for business rule violations — Strawberry converts these to GraphQL errors automatically.
- Keep validation in the mutation layer, not the model layer.

## Common commands

```bash
# Run the full test suite
docker compose exec backend uv run pytest

# Verbose output for a single file
docker compose exec backend uv run pytest tests/test_organization.py -v

# Generate a migration after changing a model
docker compose exec backend uv run alembic revision --autogenerate -m "describe change"
docker compose exec backend uv run alembic upgrade head

# Verify a table in the DB
docker compose exec db psql -U postgres -d app -c "\d <table>"

# Open an interactive Python shell inside the container
docker compose exec backend uv run python
```

## API

- GraphQL endpoint: `http://localhost:8000/graphql`
- Interactive playground (Strawberry): `http://localhost:8000/graphql`
- Health check: `http://localhost:8000/health`

The GraphQL schema is the contract. If a field is not in `types.py`, it does not exist to the outside world — regardless of what the DB column is named.

## Decision records

| # | Decision |
|---|---|
| [0001](docs/0001-tech-stack.md) | Core tech stack |
| [0002](docs/0002-auth-strategy.md) | Authentication strategy + user lifecycle |
| [0003](docs/0003-graphql-over-rest.md) | GraphQL over REST |
| [0004](docs/0004-uuid-v7-primary-keys.md) | UUID v7 primary keys |
| [0005](docs/0005-testing.md) | Testing strategy |
| [0006](docs/0006-multi-tenancy.md) | Multi-tenancy model + RBAC |
