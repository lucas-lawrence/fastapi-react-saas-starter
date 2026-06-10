# 0001 — Deployment Strategy

**Status:** Pending (not yet implemented)

## Context

Need a platform to deploy the full stack (frontend, backend, Postgres) for a test/staging environment. Priority is free tier, minimal setup, and compatibility with the existing Docker-based stack.

## Decision

**Railway** — deploy when ready for a test environment.

- Natively supports Docker Compose-style multi-service deploys
- Managed Postgres (no self-hosting the database)
- Free tier sufficient for an MVP
- `POSTGRES_PASSWORD` and other secrets set via Railway environment variables, separate from local `.env`

## Rejected alternatives

| Platform | Reason rejected |
|---|---|
| Heroku | No longer has a free tier |
| Render | Free services spin down after inactivity |
| Fly.io | Works well but more setup overhead |
| GCP Cloud Run + Cloud SQL | No free Postgres tier |
| DigitalOcean App Platform | Free tier too limited |

## Consequences

- Postgres must remain a separate managed service — never runs inside the app container in production
- All secrets (SECRET_KEY, POSTGRES_PASSWORD, etc.) are set as Railway environment variables, not committed to the repo
- Docker Compose stays as-is for local dev; Railway handles production differently (no compose in prod)
