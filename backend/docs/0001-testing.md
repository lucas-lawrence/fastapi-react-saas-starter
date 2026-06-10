# 0001 — Testing Strategy

## Context

Needed integration tests for the GraphQL API that run against a real database and cover the full request lifecycle — from HTTP to DB and back.

## Decision

### Test type

Integration tests only — POST to `/graphql`, assert on the JSON response. No unit tests for individual functions; the mutations and queries are thin enough that testing them through the HTTP layer gives sufficient coverage with less overhead.

### Tools

| Tool | Role |
|---|---|
| `pytest` + `pytest-asyncio` | Test runner, async support |
| `httpx.AsyncClient` + `ASGITransport` | HTTP client that hits the FastAPI app in-process (no network) |
| `dependency_overrides[get_db]` | Injects the test DB session — FastAPI's recommended testing pattern |

### Test database

A separate `app_test` PostgreSQL database on the same Docker instance. SQLite in-memory was ruled out because the schema uses `TIMESTAMPTZ` and PostgreSQL-specific behaviour.

One-time setup:
```bash
docker compose exec db psql -U postgres -c "CREATE DATABASE app_test;"
```

The test database URL is derived from the app's own `DATABASE_URL` env var (swapping the db name), so it automatically uses the right host (`db` inside Docker, `localhost` outside) without extra configuration.

### Test isolation

Tables are truncated after each test (`TRUNCATE refresh_tokens, users CASCADE`). A `rollback()` runs first to clear any aborted transaction state before the truncate.

Transaction rollback per test (the SAVEPOINT pattern) was considered but ruled out — it requires monkey-patching `session.commit()` and is fragile with async SQLAlchemy.

### Event loop scope

All fixtures and tests share a single session-scoped event loop (`asyncio_default_fixture_loop_scope = "session"`, `asyncio_default_test_loop_scope = "session"`). This is required because the session-scoped `engine` fixture creates asyncpg connections on the session loop — function-scoped test loops cannot reuse those connections and raise a `Future attached to a different loop` error.

## Running tests

```bash
docker compose exec backend uv run pytest
docker compose exec backend uv run pytest -v              # verbose
docker compose exec backend uv run pytest tests/test_auth.py  # single file
```

## Test coverage

| File | What's tested |
|---|---|
| `test_health.py` | `GET /health` |
| `test_auth.py` | `register`, `login`, `me`, `refresh`, `logout` |
| `test_user.py` | `updateUser` — name, email, password, auth guards |

## Consequences

- Tests require the `app_test` database to exist before running (one-time manual step)
- All tests share one event loop — a hung async operation in one test could affect subsequent tests, but this is acceptable for a test suite that runs end-to-end quickly
- Adding new mutations or queries means adding a corresponding test file or extending an existing one

## Related

- [ADR 0002 — Auth strategy](../../docs/adr/0002-auth-strategy.md)
