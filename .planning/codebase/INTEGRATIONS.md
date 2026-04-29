# Integrations

**Mapped:** 2026-04-29

External services, on-device platform integrations, and cross-package contracts.

## Summary

The mobile app is currently **fully self-contained** — no external API calls, no auth provider, no analytics, no telemetry. The API server, database, and codegen pipeline exist as scaffolding but only expose a `/healthz` endpoint. The integrations below are therefore split into:

1. **Wired and live** — used by running code today.
2. **Configured but inactive** — packages installed/scaffolded, no runtime use.
3. **Not present** — common integrations explicitly absent (worth noting for planning).

---

## 1. Wired and Live

### On-device storage

- **Library:** `@react-native-async-storage/async-storage` 2.2.0
- **Used in:** `artifacts/sikai/context/AppContext.tsx`
- **What:** Persists `UserProfile`, `ScanRecord[]`, and `ChatMessage[]` between app launches.
- **Failure mode:** errors during hydration are caught and silently fall back to `generateMockData()` — see `CONCERNS.md` §2.

### Camera / photos (capability declared)

- **Library:** `expo-image-picker` ~17.0.9
- **Used in:** scan flow (TBD — not exhaustively grepped); the LiDAR/AR scan UI is mostly visual simulation.

### Geolocation (capability declared)

- **Library:** `expo-location` ~19.0.8
- **Used in:** declared in dependencies; runtime usage not verified during this map.

### Haptic feedback

- **Library:** `expo-haptics` ~15.0.8
- **Used in:** scan/UI confirmations.

### Logging (server-side)

- **Library:** `pino` + `pino-http`
- **Used in:** `artifacts/api-server/src/lib/logger.ts`, wired into Express via `pinoHttp` middleware (`src/app.ts`).
- **Config:** `LOG_LEVEL` env var; pretty-printing in dev; sensitive headers auto-redacted by pino defaults.

### Replit dev tooling

- **Library:** `@replit/connectors-sdk` ^0.4.0 (root workspace dep)
- **Used in:** workspace-level only; the mobile dev script reads `REPLIT_*` env vars and tunnels via `@expo/ngrok`.

---

## 2. Configured but Inactive

### REST API (workspace ↔ workspace contract)

- **Spec:** `lib/api-spec/openapi.yaml` (OpenAPI 3.1, 36 lines).
- **Today:** declares only `GET /healthz` returning `HealthStatus { status: string }`.
- **Codegen:** Orval produces `@workspace/api-client-react` (TanStack Query v5 hooks) and `@workspace/api-zod` (Zod v4 schemas).
- **Mobile app integration:** `@workspace/api-client-react` is declared as a dep in `artifacts/sikai/package.json` but **zero imports** found in `artifacts/sikai/` source. The custom fetcher (`lib/api-client-react/src/custom-fetch.ts`, 371 lines) exists but is not invoked at runtime by the mobile app.
- **Server integration:** `artifacts/api-server/src/routes/health.ts` imports `HealthCheckResponse` from `@workspace/api-zod` — single proof of life for the codegen contract.

### PostgreSQL

- **Driver:** `pg` 8.20.0, configured as a `Pool` in `lib/db/src/index.ts`.
- **ORM:** Drizzle (`drizzle-orm` catalog) + `drizzle-zod` for inferred Zod schemas.
- **Schema state:** `lib/db/src/schema/index.ts` is a commented-out template — **no tables defined**.
- **Migrations:** `drizzle-kit push` (dev-only, no versioned migration files in repo).
- **Required env:** `DATABASE_URL` — module throws on import if missing.

### CORS

- **Library:** `cors` ^2 in `artifacts/api-server/src/app.ts`.
- **Config:** `app.use(cors())` — wide open. Acceptable for `/healthz` only; revisit before any auth-bearing endpoint ships (see `CONCERNS.md` §7).

### Cookie parsing

