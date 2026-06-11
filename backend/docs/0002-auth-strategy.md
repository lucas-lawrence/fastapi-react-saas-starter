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

## Account deletion

- **`deleteUser` mutation** — authenticated users can soft-delete their own account
- `deleted_at` is set immediately; all refresh tokens are hard-deleted in the same transaction — sessions are killed on the spot
- The email address remains reserved for the 30-day grace period; re-registration with the same email is blocked until the nightly cleanup job hard-deletes the row
- A soft-deleted user is treated as non-existent across all auth paths (`login`, `me`, `refresh`, `get_current_user`) — every User lookup enforces `deleted_at IS NULL`
- **GDPR/PDPA erasure** (pending) — a separate path for regulatory deletion requests that bypasses the grace period and hard-deletes immediately

## Profile updates (server-side)

- **`updateUser` mutation** — authenticated users can update `firstName`, `lastName`, `email`, `country`, and `password`
- All fields are optional (`strawberry.UNSET`); only provided fields are written
- Email changes follow the same validation rules as registration (format, domain dot, uniqueness, lowercase)
- Password change requires `currentPassword` for verification before accepting `newPassword`; minimum 8 characters enforced

## Registration validation (server-side)

- **Email** — validated with `email-validator`; must have a dot in the domain (rejects `email@email`); normalised and lowercased before storing
- **Password** — minimum 8 characters enforced; no complexity rules server-side (complexity is handled by zxcvbn on the frontend)
- **Names / country** — optional, no server-side validation beyond field type

## Consequences

- Users stay logged in for up to 7 days without re-entering credentials
- A stolen access token is valid for at most 60 minutes
- A stolen refresh token can only be used once before rotation detects reuse (future: add reuse detection to revoke entire session)
- `refresh_tokens` table grows over time — a cleanup job for expired tokens will be needed
- Soft-deleted accounts occupy an email address for up to 30 days; the nightly cleanup job frees it
- GDPR/PDPA erasure requests require a separate hard-delete path (not yet implemented)
