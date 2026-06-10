# 0004 — Registration Flow

## Context

Needed a registration page that collects enough information to identify the user, validates input on both client and server, and logs them in automatically after sign-up.

## Decision

### Fields collected at registration
- **First name** + **Last name** — required, side-by-side
- **Email** — required
- **Country** — required, ISO 3166-1 alpha-2 code stored; searchable combobox (`CountrySelect` component) — type to filter, click to select; list from `i18n-iso-countries` (249 countries)
- **Password** + **Confirm password** — required

### Validation layers

| Rule | Where |
|---|---|
| Email format (must have TLD) | Frontend regex + backend `email-validator` |
| Email uniqueness | Backend |
| Email stored lowercase | Backend (`.lower()` after normalisation) |
| Password min 8 characters | Backend |
| Password strength score ≥ 2 (Fair) | Frontend only (`zxcvbn`) |
| Passwords match | Frontend only |

### Post-registration flow
Register mutation → auto-login (calls `login` mutation with same credentials) → redirect to `/home`. No email verification gate at this stage (see pending tasks in CLAUDE.md).

### Password strength meter
`zxcvbn` runs client-side as the user types via `PasswordStrengthIndicator` (`src/components/ui/PasswordStrengthIndicator.tsx`) — a reusable component that accepts the password string and renders a 5-segment bar (red → green) with a label. Submission is blocked if score < 2. This is UX-only — the backend does not enforce complexity beyond minimum length.

### Shared validation
Password validation logic (match check + strength gate) lives in `src/lib/validation.ts` (`validatePassword`, `PASSWORD_MIN_SCORE`). Registration and the password-change settings page both import from there — any change to the rules applies everywhere.

## Consequences

- A user who bypasses the frontend (direct GraphQL call) can register with a weak-but-valid password as long as it's ≥ 8 characters
- Email verification is not required — a user can register with any syntactically valid email they don't own (to be addressed when email verification is added)
- Country is required on the form but optional in the backend mutation — enforcement is frontend-only

## Related
- [ADR 0002 — Auth strategy](../../docs/adr/0002-auth-strategy.md)
- [FE 0003 — Auth token storage](0003-auth-token-storage.md)
