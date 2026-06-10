# 0005 — App Shell

## Context

Needed a consistent chrome for all authenticated pages — navigation, user identity, and global actions — without duplicating layout code across every page.

## Decision

### AppLayout — auth guard + layout wrapper

All authenticated pages render inside `<AppLayout>`. It:
- Redirects to `/login` immediately if `isAuthenticated` is false
- Owns the sidebar open/close state and passes it to `AppHeader` and `AppSidebar`
- Renders `<AppHeader>` + `<AppSidebar>` + `<main>{children}</main>`

Any new internal page just wraps its content in `<AppLayout>` — no repeated auth logic.

### AppHeader

Sticky top bar (`h-14`, `z-50`, `backdrop-blur`). Layout left → right:

| Slot | Content |
|---|---|
| Left | Hamburger button (toggles sidebar) + logo/wordmark link to `/home` |
| Centre | Search bar (controlled input, `onChange` wiring pending) |
| Right | Theme toggle · Notifications bell · Settings link · Divider · Avatar |

Avatar shows initials (`FL` from first + last name, falls back to first name initial, then email initial). Clicking opens a dropdown with a user info header (larger avatar, full name, email) and links to Profile, Account settings, and Log out.

### AppSidebar

Slide-in drawer from the left (`w-60`, `transition-transform`). Includes:
- Semi-transparent backdrop — click to close
- Header with logo + close button
- Nav links defined in a `NAV_ITEMS` array at the top of the file — add entries there as pages are built
- Active link highlighted with `bg-muted`

### Page naming convention

| File | Route | Purpose |
|---|---|---|
| `Landing.tsx` | `/` | Public marketing/landing page |
| `AppHome.tsx` | `/home` | First page after login |
| `Dashboard.tsx` | `/dashboard` | Dashboard (stub, naming TBD) |

`Home.tsx` was renamed to `Landing.tsx` to remove ambiguity once `AppHome.tsx` was added.

### Post-login redirect

Both login and register redirect to `/home` after success. The logo link and session-expired redirects also target `/home`.

### AuthContext — user loading state

`AuthContext` exposes `userLoading: boolean`. On mount, if a token exists in `sessionStorage`, it fires a `me` query immediately:
- If `me` returns a user → `user` is set, `userLoading` → false
- If `me` returns null (expired/invalid token) → session is cleared, `isAuthenticated` → false
- If the network fails → session is left intact, `userLoading` → false (user can retry)

`AppHeader` shows a skeleton in the avatar and dropdown while `userLoading` is true.

## Consequences

- Every new internal page requires one `<AppLayout>` wrapper — consistent but requires discipline
- Sidebar nav items must be kept in sync manually in `AppSidebar.tsx`'s `NAV_ITEMS` array
- Search bar is wired visually but has no `onChange` handler yet (see pending tasks in CLAUDE.md)
- Notifications bell is a placeholder — no backend support yet

## Related
- [FE 0003 — Auth token storage](0003-auth-token-storage.md)
- [FE 0004 — Registration flow](0004-registration-flow.md)
- [ADR 0002 — Auth strategy](../../docs/adr/0002-auth-strategy.md)
