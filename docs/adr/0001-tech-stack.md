# 0001 — Core Tech Stack

**Status:** Accepted

## Context

Needed a backend framework, database, and containerisation strategy for a SaaS starter that is async-first, easy to iterate on, and production-ready.

## Decision

- **FastAPI on Python 3.13** — async Python framework with auto-generated OpenAPI docs and Pydantic validation built in; latest stable Python as of mid-2026 (see [ADR 0005](0005-uuid-v7-primary-keys.md) for UUID v7 reasoning)
- **PostgreSQL 18** — primary database; reliable, widely supported, strong async driver ecosystem
- **SQLAlchemy 2 (async)** — ORM with async support; Alembic handles migrations
- **bcrypt** (direct, no passlib) — password hashing; passlib is unmaintained and incompatible with bcrypt 4.x+
- **uv** — Python package manager; fast and modern replacement for pip/poetry
- **Docker Compose** — local dev and production parity via `backend` + `db` services

## Conventions

- All timestamps use `TIMESTAMPTZ` (timestamp with timezone) — stored in UTC, avoids timezone bugs
- All models carry `created_at` (immutable) and `updated_at` (set by SQLAlchemy `onupdate` on every write)

## Consequences

- Migration files must be volume-mounted (`./backend/alembic/versions`) to persist across container rebuilds
- Alembic migrations are run manually after deploy: `alembic upgrade head`
- Alpine-based images (`postgres:18-alpine`) keep image sizes small but may lack glibc-dependent extensions
