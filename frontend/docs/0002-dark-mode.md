# 0002 — Dark Mode Strategy

## Decision
- **Default: dark mode for all users**
- User preference stored in `localStorage` under key `"theme"`
- OS preference is ignored — product default takes precedence
- No toggle exposed on the landing page; toggle available inside the dashboard (future)

## Why dark mode default
Most developer-facing and modern SaaS products default to dark. It sets the visual tone of the product from first load.

## How it works
1. `index.html` contains an inline script that runs before React loads — reads `localStorage` and applies `.dark` to `<html>` immediately, preventing flash
2. `ThemeProvider` (`src/context/ThemeContext.tsx`) manages theme state and syncs to `localStorage` on change
3. shadcn/ui CSS variables handle all colour switching via the `.dark` class on `<html>`

## Switching to light
Only happens when the user explicitly toggles — stored in `localStorage` as `"light"`. Persists across sessions.