- **Library:** `cookie-parser` ^1.4.7
- **Status:** declared in `api-server/package.json`, not imported in `app.ts` at scan time. Likely scaffolding for future session/auth work.

---

## 3. Not Present (worth noting for planning)

These are common integrations that, if planning involves them, will require explicit setup work:

| Category | Status | Notes |
|----------|--------|-------|
| Authentication provider | none | No Auth0/Clerk/Firebase/Supabase/NextAuth/Lucia. No JWT helpers in deps. |
| User session storage | none | Mobile app stores profile in AsyncStorage; no server-side session yet. |
| Payment processing | partial signal | `pnpm-workspace.yaml` lists `stripe-replit-sync` in `minimumReleaseAgeExclude`, but the package is not currently installed in any `package.json`. The `paywall.tsx` screen (342 lines) presumably mocks Stripe/RevenueCat — verify before shipping. |
| Analytics | none | No Segment, Mixpanel, Amplitude, PostHog, or Firebase Analytics. |
| Crash reporting / APM | none | No Sentry, Bugsnag, Datadog RUM, New Relic. |
| Push notifications | none | `expo-notifications` not installed. |
| File / blob storage | none | No S3, Cloudflare R2, GCS, or Supabase Storage SDKs. Mobile app stores no images today (`photoUri` field in `ScanRecord` was removed — see `CONCERNS.md` §3). |
| ML / inference services | none | No OpenAI/Anthropic/Replicate/HF clients in deps. The "AI" / scan features today are entirely UI simulation + mock data. |
| Email / SMS | none | No Resend, SendGrid, Postmark, Twilio. |
| Real-time / websockets | none | No Socket.IO, Pusher, Ably, or Supabase Realtime. |
| Feature flags | none | No LaunchDarkly, GrowthBook, Statsig, ConfigCat. |
| CI / build pipeline | none | No `.github/workflows`, no GitLab CI, no CircleCI. |

---

## Cross-Package Contracts (Internal "Integrations")

| Producer | Consumer | Mechanism |
|----------|----------|-----------|
| `lib/api-spec/openapi.yaml` | `lib/api-client-react`, `lib/api-zod` | Orval codegen on demand (`pnpm --filter @workspace/api-spec run codegen`) |
| `lib/api-zod` | `artifacts/api-server` (route validation) | Direct workspace import |
| `lib/api-client-react` | `artifacts/sikai` (intended) | Workspace dep declared, **not yet used** |
| `lib/db` | `artifacts/api-server` | Workspace dep declared, **not yet used in routes** |
| `constants/colors.ts` | `hooks/useColors.ts` → all sikai components | Single-source theme tokens |
| `context/AppContext.tsx` | every screen via `useAppContext()` | Global state singleton |

## Required Environment Variables

| Variable | Used by | Required to start? |
|----------|---------|-------------------|
| `DATABASE_URL` | `lib/db`, `lib/db/drizzle.config.ts` | Yes (throws at import) |
| `PORT` | `artifacts/api-server/src/index.ts` | Yes (throws at startup) |
| `LOG_LEVEL` | `artifacts/api-server/src/lib/logger.ts` | No (defaults to `info`) |
| `NODE_ENV` | `artifacts/api-server/src/lib/logger.ts` | No (controls pretty-printing) |
| `EXPO_PACKAGER_PROXY_URL` | `artifacts/sikai/scripts:dev` | Replit dev only |
| `EXPO_PUBLIC_DOMAIN` | `artifacts/sikai/scripts:dev` | Replit dev only |
| `EXPO_PUBLIC_REPL_ID` | `artifacts/sikai/scripts:dev` | Replit dev only |
| `REACT_NATIVE_PACKAGER_HOSTNAME` | `artifacts/sikai/scripts:dev` | Replit dev only |
| `REPLIT_DEV_DOMAIN`, `REPL_ID` | derived inputs to the above | Replit env auto-provides |

No `.env*` files are committed in the working tree.

---
*Last mapped: 2026-04-29*
