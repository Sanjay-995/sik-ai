# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Sik AI (`artifacts/sikai`) — Mobile App
Premium iOS fitness app for body scanning & measurement tracking.

- **Bundle ID**: com.sikai.bodyscanner
- **Theme**: Dark (#0A0A0A bg, #1A1A1A cards, #10B981 emerald accent)
- **Framework**: Expo + React Native, iOS 17+

#### Screens (9)
1. **Onboarding** — Multi-step welcome + profile setup
2. **Dashboard** (`/(tabs)`) — Body diagram, score ring, key metrics, measurements grid
3. **Scan** (`/(tabs)/scan`) — Simulated LiDAR AR scan with animated UI
4. **AI Coach** (`/(tabs)/coach`) — Chat interface with AI fitness coaching
5. **History** (`/(tabs)/history`) — Scan history list with summary stats
6. **Progress** (`/(tabs)/progress`) — Charts for all 11 metrics, 8-week summary
7. **Compare** (`/compare`) — Side-by-side scan comparison table
8. **Settings** (`/settings`) — Profile, notifications, data management
9. **Paywall** (`/paywall`) — Free/Pro $14.99/Annual $99.99 plans

#### Body Parts Tracked (11)
chest, waist, hips, leftArm, rightArm, leftThigh, rightThigh, neck, shoulders, bodyFat, muscleMass

#### Data
- 8 weeks of seeded mock scan data (auto-generated on first launch)
- Stored via AsyncStorage

#### Navigation
- 5-tab custom tab bar: Dashboard · Scan · Coach · History · Progress
- Supports NativeTabs (iOS 26 liquid glass) + classic BlurView fallback

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm run db:up` — start Docker Postgres (`docker-compose.yml`)
- `pnpm run db:push` — apply Drizzle schema (reads `artifacts/api-server/.env`; copy from `.env.example` first)
- `pnpm --filter @workspace/db run push` — same as db:push without dotenv-cli wrapper
- `pnpm --filter @workspace/api-server run dev` — run API server locally (set `PORT`, optional `DATABASE_URL`, `OPENAI_API_KEY` for `/api/scans` and `/api/coach`)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
