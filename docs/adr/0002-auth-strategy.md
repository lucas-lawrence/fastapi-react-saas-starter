# 0002 — Authentication Strategy

**Status:** Accepted

## Context

Needed a stateless, scalable auth system suitable for a SaaS product with good UX (users should stay logged in) without sacrificing security.

## Decision

- **JWT access tokens** (HS256, 15 min expiry) — short-lived, stateless, used for every API request
- **Opaque refresh tokens** (random 32-byte string, 7 day expiry) — stored in `refresh_tokens` table, used only to obtain a new access token
- **Refresh token rotation** — every `/refresh` call deletes the old token and issues a new one, limiting the abuse window if a token is stolen
- **Logout** invalidates the refresh token in the DB, terminating the session server-side

## Consequences

- Users stay logged in for up to 7 days without re-entering credentials
- A stolen access token is valid for at most 15 minutes
- A stolen refresh token can only be used once before rotation detects reuse (future: add reuse detection to revoke entire session)
- `refresh_tokens` table grows over time — a cleanup job for expired tokens will be needed
