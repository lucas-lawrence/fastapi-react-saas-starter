# 0009 — Visual Style

**Status:** Accepted

## Context

The landing page needed a design direction that would hold consistently as new pages and components are added. The goal is a modern, light, premium feel — similar to contemporary SaaS products — without being opinionated about content layout.

## Decision

### Floating pill navbar

The landing page navbar floats above the page as a centered pill, not a full-width bar.

- `fixed top-4`, centered with `max-w-4xl`, `rounded-full`
- Glass effect: `bg-white/60 backdrop-blur-md` at rest → `bg-white/85 backdrop-blur-xl shadow-lg` on scroll
- All interactive items inside the navbar use `rounded-full` to match the pill language
- This pattern applies to the **landing page only** — the authenticated app shell (`AppHeader`, `AppSidebar`) keeps its full-width layout

### Soft gradient backgrounds

Pages use a layered gradient approach rather than a flat background:

- **Base layer:** `bg-gradient-to-b from-blue-50/80 via-white to-white` — a very subtle blue tint fades to white
- **Hero radial bloom:** a secondary radial gradient behind the heading using `indigo/violet` at low opacity (`~15%`) to give the hero a glowing centre without being garish
- Dark mode mirrors this: `dark:from-indigo-950/30 dark:via-background dark:to-background`

The gradient lives on the page wrapper, not in global CSS, so non-landing pages are unaffected.

### Glass morphism on overlays

Dropdowns, modals, and floating panels use glass morphism:

- `bg-white/90 dark:bg-black/90 backdrop-blur-xl`
- Border: `border border-white/20 dark:border-white/10`
- Corner radius: `rounded-2xl` (not `rounded-full` — that is reserved for pill-shaped nav items)

### Radius language

| Element | Radius |
|---|---|
| Navbar pill | `rounded-full` |
| Buttons inside navbar | `rounded-full` |
| Standard buttons | shadcn default (inherits `--radius`) |
| Cards / panels | `rounded-2xl` or `rounded-xl` |
| Dropdowns / popovers | `rounded-2xl` |
| Badges / chips | `rounded-full` |

### Color palette notes

The palette stays within the existing shadcn/Tailwind token system — no custom color tokens are added. The gradient uses Tailwind's built-in `blue-50`, `indigo-50`, and `indigo-950` with opacity modifiers.

The violet/blue gradient on the hero heading (`from-violet-500 via-blue-500 to-cyan-500`) remains the brand accent. Do not introduce additional accent gradients without updating this doc.

### App header (authenticated shell)

The authenticated `AppHeader` uses the same glass treatment as the landing navbar but full-width:

- `sticky top-0 bg-background/85 backdrop-blur-xl border-b border-black/6`
- **Search input** — `rounded-full` pill with `border border-black/8`
- **Icon buttons** (theme, notifications, settings) — grouped inside a single `rounded-full border bg-muted/30` pill container
- **Avatar dropdown** — `rounded-2xl bg-white/90 backdrop-blur-xl border border-black/8 shadow-xl`; menu items use `rounded-xl`

The app shell header is intentionally **full-width** (not a floating pill like the landing navbar). It anchors the page and provides space for search + grouped actions.

### App sidebar

- `bg-background/95 backdrop-blur-xl border-r border-black/6`
- Close button: `rounded-full`
- Nav items: `rounded-xl`; active state uses `bg-black/6 dark:bg-white/8` (no heavy fill)

### Page content cards

App pages wrap their main content sections in glass cards:

```tsx
<div className="rounded-2xl border border-black/6 dark:border-white/6 bg-white/60 dark:bg-white/5 backdrop-blur-sm p-6">
  ...
</div>
```

This is lighter than the auth page cards (no `shadow-lg`) — the app shell background is already neutral, so heavy shadows would feel out of place.

### Submit / primary action buttons inside app pages

Use `rounded-full` on form submit buttons to maintain pill language consistency throughout the product.

## Consequences

- All new landing page sections should inherit the gradient background naturally — no per-section background needed
- New floating elements (tooltips, command palettes, sheet drawers) should use the glass morphism pattern above
- The app shell (authenticated area) is intentionally distinct from the landing page — do not apply the floating pill or gradient to `AppHeader`
- When dark mode is active, the gradient is very subtle by design — avoid adding bright coloured gradients to dark backgrounds
