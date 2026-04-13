# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- **Scan data shape:** The `Scan` type (defined in `context/AppContext.tsx`) stores 11 measurements in cm/inches plus a score (0–100), date (ISO 8601), and optional `photoUri`.
