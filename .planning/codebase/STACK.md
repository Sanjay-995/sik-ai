# Stack

**Mapped:** 2026-04-29
**Repository:** pnpm workspace monorepo, deployed via Replit (linux-x64).

## Runtime & Language

| Component | Version | Source |
|-----------|---------|--------|
| Node.js | 24 | `CLAUDE.md` (workspace requirement) |
| TypeScript | ~5.9.2 | root `package.json`, all packages |
| Package manager | pnpm | enforced by `package.json` preinstall script (blocks npm/yarn) |
| Module system | ESM throughout | `"type": "module"` on workspace packages |

## Workspace Layout

Five packages under one workspace (`pnpm-workspace.yaml`):

```
artifacts/
  sikai/            @workspace/sikai            Expo / RN iOS app (primary)
  api-server/       @workspace/api-server       Express 5 API (esbuild → CJS bundle)
  mockup-sandbox/   @workspace/mockup-sandbox   Vite + React web sandbox
lib/
  api-spec/         @workspace/api-spec         OpenAPI source + Orval codegen
  api-client-react/ @workspace/api-client-react React Query hooks (generated)
  api-zod/          @workspace/api-zod          Zod schemas (generated)
  db/               @workspace/db               Drizzle schema + Postgres pool
scripts/                                         workspace utility scripts
```

## Mobile App (`artifacts/sikai`)

| Layer | Choice | Version |
|-------|--------|---------|
| Framework | Expo SDK | ~54.0.27 |
| Native runtime | React Native | 0.81.5 |
| New Architecture | enabled | `app.json` `newArchEnabled: true` |
| React | catalog-pinned | 19.1.0 (exact, required by Expo) |
| Navigation | Expo Router | ~6.0.17 (file-based, typed routes) |
| Animation | react-native-reanimated | ~4.1.1 |
| Worklets | react-native-worklets | 0.5.1 |
| Gestures | react-native-gesture-handler | ~2.28.0 |
| SVG | react-native-svg | 15.12.1 |
| Safe area | react-native-safe-area-context | ~5.6.0 |
| Native screens | react-native-screens | ~4.16.0 |
| Local storage | @react-native-async-storage/async-storage | 2.2.0 |
| Compiler | babel-plugin-react-compiler | beta (`19.0.0-beta-e993439-20250117`) |
| Web shim | react-native-web | ^0.21.0 |

**Expo platform modules in use:**
`expo-router`, `expo-font`, `expo-image`, `expo-image-picker`, `expo-location`, `expo-haptics`, `expo-blur`, `expo-glass-effect`, `expo-linear-gradient`, `expo-status-bar`, `expo-symbols`, `expo-system-ui`, `expo-splash-screen`, `expo-constants`, `expo-linking`, `expo-web-browser`.

**Data fetching:** `@tanstack/react-query` (catalog: ^5.90.21) is installed and `@workspace/api-client-react` is declared as a dependency, but **no current usage** of either was found in `artifacts/sikai/`. The mobile app reads/writes only AsyncStorage today.

**iOS-specific config (`app.json`):** portrait, dark UI style, bundle id `com.sikai.bodyscanner`, `supportsTablet: false`. Experimental flags: `typedRoutes`, `reactCompiler`.

## API Server (`artifacts/api-server`)

| Layer | Choice | Version |
|-------|--------|---------|
| Framework | Express | ^5 |
| Logger | pino + pino-http | ^9 / ^10 |
| CORS | cors | ^2 |
| Cookies | cookie-parser | ^1.4.7 |
| Bundler | esbuild | 0.27.3 (catalog override) |
| Esbuild plugins | esbuild-plugin-pino | ^2.3.3 |
| Build target | `dist/index.mjs` | ESM, sourcemaps enabled |
| ORM (re-exported) | drizzle-orm | catalog: ^0.45.1 |

Routes are mounted under `/api/`; only `/healthz` exists today (`src/routes/health.ts`).

## Mockup Sandbox (`artifacts/mockup-sandbox`)

A standalone Vite playground for UI prototypes — independent of the mobile app.

