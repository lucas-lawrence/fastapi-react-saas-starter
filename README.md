# FastAPI SaaS Starter

A full-stack SaaS starter with FastAPI, React, and PostgreSQL — all containerised with Docker.

## Stack

| Layer | Technology |
|---|---|
| **Frontend** | Vite + React + TypeScript |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Backend** | FastAPI (Python) |
| **API** | GraphQL via Strawberry |
| **ORM** | SQLAlchemy (async) + Alembic |
| **Database** | PostgreSQL 18 |
| **Auth** | JWT (15 min) + Refresh tokens (7 days) |
| **Package managers** | uv (Python), npm (Node) |
| **Containerisation** | Docker Compose |

## Local URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| GraphQL Playground | http://localhost:8000/graphql |
| Health check | http://localhost:8000/health |
| PostgreSQL | localhost:5432 |

## Getting started

```bash
# Start all containers
docker compose up -d --build

# Run database migrations (first time only)
docker compose exec backend uv run alembic upgrade head
```

## Docs

**Architecture decisions**
- [ADR 0001 — Tech stack](docs/adr/0001-tech-stack.md)
- [ADR 0002 — Auth strategy](docs/adr/0002-auth-strategy.md)
- [ADR 0003 — Deployment strategy](docs/adr/0003-deployment-strategy.md)
- [ADR 0004 — GraphQL over REST](docs/adr/0004-graphql-over-rest.md)

**Frontend decisions**
- [FE 0001 — Framework and UI library](docs/frontend/0001-framework-and-ui.md)
- [FE 0002 — Dark mode strategy](docs/frontend/0002-dark-mode.md)
- [FE 0003 — Auth token storage](docs/frontend/0003-auth-token-storage.md)
