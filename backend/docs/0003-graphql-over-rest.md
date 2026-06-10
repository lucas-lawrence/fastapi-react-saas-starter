# 0003 — GraphQL over REST

**Status:** Accepted

## Context

Needed an API layer between the FastAPI backend and the React frontend. The two main options were REST and GraphQL.

## Decision

Use **GraphQL via Strawberry** (`strawberry-graphql[fastapi]`) instead of REST endpoints.

- Single endpoint at `/graphql`
- GraphiQL playground at `/graphql` (replaces Swagger `/docs` for API exploration)
- Code-first schema using Python type hints (consistent with existing Pydantic/SQLAlchemy style)
- Frontend sends typed queries/mutations via a `gql()` helper in `src/lib/api.ts`

## Why GraphQL

- **No over/under-fetching** — the frontend specifies exactly what fields it needs. Adding a new column to a model doesn't break existing queries or require a new endpoint
- **Single source of truth** — one schema describes the entire API surface, self-documented via introspection
- **Scales with complexity** — as the data model grows (users → teams → projects → tasks), GraphQL relationships are natural; REST would require versioning or deeply nested endpoints
- **Future flexibility** — if a mobile app or third-party integration is added, they consume the same `/graphql` endpoint with their own field selections

## Trade-offs accepted

- Error handling is different from REST — errors come back as `200 OK` with an `errors[]` array, not HTTP status codes
- GraphQL adds a schema/resolver layer on top of the existing models — slightly more boilerplate per feature
- Swagger `/docs` is no longer the primary API explorer — replaced by GraphiQL at `/graphql`

## Structure

```
app/graphql/
├── schema.py        ← root Query + Mutation + GraphQLRouter
├── types.py         ← Strawberry output types (UserType, TokenPair)
├── context.py       ← FastAPI dependency that injects db + request into resolvers
├── queries/
│   └── user.py      ← me query
└── mutations/
    └── auth.py      ← register, login, refresh, logout
```
