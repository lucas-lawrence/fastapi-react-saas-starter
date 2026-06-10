# 0006 — Page Titles

## Context

Browser tab titles help users identify tabs and are picked up by bookmarks and browser history. In a React SPA the `<title>` tag in `index.html` is static, so each page sets `document.title` via `useEffect`.

## Current titles

| Page | Route | Title |
|---|---|---|
| Landing | `/` | `SaaS` |
| Sign in | `/login` | `SaaS · Sign in` |
| Create account | `/register` | `SaaS · Create account` |
| Home | `/home` | `SaaS Home` |
| Dashboard | `/dashboard` | `SaaS · Dashboard` |

## Convention

_To be filled in._

## Related
- [FE 0005 — App shell](0005-app-shell.md)
