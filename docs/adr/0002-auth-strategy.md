# 0002 — Authentication Strategy

**Status:** Accepted

## Context

Needed a stateless, scalable auth system suitable for a SaaS product with good UX (users should stay logged in) without sacrificing security.

## Decision

- **JWT access tokens** (HS256, 60 min expiry) — short-lived, stateless, used for every API request
- **Opaque refresh tokens** (random 32-byte string, 7 day expiry) — stored in `refresh_tokens` table, used only to obtain a new access token
- **Refresh token rotation** — every `refresh` mutation deletes the old token and issues a new one, limiting the abuse window if a token is stolen
- **Logout** invalidates the refresh token in the DB, terminating the session server-side
- **bcrypt** — passwords are hashed with bcrypt (cost factor 12, default); used directly without passlib

## Registration validation (server-side)

- **Email** — validated with `email-validator`; must have a dot in the domain (rejects `email@email`); normalised and lowercased before storing
- **Password** — minimum 8 characters enforced; no complexity rules server-side (complexity is handled by zxcvbn on the frontend)
- **Names / country** — optional, no server-side validation beyond field type

## Consequences

- Users stay logged in for up to 7 days without re-entering credentials
- A stolen access token is valid for at most 60 minutes
- A stolen refresh token can only be used once before rotation detects reuse (future: add reuse detection to revoke entire session)
- `refresh_tokens` table grows over time — a cleanup job for expired tokens will be needed
