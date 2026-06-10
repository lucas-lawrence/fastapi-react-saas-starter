# 0003 — Auth Token Storage

## Decision
- **Access token** → `sessionStorage`
- **Refresh token** → `localStorage`

## Why sessionStorage for access token
Access tokens are short-lived (15 min). Storing in memory (`sessionStorage`) means they're cleared when the tab closes — reducing exposure. Not accessible across tabs, which is acceptable since each tab can silently refresh independently.

## Why localStorage for refresh token
Refresh tokens need to survive page reloads and browser restarts to keep the user logged in across sessions (7-day expiry). `localStorage` persists until explicitly cleared.

## Trade-offs
- Both are accessible to JavaScript — XSS is the main risk. Mitigated by keeping `CORS_ORIGINS` strict and sanitising any user-generated content rendered in the app.
- A more secure alternative is `HttpOnly` cookies for the refresh token (not accessible to JS at all). This is the recommended approach when the frontend and backend share a domain. Worth revisiting before production.

## Related
- See [ADR 0002](../adr/0002-auth-strategy.md) for the backend token strategy (rotation, expiry).
