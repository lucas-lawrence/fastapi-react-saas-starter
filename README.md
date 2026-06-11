# FastAPI SaaS Starter

A full-stack, multi-tenant SaaS starter — batteries included. Clone it, rename it, build your product on top.

## What's included

| Feature | Status |
|---|---|
| Register, login, logout | ✅ |
| JWT auth + refresh token rotation | ✅ |
| Update profile (name, email, country) | ✅ |
| Change password | ✅ |
| Soft-delete account (30-day grace period) | ✅ |
| Multi-tenant organisations | ✅ |
| Role-based access control (RBAC) | ✅ |
| Modern landing page | ✅ |
| Settings page | ✅ |
| Backend tests (pytest) | ✅ |
| Frontend tests (Vitest) | ✅ |

## Stack

| Layer | Technology |
|---|---|
| **Frontend** | Vite + React + TypeScript |
| **Styling** | Tailwind CSS v4 + shadcn/ui (base-nova) |
| **Backend** | FastAPI (Python 3.13) |
| **API** | GraphQL via Strawberry |
| **ORM** | SQLAlchemy (async) + Alembic |
| **Database** | PostgreSQL 18 |
| **Auth** | JWT (60 min) + refresh tokens (7 days) |
| **Package managers** | uv (Python), npm (Node) |
| **Containerisation** | Docker Compose |

## Getting started

```bash
# 1. Clone and start all containers
git clone https://github.com/lucas-lawrence/fastapi-react-saas-starter.git
cd fastapi-saas-starter
docker compose up -d --build

# 2. Run migrations
docker compose exec backend uv run alembic upgrade head

# 3. Create the test database (first time only)
docker compose exec db psql -U postgres -c "CREATE DATABASE app_test;"
```

Then open [http://localhost:3000](http://localhost:3000).

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| GraphQL Playground | http://localhost:8000/graphql |
| Health check | http://localhost:8000/health |

## RBAC model

Each user can hold multiple roles, scoped to a specific resource (org, shop, project, etc.). Roles are not global — a user can be an admin of Org A and a member of Org B simultaneously.

```
roles              role_permissions       role_assignments
─────────────      ────────────────       ─────────────────────────────────
id                 role_id (FK)           id
org_id (nullable)  permission_code        user_id (FK)
name                                      org_id (FK)
is_system                                 role_id (FK)
                                          resource_type  ("organization", "shop", ...)
                                          resource_id    (UUID — polymorphic, no FK)
                                          assigned_by (FK, nullable)
```

System roles (`owner`, `admin`, `member`) are seeded at startup with permissions defined in `backend/app/core/permissions.py`. Custom roles store their permissions in the `role_permissions` table.

## Running tests

```bash
# Full suite
docker compose exec backend uv run pytest

# Single file
docker compose exec backend uv run pytest tests/test_auth.py -v

# Frontend
cd frontend && npm test
```

## Common workflows

**New migration after changing a model:**
```bash
docker compose exec backend uv run alembic revision --autogenerate -m "describe change"
docker compose exec backend uv run alembic upgrade head
```

**Add a shadcn/ui component:**
```bash
cd frontend
npx shadcn@latest add <component>
# Move generated file from src/components/ui/ — imports are already correct with base-nova
```

> **Note:** This project uses the `base-nova` shadcn registry (`@base-ui/react` primitives, not Radix). The `asChild` prop is not supported — use `buttonVariants({ variant, size })` on `<Link>` instead.

## Project structure

```
.
├── backend/
│   ├── app/
│   │   ├── core/          # Config, security, permissions
│   │   ├── graphql/       # Queries, mutations, types, schema
│   │   ├── models/        # SQLAlchemy models
│   │   └── main.py
│   ├── tests/
│   └── docs/              # Backend decision records
├── frontend/
│   ├── src/
│   │   ├── components/    # Layout + UI components
│   │   ├── context/       # AuthContext, ThemeContext
│   │   ├── lib/           # API client, validation utils
│   │   └── pages/         # Route-level pages
│   └── docs/              # Frontend decision records
└── docker-compose.yml
```

## Decision records

**Shared**
- [0001 — Deployment strategy](docs/0001-deployment-strategy.md)

**Backend**
- [BE 0001 — Core tech stack](backend/docs/0001-tech-stack.md)
- [BE 0002 — Authentication strategy](backend/docs/0002-auth-strategy.md)
- [BE 0003 — GraphQL over REST](backend/docs/0003-graphql-over-rest.md)
- [BE 0004 — UUID v7 primary keys](backend/docs/0004-uuid-v7-primary-keys.md)
- [BE 0005 — Testing strategy](backend/docs/0005-testing.md)
- [BE 0006 — Multi-tenancy and RBAC](backend/docs/0006-multi-tenancy.md)

**Frontend**
- [FE 0001 — Framework and UI library](frontend/docs/0001-framework-and-ui.md)
- [FE 0002 — Styling and theme](frontend/docs/0002-styling-and-theme.md)
- [FE 0003 — Auth token storage](frontend/docs/0003-auth-token-storage.md)
- [FE 0004 — Account flows](frontend/docs/0004-account-flows.md)
- [FE 0005 — App shell](frontend/docs/0005-app-shell.md)
- [FE 0006 — Page titles](frontend/docs/0006-page-titles.md)
- [FE 0008 — Frontend testing](frontend/docs/0008-testing.md)

## License

MIT
