# 0008 — Frontend Testing

## Context

The frontend needed a test suite that could run without a live backend and cover the logic most likely to drift: auth state management, form validation, and the shared validation rules that must stay consistent across pages.

## Decision

### Stack

| Tool | Role |
|---|---|
| Vitest | Test runner, co-located with Vite — no separate jest config |
| `@testing-library/react` | Component rendering + queries |
| `@testing-library/user-event` | Available; not yet used — `fireEvent` is sufficient for current tests |
| `@testing-library/jest-dom` | Extended matchers (`toBeInTheDocument`, `toBeDisabled`, etc.) |
| jsdom | Browser-like DOM environment |

Config lives in `vite.config.ts` (`test.environment: 'jsdom'`, `test.setupFiles`). Setup file: `src/test/setup.ts`.

### Test file location

Co-located alongside source — `AuthContext.test.tsx` lives next to `AuthContext.tsx`. No separate `__tests__` directory.

### What's covered

| File | Tests | What |
|---|---|---|
| `src/lib/validation.test.ts` | 5 | `validatePassword` — mismatch, strength gate, `PASSWORD_MIN_SCORE` value, error priority |
| `src/context/AuthContext.test.tsx` | 5 | `login`, `logout`, `register`, error propagation, initial unauthenticated state |
| `src/pages/Login.test.tsx` | 3 | Credentials passed correctly, error on failed login, button disabled while loading |
| `src/pages/Register.test.tsx` | 5 | Email format, password mismatch, weak password, valid submission, API error |
| `src/pages/settings/PasswordSettings.test.tsx` | 4 | Password mismatch, weak password, successful update, API error |

### Scripts

```
npm test          # watch mode
npm run test:run  # single pass (CI)
```

## Conventions

### Mocking `@/lib/api`

Tests that render components using `gql` mock the module at the top of the file:

```ts
vi.mock('@/lib/api', () => ({ gql: vi.fn() }))
import { gql } from '@/lib/api'
const mockGql = vi.mocked(gql)
```

### Mocking `useAuth`

Form component tests mock the context rather than rendering a real `AuthProvider`. This keeps each test focused on one layer:

```ts
vi.mock('@/context/AuthContext', () => ({ useAuth: vi.fn() }))
mockUseAuth.mockReturnValue({ isAuthenticated: false, login: mockLogin, ... })
```

### Submitting forms

Use `fireEvent.submit(container.querySelector('form')!)` instead of clicking the submit button. Clicking a `type="submit"` button triggers HTML5 constraint validation (e.g. `type="email"` rejects `not-an-email` before `onSubmit` fires), which prevents our custom validation messages from being tested.

### localStorage / sessionStorage in AuthContext tests

Vitest 4 + jsdom ships a custom localStorage implementation that does not expose the full `Storage` API (`setItem`, `removeItem`, etc. are absent). AuthContext tests stub both globals with a plain in-memory implementation using `vi.stubGlobal`:

```ts
beforeEach(() => {
  mockSession = makeMockStorage()
  mockLocal = makeMockStorage()
  vi.stubGlobal('sessionStorage', mockSession)
  vi.stubGlobal('localStorage', mockLocal)
})
afterEach(() => vi.unstubAllGlobals())
```

### Cleanup

`@testing-library/react` auto-cleanup requires `afterEach` to be a global. Because Vitest defaults to `globals: false`, the setup file registers cleanup explicitly:

```ts
// src/test/setup.ts
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
afterEach(cleanup)
```

## Consequences

- Validation unit tests in `validation.test.ts` are the single source of truth for password rules — if the threshold changes, only that file needs updating and both Register and PasswordSettings are covered
- AuthContext tests call the real provider with a mocked `gql`; they do not test the network layer
- No route-guard tests yet — the app has no guard wrapper components; guards are inline redirects in each page component

## Related
- [FE 0004 — Registration flow](0004-registration-flow.md)
- [FE 0007 — Settings pages](0007-settings.md)
