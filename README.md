# FastAPI SaaS Starter

A full-stack SaaS starter with FastAPI, React, and PostgreSQL — all containerised with Docker.

## Local URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |
| PostgreSQL | localhost:5432 |

## Getting started

```bash
# Start all containers
docker compose up -d --build

# Run database migrations
docker compose exec backend uv run alembic upgrade head
```

## Stack

- **Frontend** — Vite + React + TypeScript + Tailwind CSS v4 + shadcn/ui
- **Backend** — FastAPI + SQLAlchemy (async) + Alembic
- **Database** — PostgreSQL 18
- **Package manager** — uv (Python), npm (Node)

## Docs

- [ADR 0001 — Tech stack](docs/adr/0001-tech-stack.md)
- [ADR 0002 — Auth strategy](docs/adr/0002-auth-strategy.md)
