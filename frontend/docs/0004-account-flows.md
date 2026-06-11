# 0004 — Account Flows (Registration and Settings)

## Registration

### Fields collected

- **First name** + **Last name** — required, side-by-side
- **Email** — required
- **Country** — required on the form (optional in the backend mutation — enforcement is frontend-only); ISO 3166-1 alpha-2 code stored; searchable combobox (`CountrySelect`) — type to filter, click to select; list from `i18n-iso-countries` (249 countries)
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

Register mutation → auto-login (calls `login` mutation with same credentials) → redirect to `/home`. No email verification gate at this stage.

### Password strength meter

`zxcvbn` runs client-side as the user types via `PasswordStrengthIndicator` (`src/components/ui/PasswordStrengthIndicator.tsx`) — a reusable component that accepts the password string and renders a 5-segment bar (red → green) with a label. Submission is blocked if score < 2. The backend does not enforce complexity beyond minimum length.

### Shared validation

Password validation logic (match check + strength gate) lives in `src/lib/validation.ts` (`validatePassword`, `PASSWORD_MIN_SCORE`). Registration and the password-change settings page both import from there — any change to the rules applies everywhere.

### Caveats

- A user who bypasses the frontend can register with a weak-but-valid password (≥ 8 chars)
- Email verification is not required — a user can register with a syntactically valid email they don't own
- Country is required on the form but not enforced server-side

---

## Settings pages

### Route structure

```
/settings              → redirects to /settings/profile
/settings/profile      → ProfileSettings
/settings/password     → PasswordSettings
```

`Settings.tsx` is the layout shell — uses `AppLayout`, renders a left nav + `<Outlet>`. Sub-pages live in `src/pages/settings/`.

### Left nav

Two links — Profile and Password — with active-link highlight based on `location.pathname`. To add a new settings section: add a link to the `NAV` array in `Settings.tsx` and a new route in `App.tsx`.

### Profile settings

Fields: first name, last name, email, country. Pre-filled from `AuthContext.user`. On save:
1. Calls `updateUser` GraphQL mutation
2. Calls `refreshUser()` to sync `AuthContext` with the updated server state — makes an extra `me` query, acceptable given infrequent saves

Email change takes effect immediately; the current JWT still contains the old email as `sub` and works until it expires (60 min max), after which the user must log in with the new email.

### Password settings

Fields: current password, new password (with `PasswordStrengthIndicator`), confirm new password. Uses the same `validatePassword()` / `PASSWORD_MIN_SCORE` threshold as registration. Current password is verified server-side before the new hash is stored.

Profile and password are intentionally split — reduces form length and avoids accidental password clears.

### CountrySelect component

Reusable combobox at `src/components/ui/CountrySelect.tsx`. Used in both registration and profile settings:

- Type to filter 249 countries
- Click to select — stores ISO 3166-1 alpha-2 code, displays full name
- Click outside resets input to the last valid selection
- Country list computed once at module load (not per render)

## Related

- [ADR 0002 — Auth strategy](../../backend/docs/0002-auth-strategy.md)
- [FE 0003 — Auth token storage](0003-auth-token-storage.md)
- [FE 0005 — App shell](0005-app-shell.md)
