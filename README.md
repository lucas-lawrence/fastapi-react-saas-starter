# FastAPI SaaS Starter

A full-stack SaaS starter with FastAPI, React, and PostgreSQL — all containerised with Docker.

## Stack

| Layer | Technology |
|---|---|
| **Frontend** | Vite + React + TypeScript |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Backend** | FastAPI (Python 3.13) |
| **API** | GraphQL via Strawberry |
| **ORM** | SQLAlchemy (async) + Alembic |
| **Database** | PostgreSQL 18 |
| **Auth** | JWT (60 min) + Refresh tokens (7 days) |
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

## Running backend tests

**One-time setup — create the test database:**
```bash
docker compose exec db psql -U postgres -c "CREATE DATABASE app_test;"
```

**Run the full test suite:**
```bash
docker compose exec backend uv run pytest
```

**Run a single file:**
```bash
docker compose exec backend uv run pytest tests/test_auth.py -v
```

Tests use a separate `app_test` database and truncate all tables between each test. No data from the dev database is touched.

## Common workflows

**Generate a new migration after changing a model:**
```bash
docker compose exec backend uv run alembic revision --autogenerate -m "describe your change"
docker compose exec backend uv run alembic upgrade head
```

**Add a shadcn/ui component:**
```bash
cd frontend
npx shadcn@latest add <component>
```
> ⚠️ shadcn drops files into a literal `@/` folder. After running, move them to `src/components/ui/` and fix any imports from `"src/lib/utils"` → `"@/lib/utils"`.

## Docs

**Architecture decisions**
- [ADR 0001 — Tech stack](docs/adr/0001-tech-stack.md)
- [ADR 0002 — Auth strategy](docs/adr/0002-auth-strategy.md)
- [ADR 0003 — Deployment strategy](docs/adr/0003-deployment-strategy.md)
- [ADR 0004 — GraphQL over REST](docs/adr/0004-graphql-over-rest.md)
- [ADR 0005 — UUID v7 primary keys](docs/adr/0005-uuid-v7-primary-keys.md)

**Frontend decisions**
- [FE 0001 — Framework and UI library](docs/frontend/0001-framework-and-ui.md)
- [FE 0002 — Dark mode strategy](docs/frontend/0002-dark-mode.md)
- [FE 0003 — Auth token storage](docs/frontend/0003-auth-token-storage.md)
- [FE 0004 — Registration flow](docs/frontend/0004-registration-flow.md)
- [FE 0005 — App shell](docs/frontend/0005-app-shell.md)
- [FE 0006 — Page titles](docs/frontend/0006-page-titles.md)
- [FE 0007 — Settings pages](docs/frontend/0007-settings.md)
