# Concerns

**Mapped:** 2026-04-29
**Source signals:** code inspection, `CLAUDE.md`, parallel mapper outputs.

This document captures technical debt, risks, and fragile areas. It is not exhaustive; it focuses on items that are likely to influence near-term planning.

---

## 1. Backend stack is scaffolding only

**Severity:** High — likely the biggest gap.

The `artifacts/api-server`, `lib/db`, and `lib/api-spec` packages exist with full tooling (Express 5, Drizzle, Orval, Zod codegen) but contain almost no actual product code:

- `artifacts/api-server/src/routes/` exposes only `/healthz` (`artifacts/api-server/src/routes/health.ts`).
- `lib/db/src/schema/index.ts` is a commented-out template — no tables defined.
- `lib/api-spec/openapi.yaml` (36 lines) defines only the `HealthStatus` schema.
- `artifacts/sikai/package.json` declares `@workspace/api-client-react` as a dependency, but a workspace-wide grep finds **zero imports** of it in `artifacts/sikai/`.

**Implication:** the mobile app is fully decoupled from the backend. Any new feature that needs persistence or sync across devices requires building the entire data layer first (schema → migration → API route → openapi spec → codegen → wire client into app).

**Where to look:** `artifacts/api-server/src/`, `lib/db/src/schema/`, `lib/api-spec/openapi.yaml`.

---

## 2. Mobile app stores all state locally with seeded mock data

**Severity:** Medium — intentional for demo, blocking for production.

`artifacts/sikai/context/AppContext.tsx` (214 lines) is the entire app state:

- On first launch, `generateMockData()` seeds **8 weeks of fake `ScanRecord`s** to populate the UI.
- All state persists only to AsyncStorage; nothing leaves the device.
- A hardcoded `defaultProfile` (`"Alex Johnson"`, age 28, height 178cm, etc.) is created if no profile exists.
- The `try/catch` on hydration silently swallows errors — corrupt or schema-drifted data falls back to mock seeds with no telemetry.

**Implication:** a real user's data could be silently overwritten by mock data after a schema change to `ScanRecord` or `UserProfile`. There is no migration story for AsyncStorage.

**Where to look:** `artifacts/sikai/context/AppContext.tsx:156` (catch block), `generateMockData()` function.

---

## 3. CLAUDE.md description of `Scan` is stale

**Severity:** Low — documentation drift.

`CLAUDE.md` says:

> The `Scan` type (defined in `context/AppContext.tsx`) stores 11 measurements in cm/inches plus a score (0–100), date (ISO 8601), and optional `photoUri`.

The actual type is `ScanRecord` (not `Scan`); it has `BodyMeasurement` (11 numeric fields), `weight`, `bmi`, `score`, `date`, `notes?` — and **no `photoUri` field**. Either the doc is out of date or the field was removed.

**Where to look:** `artifacts/sikai/context/AppContext.tsx` (top of file) vs `CLAUDE.md` "Mobile App" section.

---

## 4. No automated tests anywhere

**Severity:** Medium — accelerates as the codebase grows.

Already detailed in `TESTING.md`. Worth restating here because it compounds every other concern: there is no safety net for the AppContext migration story, the LiDAR rendering performance, the eventual API integration, or the codegen pipeline.

---

## 5. Performance-sensitive components

**Severity:** Medium — hard to measure without instrumentation, easy to regress.

`CLAUDE.md` flags three components as complex; line counts confirm:

- `artifacts/sikai/components/LiDARScanner.tsx` (612 lines) — 500+ animated SVG dots forming a point cloud, plus scan beam and HUD overlay. SVG re-renders are expensive in React Native; this is the most likely source of frame drops.
- `artifacts/sikai/components/CameraBackground.tsx` (218 lines) — static noise pixels, scanlines, vignette. If rendered every frame, it taxes the GPU.
- `artifacts/sikai/components/ARScanAnimation.tsx` (253 lines) — AR bracket animations (Reanimated).

The **React Compiler** (Babel plugin) is enabled, which should memoize most renders, but there are no benchmarks in the repo and no Reanimated worklet boundaries documented.

**Where to look:** `artifacts/sikai/components/LiDARScanner.tsx`, `babel.config.js` (compiler + reanimated plugins).

---

## 6. Largest screen is `scan.tsx` at 729 lines

**Severity:** Low — readability/maintainability.

`artifacts/sikai/app/(tabs)/scan.tsx` is the largest source file in the app (729 lines), followed by `LiDARScanner.tsx` (612). The screen likely orchestrates the LiDAR overlay, AR animations, camera background, capture flow, and result handoff. Worth a future refactor pass to extract sub-components, but not urgent.

**Where to look:** `artifacts/sikai/app/(tabs)/scan.tsx`.

---

## 7. CORS is unrestricted on the API server

**Severity:** Low today (no real endpoints), High the moment auth ships.

`artifacts/api-server/src/app.ts` calls `app.use(cors())` with no options — every origin is allowed. Acceptable while only `/healthz` exists, but must be tightened before the API serves authenticated data.

**Where to look:** `artifacts/api-server/src/app.ts:30`.

---

## 8. Required env vars throw at module load with no fallback

**Severity:** Low — operational ergonomics.

`lib/db/src/index.ts:7` and `artifacts/api-server/src/index.ts:6` throw immediately if `DATABASE_URL` / `PORT` are missing. This is reasonable for production but means the mobile app's dev workflow cannot start the API server without a Postgres URL set, even for tasks that don't touch the DB.

**Where to look:** `lib/db/src/index.ts`, `artifacts/api-server/src/index.ts`.

---

## 9. Mockup sandbox carries the full shadcn/ui Radix tree

**Severity:** Low — maintenance overhead, not a bug.

`artifacts/mockup-sandbox/` ships every shadcn UI component (sidebar — 714 lines, chart — 365 lines, calendar — 213 lines, etc.) but the actual mockups (`SikAICombined.tsx` — 506 lines) presumably use a small subset. Dead components increase bundle size and maintenance cost. No urgency — sandbox is throwaway by design.

**Where to look:** `artifacts/mockup-sandbox/src/components/ui/`.

---

## 10. No CI, no linter, no pre-commit hook

**Severity:** Medium — process risk.

The only automated check is `pnpm run typecheck`, run manually. There is no:

- ESLint configuration
- Pre-commit hook (no Husky / lefthook in `package.json`)
- CI pipeline visible in this repo (no `.github/workflows/`, no `.gitlab-ci.yml`, no `circle.yml`)

Generated code under `lib/*/src/generated/` could drift from `openapi.yaml` and nothing would catch it until someone notices a runtime error.

---

## 11. iOS-only, portrait-only, no Android target

**Severity:** Informational — explicit scope.

`CLAUDE.md` documents this as intentional. Worth flagging because every cross-platform abstraction (e.g. `react-native-permissions`) is currently only validated against iOS. Adding Android later will surface platform-specific bugs that have never been exercised.

---

## What is *not* a concern

A few signals that look healthy:

- **Zero `TODO`/`FIXME`/`HACK`/`@ts-ignore`** anywhere in the codebase. Either very disciplined or very young — both fine.
- **No committed `.env` files** in the working tree.
- **`minimumReleaseAge: 1440`** + `pnpm` enforcement gives meaningful supply-chain protection.
- **Strict TypeScript everywhere**, with shared types via workspace packages.
- **OpenAPI-first contract** with codegen for both Zod and React Query — solid foundation when the backend gets fleshed out.

---

*Last mapped: 2026-04-29*