| Layer | Choice | Version |
|-------|--------|---------|
| Bundler | Vite | catalog: ^7.3.0 |
| React plugin | @vitejs/plugin-react | catalog: ^5.0.4 |
| Styling | Tailwind CSS | catalog: ^4.1.14 (v4, Oxide engine) |
| Tailwind/Vite | @tailwindcss/vite | catalog: ^4.1.14 |
| Animation | framer-motion | catalog: ^12.23.24 |
| Icons | lucide-react | catalog: ^0.545.0 |
| Forms | react-hook-form + @hookform/resolvers | ^3.10.0 |
| UI primitives | full @radix-ui/* set | shadcn/ui pattern |
| Class utilities | class-variance-authority, clsx, tailwind-merge | catalog |
| File watcher | chokidar | ^4.0.3 |
| Replit dev plugins | @replit/vite-plugin-cartographer, vite-plugin-runtime-error-modal | catalog |

## Shared Libraries (`lib/`)

| Package | Purpose | Notes |
|---------|---------|-------|
| `@workspace/api-spec` | OpenAPI source + Orval codegen config | `lib/api-spec/openapi.yaml` (36 lines today — only `/healthz`) |
| `@workspace/api-client-react` | React Query hooks generated from OpenAPI | `src/generated/`, plus a hand-written `src/custom-fetch.ts` (371 lines) |
| `@workspace/api-zod` | Zod v4 schemas generated from OpenAPI | `src/generated/` |
| `@workspace/db` | Postgres pool + Drizzle schema | `pg ^8.20.0`, `drizzle-orm` (catalog), `drizzle-zod ^0.8.3`, `drizzle-kit ^0.31.9` |

**Codegen flow:**

```
lib/api-spec/openapi.yaml
        │ pnpm --filter @workspace/api-spec run codegen   (Orval)
        ▼
lib/api-client-react/src/generated/   (TanStack Query v5 hooks)
lib/api-zod/src/generated/            (Zod v4 schemas)
```

`generated/` directories are read-only by convention (`CLAUDE.md`).

## Database

| Layer | Choice | Version |
|-------|--------|---------|
| Engine | PostgreSQL | (managed externally — `DATABASE_URL` env var required) |
| Driver | pg | ^8.20.0 |
| ORM | Drizzle | catalog: ^0.45.1 |
| Schema → Zod | drizzle-zod | ^0.8.3 |
| Migrations | drizzle-kit (push) | ^0.31.9 |
| Connection | `new Pool({ connectionString: process.env.DATABASE_URL })` | `lib/db/src/index.ts` |
| Schema | empty (template only) | `lib/db/src/schema/index.ts` |

Migrations are applied dev-style via `pnpm --filter @workspace/db run push` — no versioned migration files committed today.

## Validation

| Library | Version | Where |
|---------|---------|-------|
| Zod | catalog: ^3.25.76 | runtime validation |
| zod-validation-error | ^3.4.0 | mobile app |
| drizzle-zod | ^0.8.3 | DB schema → Zod |

Note: pnpm catalog pins Zod at ^3, but `lib/api-zod/package.json` (codegen consumer) and other places may reference `zod/v4` — **two Zod versions coexist**. Treat with care when updating.

## Dependency Catalog (selected)

`pnpm-workspace.yaml` pins shared versions via the `catalog:` mechanism:

```yaml
react: 19.1.0           # exact — Expo requirement
react-dom: 19.1.0       # exact — Expo requirement
@tanstack/react-query: ^5.90.21
drizzle-orm: ^0.45.1
zod: ^3.25.76
vite: ^7.3.0
tailwindcss: ^4.1.14
@types/node: ^25.3.3
tsx: ^4.21.0
```

## Build Tooling

- **Root:** `pnpm run typecheck` runs `tsc --build` over libs first, then per-package typechecks across `artifacts/*` and `scripts`.
- **API server:** custom `build.mjs` (esbuild) → `dist/index.mjs`.
- **Mobile:** `node scripts/build.js` (Expo) and `expo start` for dev.
- **Mockup sandbox:** `vite build`.
- **Formatter:** Prettier 3.8.1 (no committed config, defaults).
- **Linter:** none.
- **Tests:** none (see `TESTING.md`).

## Supply-Chain Posture

- `minimumReleaseAge: 1440` (24 h) prevents installing freshly-published versions — defense against npm supply-chain attacks. Do not disable.
- `minimumReleaseAgeExclude` allows `@replit/*` and `stripe-replit-sync` immediate installs.
- `overrides` in `pnpm-workspace.yaml` strip non-`linux-x64` esbuild/rollup/lightningcss/tailwind-oxide/expo-ngrok binaries — required by Replit hosting; do not remove.
- `drizzle-kit`'s vulnerable old esbuild is overridden via `@esbuild-kit/esm-loader` → `tsx@^4.21.0`.

## Hosting / Deploy

- **Target environment:** Replit (`@replit/connectors-sdk` is the only root-level workspace dep; mobile dev script reads `REPLIT_*` env vars and uses `@expo/ngrok` for tunneling).
- **Mobile distribution:** not configured in this repo (no EAS config visible at scan time; check `artifacts/sikai/eas.json` if it exists).

---
*Last mapped: 2026-04-29*
