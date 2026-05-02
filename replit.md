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
- **AI**: OpenAI gpt-5.1 Vision via Replit AI Integrations proxy

## Artifacts

### API Server (`artifacts/api-server`)
Express 5 API server with OpenAI Vision integration.

#### Endpoints
- `GET /api/healthz` — Health check
- `POST /api/scan/analyze` — AI body scan analysis (GPT Vision)
  - Accepts: `frontImage` (base64 JPEG), optional `sideImage`, `profile` (height/weight/age/gender/goal)
  - Returns: `measurements` (11 body zones in cm), `weight`, `bmi`, `score` (40–100), `insights` (AI text)

### Sik AI (`artifacts/sikai`) — Mobile App
Premium iOS fitness app for body scanning & measurement tracking.

- **Bundle ID**: com.sikai.bodyscanner
- **Theme**: Dark (#0A0A0A bg, #1A1A1A cards, #10B981 emerald accent)
- **Framework**: Expo + React Native, iOS 17+

#### Screens (9)
1. **Onboarding** — Multi-step welcome + profile setup
2. **Dashboard** (`/(tabs)`) — Body diagram, score ring, key metrics, measurements grid
3. **Scan** (`/(tabs)/scan`) — Camera photo capture → AI analysis → real body measurements
4. **AI Coach** (`/(tabs)/coach`) — Chat interface with AI fitness coaching
5. **History** (`/(tabs)/history`) — Scan history list with summary stats
6. **Progress** (`/(tabs)/progress`) — Charts for all 11 metrics, 8-week summary
7. **Compare** (`/compare`) — Side-by-side scan comparison table
8. **Settings** (`/settings`) — Profile, notifications, data management
9. **Paywall** (`/paywall`) — Free/Pro $14.99/Annual $99.99 plans

#### Scan Flow (AI-powered)
1. User taps "Take Front Photo" → `expo-image-picker` launches camera
2. Optional: take side photo for better accuracy
3. "Analyze with AI" → photo sent to `POST /api/scan/analyze`
4. LiDAR animation plays while API processes (progress gates at 85% until response)
5. GPT-4.1 Vision analyzes photo + profile → returns real measurements
6. Results panel shows: score, body fat %, muscle mass, BMI + AI insights panel
7. Graceful fallback to generated data if AI unavailable
8. "Save Scan" stores to AsyncStorage history

#### Body Parts Tracked (11)
chest, waist, hips, leftArm, rightArm, leftThigh, rightThigh, neck, shoulders, bodyFat, muscleMass

#### Data
- 8 weeks of seeded mock scan data (auto-generated on first launch)
- New AI scans stored via AsyncStorage

#### Navigation
- 5-tab custom tab bar: Dashboard · Scan · Coach · History · Progress
- Supports NativeTabs (iOS 26 liquid glass) + classic BlurView fallback

### Canvas (`artifacts/mockup-sandbox`)
Vite mockup sandbox for component previews.

- `SikAICombined` — 6-act cinematic promo video at `/__mockup/preview/SikAICombined`

## Shared Libraries

- `lib/api-spec` — OpenAPI spec (`openapi.yaml`) + Orval codegen config
- `lib/api-zod` — Generated Zod validation schemas
- `lib/api-client-react` — Generated React Query hooks
- `lib/db` — Drizzle schema (conversations, messages tables)
- `lib/integrations-openai-ai-server` — OpenAI SDK client wrapper (env-keyed via Replit AI proxy)
- `lib/integrations-openai-ai-react` — React voice/audio hooks

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run typecheck:libs` — build composite lib declarations
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Environment Variables (Required)

- `AI_INTEGRATIONS_OPENAI_BASE_URL` — Replit AI proxy base URL (auto-provisioned)
- `AI_INTEGRATIONS_OPENAI_API_KEY` — Replit AI proxy key (auto-provisioned)
- `SESSION_SECRET` — Express session secret

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
