# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current Project Context

This repository is being developed under the **GSD (Get Shit Done)** workflow. Always read these planning docs before making non-trivial decisions:

- [.planning/PROJECT.md](.planning/PROJECT.md) — current project vision, requirements, scope, and key decisions. **The "Out of Scope" section is binding** — do not propose work that contradicts it.
- [.planning/REQUIREMENTS.md](.planning/REQUIREMENTS.md) — 47 v1 requirements with REQ-IDs, mapped to phases.
- [.planning/ROADMAP.md](.planning/ROADMAP.md) — 4-phase roadmap; check current phase before suggesting work.
- [.planning/STATE.md](.planning/STATE.md) — phase progress / current focus.
- [.planning/research/SUMMARY.md](.planning/research/SUMMARY.md) — top-level research synthesis (stack, architecture, pitfalls, features).
- [.planning/codebase/](.planning/codebase/) — pre-existing codebase map (architecture, structure, conventions, concerns, etc.).

**v1 scope summary (read this first):** Sik AI v1 ships an iOS body-measurement app for the **weight-loss audience only**, using Apple Vision 3D body pose + ARKit + cylindrical heuristics for ~±2cm test-retest reproducibility. **No parametric body-shape model in v1** (SMPL/SMPL-X are non-commercial-licensed by MPI-IS — sidestepped entirely for v1). Gym / hypertrophy-grade precision is explicitly v2 territory. All data on-device. iOS only.

**Workflow guidance:**
- Use `/gsd-progress` to see current phase status.
- Use `/gsd-plan-phase N` before executing on a phase.
- Use `/gsd-execute-phase N` to run a planned phase.
- Don't bypass the spike (Phase 1) — its go/no-go decision gates everything downstream.

## Repository Overview

pnpm workspace monorepo. The primary deliverable is a React Native / Expo app (`artifacts/sikai`). The rest of the workspace contains supporting infrastructure (API server, shared libs, a web-based mockup sandbox).

**Package manager:** pnpm (enforced — `npm` and `yarn` are blocked by a preinstall script)  
**Node.js:** 24  
**TypeScript:** 5.9

## Workspace Structure

```
artifacts/
  sikai/            — @workspace/sikai   — Expo/React Native iOS app (primary)
  api-server/       — @workspace/api-server — Express 5 API (esbuild CJS bundle)
  mockup-sandbox/   — @workspace/mockup-sandbox — Vite + React web sandbox for UI prototypes
lib/
  api-spec/         — @workspace/api-spec — OpenAPI spec (openapi.yaml) + Orval codegen config
  api-client-react/ — @workspace/api-client-react — React Query hooks (Orval-generated)
  api-zod/          — @workspace/api-zod — Zod schemas (Orval-generated)
  db/               — @workspace/db — PostgreSQL schema via Drizzle ORM + drizzle-zod
scripts/            — workspace utility scripts
```

## Common Commands

Run from repo root unless otherwise noted.

```bash
# Install all workspace dependencies
pnpm install

# Typecheck all packages (libs first, then artifacts)
pnpm run typecheck

# Build everything (typecheck + build all packages)
pnpm run build

# Run the Expo dev server (run from artifacts/sikai/)
cd artifacts/sikai && npx expo start

# Run Expo with cleared Metro cache
cd artifacts/sikai && npx expo start --clear

# Run the API server in dev mode
pnpm --filter @workspace/api-server run dev

# Run the mockup sandbox (Vite)
pnpm --filter @workspace/mockup-sandbox run dev

# Regenerate API client hooks + Zod schemas from openapi.yaml
pnpm --filter @workspace/api-spec run codegen

# Push DB schema changes to PostgreSQL (dev only)
pnpm --filter @workspace/db run push
```

## Architecture

### Mobile App (`artifacts/sikai`)

- **Framework:** Expo SDK 54 / React Native 0.81, New Architecture enabled
- **Navigation:** Expo Router (file-based). Entry: `app/_layout.tsx` (root layout + `AppContext` provider) → `app/index.tsx` (redirects to onboarding or tabs)
- **State:** Single global `AppContext` (`context/AppContext.tsx`) — owns all scan data, seeds 8 weeks of mock data on first launch, persists to AsyncStorage
- **Styling:** Dark-only theme. All color tokens are in `constants/colors.ts`; components consume them via the `useColors()` hook (`hooks/useColors.ts`)
- **Key complex components:**
  - `components/LiDARScanner.tsx` — 500+ SVG dot point cloud, scan beam, HUD overlay
  - `components/CameraBackground.tsx` — static noise pixels, scanlines, vignette
  - `components/ARScanAnimation.tsx` — AR bracket animations
- **Babel:** React Compiler plugin + Reanimated plugin (both required — do not remove)
- **Platform:** iOS only, portrait, iOS 17+

### API Server (`artifacts/api-server`)

- Express 5 + pino logging. Routes are mounted under `/api/`.
- Built to `dist/index.mjs` via esbuild (see `build.mjs`).
- Depends on `@workspace/api-zod` for request/response validation and `@workspace/db` for database access.

### Code Generation Flow

`lib/api-spec/openapi.yaml` is the source of truth for the API contract.

Running `pnpm --filter @workspace/api-spec run codegen` (Orval) produces:
- `lib/api-client-react/src/generated/` — React Query hooks (TanStack Query v5)
- `lib/api-zod/src/generated/` — Zod v4 schemas

**Never hand-edit files in these `generated/` directories** — they are overwritten by codegen.

### Database (`lib/db`)

- PostgreSQL + Drizzle ORM. Schema in `lib/db/src/schema/`.
- `drizzle-zod` auto-generates Zod schemas from Drizzle table definitions.
- `pnpm --filter @workspace/db run push` applies schema to DB in dev.

### Mockup Sandbox (`artifacts/mockup-sandbox`)

- Vite + React + Tailwind v4 + shadcn/ui (full Radix component set).
- Used for rapid UI prototyping, independent of the mobile app.

## Key Conventions

- **pnpm catalog** (`pnpm-workspace.yaml`) pins shared dependency versions (react, zod, vite, tailwind, etc.). Use `catalog:` in `package.json` instead of explicit versions for cataloged packages.
- **Supply-chain safety:** `minimumReleaseAge: 1440` is set in `pnpm-workspace.yaml`. Do not disable it. Add exceptions to `minimumReleaseAgeExclude` only for trusted publishers when urgently needed.
- **esbuild platform overrides:** The `overrides` block in `pnpm-workspace.yaml` strips all non-linux-x64 esbuild/rollup/lightningcss binaries. This is intentional for the Replit hosting environment — do not remove these overrides.
- **Scan data shape:** The actual type is `ScanRecord` (defined in `artifacts/sikai/context/AppContext.tsx`) — `BodyMeasurement` (11 numeric fields) + `weight` + `bmi` + `score` (0–100) + ISO 8601 `date` + optional `notes`. There is **no `photoUri` field** (raw images must never be persisted — see PRIV-02). Do not re-add it.
- **Mock-data seeding:** `generateMockData()` in `AppContext.tsx` seeds 8 weeks of fake `ScanRecord`s on first launch. v1 removes this from the default path (DATA-01) and exposes it only via opt-in demo mode (DEMO-01). Do not extend the mock data; replace it.
- **Existing scan UI is a facade.** The animated LiDAR point cloud, AR brackets, and "camera" background are visual-only — no real capture, no real measurement, no body model. v1 replaces the engine while keeping these visuals as polish on top of real capture (CAP-07).
