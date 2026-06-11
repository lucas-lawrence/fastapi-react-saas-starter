# 0002 — Styling and Theme

## Dark mode

- **Default: dark mode for all users**
- User preference stored in `localStorage` under key `"theme"`
- OS preference is ignored — product default takes precedence
- Toggle available inside the app (icon button in `AppHeader`); no toggle on the landing page

### How it works

1. `index.html` contains an inline script that runs before React loads — reads `localStorage` and applies `.dark` to `<html>` immediately, preventing flash
2. `ThemeProvider` (`src/context/ThemeContext.tsx`) manages theme state and syncs to `localStorage` on change
3. shadcn/ui CSS variables handle all colour switching via the `.dark` class on `<html>`

Switching to light only happens when the user explicitly toggles — stored in `localStorage` as `"light"` and persists across sessions.

### Why dark mode default

Most developer-facing and modern SaaS products default to dark. It sets the visual tone of the product from first load.

---

## Visual design system

The product follows a **liquid glass / floating pill** aesthetic — modern, light, and premium on the landing/auth pages; full-width glass shell in the authenticated app.

### Floating pill navbar (landing page only)

The landing page navbar floats above the page as a centered pill, not a full-width bar.

- `fixed top-4`, centered with `max-w-4xl`, `rounded-full`
- Glass effect: `bg-white/60 backdrop-blur-md` at rest → `bg-white/85 backdrop-blur-xl shadow-lg` on scroll
- All interactive items inside use `rounded-full` to match the pill language
- **Does not apply to the app shell** — `AppHeader` and `AppSidebar` keep their full-width layout

### Soft gradient backgrounds

Landing and auth pages use a layered gradient rather than a flat background:

- **Base layer:** `bg-gradient-to-b from-blue-50/80 via-white to-white`
- **Hero radial bloom:** secondary radial gradient in `indigo/violet` at ~15% opacity behind the heading
- Dark mode: `dark:from-indigo-950/30 dark:via-background dark:to-background`

The gradient lives on the page wrapper, not in global CSS — non-landing pages are unaffected.

### Glass morphism

Dropdowns, modals, floating panels, and auth cards use glass morphism:

- **Overlays / dropdowns:** `bg-white/90 dark:bg-black/90 backdrop-blur-xl`, border `border-white/20 dark:border-white/10`, `rounded-2xl`
- **Auth page cards:** `bg-white/70 backdrop-blur-xl border-black/8 shadow-lg rounded-2xl`
- **App page content cards:** `bg-white/60 dark:bg-white/5 backdrop-blur-sm border-black/6 rounded-2xl` (no `shadow-lg` — app shell background is already neutral)

### App header (authenticated shell)

- `sticky top-0 bg-background/85 backdrop-blur-xl border-b border-black/6`
- **Search input** — `rounded-full` pill, `border border-black/8`
- **Icon buttons** (theme, notifications, settings) — grouped in a `rounded-full border bg-muted/30` pill container
- **Avatar dropdown** — `rounded-2xl bg-white/90 backdrop-blur-xl border-black/8 shadow-xl`; menu items `rounded-xl`

The app header is intentionally full-width — it anchors the page and holds search + grouped actions.

### App sidebar

- `bg-background/95 backdrop-blur-xl border-r border-black/6`
- Close button: `rounded-full`
- Nav items: `rounded-xl`; active state `bg-black/6 dark:bg-white/8` (no heavy fill)

### Radius language

| Element | Radius |
|---|---|
| Navbar pill / pill containers | `rounded-full` |
| Buttons inside navbar / form submits | `rounded-full` |
| Standard buttons | shadcn default (`--radius`) |
| Cards / panels | `rounded-2xl` |
| Dropdowns / popovers | `rounded-2xl` |
| Menu items | `rounded-xl` |
| Badges / chips | `rounded-full` |

### Colour palette

The palette stays within the existing shadcn/Tailwind token system — no custom colour tokens. Gradients use `blue-50`, `indigo-50`, `indigo-950` with opacity modifiers.

The violet/blue gradient on the hero heading (`from-violet-500 via-blue-500 to-cyan-500`) is the brand accent. Do not introduce additional accent gradients without updating this doc.

### Rules to follow

- All new landing page sections inherit the gradient wrapper — no per-section background needed
- New floating elements (tooltips, command palettes, drawers) use the glass morphism pattern
- Do not apply the floating pill or gradient to `AppHeader`
- In dark mode, gradients are very subtle by design — avoid bright coloured gradients on dark backgrounds
