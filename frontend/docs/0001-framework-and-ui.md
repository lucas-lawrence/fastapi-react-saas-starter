# 0001 — Framework and UI Library

## Decision
- **Vite + React + TypeScript** over Next.js
- **Tailwind CSS v4** for styling
- **shadcn/ui** as the component library

## Why Vite over Next.js
The frontend is a SaaS dashboard — content is behind a login wall, so SSR and SEO are not meaningful benefits. Vite is faster to build with, simpler to reason about, and avoids Next.js-specific abstractions (server components, app router) that add overhead without benefit at this stage.

## Why shadcn/ui
Components are copied into the codebase rather than imported from a package. This means full ownership — no upstream breaking changes, easy to customise per component. Pairs naturally with Tailwind.

## Conventions
- All shadcn components live in `src/components/ui/`
- Custom components live in `src/components/layout/`, `src/components/sections/`, or `src/components/global/`
- Path alias `@/` maps to `src/`
- New shadcn components: run `npx shadcn@latest add <component>`, then move from `@/` to `src/` if needed
