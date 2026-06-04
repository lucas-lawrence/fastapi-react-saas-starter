# 0007 — Settings Pages

## Context

Users need a place to update their profile and change their password after registration.

## Decision

### Route structure

```
/settings              → redirects to /settings/profile
/settings/profile      → ProfileSettings
/settings/password     → PasswordSettings
```

`Settings.tsx` is the layout shell (uses `AppLayout`, renders a left nav + `<Outlet>`). Sub-pages are in `src/pages/settings/`.

### Left nav

Two links — Profile and Password — with active-link highlight based on `location.pathname`. Adding new settings sections means adding a link to the `NAV` array in `Settings.tsx` and a new route in `App.tsx`.

### Profile settings

Fields: first name, last name, email, country. Pre-filled from `AuthContext.user`. On save:
1. Calls `updateUser` GraphQL mutation with only the changed fields
2. Calls `refreshUser()` to sync `AuthContext` with the updated server state

### Password settings

Fields: current password, new password (with zxcvbn strength meter), confirm new password. Same strength rules as registration (score ≥ 2). Current password is verified server-side before the new hash is stored.

### CountrySelect component

Reusable combobox at `src/components/ui/CountrySelect.tsx`. Used in both registration and profile settings:
- Type to filter 249 countries
- Click to select — stores ISO 3166-1 alpha-2 code, displays full name
- Click outside resets input to the last valid selection
- Country list is computed once at module load (not per render)

## Consequences

- Profile and password are intentionally split — reduces form length and avoids accidental password clears
- `refreshUser()` makes an extra `me` query after each profile save — acceptable given infrequent saves
- Email change takes effect immediately; the current JWT still contains the old email as `sub` and will work until it expires (60 min max), after which the user must log in again with the new email

## Related
- [ADR 0002 — Auth strategy](../adr/0002-auth-strategy.md)
- [FE 0004 — Registration flow](0004-registration-flow.md)
- [FE 0005 — App shell](0005-app-shell.md)
