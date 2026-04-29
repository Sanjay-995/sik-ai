# Testing

**Mapped:** 2026-04-29

## Status

**No automated tests exist in this repository.**

## Evidence

- No test files found anywhere in the workspace (zero `*.test.*`, `*.spec.*`, `__tests__/`).
- No test runner configured: no `jest.config.*`, `vitest.config.*`, `playwright.config.*`, or equivalent.
- No `test` script in any `package.json` across the workspace (`artifacts/sikai`, `artifacts/api-server`, `artifacts/mockup-sandbox`, `lib/*`, root).
- No testing dependencies: no Jest, Vitest, Mocha, `@testing-library/*`, Detox, Playwright, Cypress, or supertest in `package.json` files.
- No CI configuration found that runs tests.

## What Exists Instead

The only automated quality check is **type checking**:

```bash
pnpm run typecheck   # Runs tsc --noEmit across libs then artifacts
```

Each package implements `typecheck` independently; the root script chains them.

There is no linter (no ESLint config), no pre-commit hook, no CI pipeline visible in this repo.

## Implications

- All correctness verification today is manual: running the Expo dev server and exercising the app, or hitting API endpoints by hand.
- Refactors carry no safety net beyond TypeScript's structural guarantees.
- The Orval codegen flow (`openapi.yaml` → React Query hooks + Zod schemas) provides some compile-time alignment between client and server, but no runtime verification.

## Recommendations (for future planning)

If a phase introduces tests, the natural choices for this stack are:

| Layer | Recommended runner | Reason |
|-------|---------------------|--------|
| `lib/*` (pure TS) | Vitest | Fast, ESM-native, matches Vite already used by mockup-sandbox |
| `artifacts/api-server` | Vitest + supertest | Express 5 + ESM; supertest covers HTTP integration |
| `artifacts/sikai` (RN) | Jest + `@testing-library/react-native` | Standard Expo / RN testing stack |
| End-to-end iOS | Detox or Maestro | RN-native E2E; Detox is more established, Maestro is simpler |
| `artifacts/mockup-sandbox` | Vitest + `@testing-library/react` | Already Vite-based |

These are observations only — no testing decision has been made.

---
*Last mapped: 2026-04-29*
