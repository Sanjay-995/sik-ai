# Codebase Structure

**Analysis Date:** 2026-04-29

## Directory Layout

```
sik-ai/
├── artifacts/                    # Runnable applications & deliverables
│   ├── sikai/                    # iOS Expo app (primary mobile app)
│   ├── api-server/               # Express API backend
│   └── mockup-sandbox/           # Web UI prototyping sandbox
├── lib/                          # Shared libraries & infrastructure
│   ├── api-spec/                 # OpenAPI specification (source of truth)
│   ├── api-client-react/         # Generated TanStack Query hooks
│   ├── api-zod/                  # Generated Zod validation schemas
│   └── db/                       # Drizzle ORM + database schema
├── scripts/                      # Utility scripts (workspace helpers)
├── pnpm-workspace.yaml           # Workspace config, dependency catalog, supply-chain security
├── package.json                  # Root workspace package, typecheck scripts
└── .planning/                    # GSD planner output (this file location)
```

## Directory Purposes

**artifacts/sikai/ (Mobile App):**
- Purpose: Primary deliverable — iOS fitness tracking app with AR body scanning
- Contains: Expo/React Native screens, components, context, styling, constants
- Key files: `app/_layout.tsx` (root), `context/AppContext.tsx` (global state), `constants/colors.ts` (design tokens)
- Entry: `app/_layout.tsx` → `app/index.tsx` → `app/(tabs)/_layout.tsx`

**artifacts/sikai/app/:**
- Purpose: File-based routing (Expo Router)
- Contains: Screen files and layout definitions
- Structure:
  - `_layout.tsx`: Root layout with providers
  - `index.tsx`: Redirect to onboarding or tabs
  - `(tabs)/`: Tab group (bottom navigation)
    - `_layout.tsx`: Tab navigator config
    - `index.tsx`: Dashboard screen
    - `scan.tsx`: AR scanner screen
    - `coach.tsx`: AI coach screen
    - `history.tsx`: Scan history screen
    - `progress.tsx`: Progress/charts screen
  - `onboarding.tsx`: Onboarding flow
  - `paywall.tsx`: Pro upgrade modal
  - `settings.tsx`: User settings modal
  - `compare.tsx`: Scan comparison modal

**artifacts/sikai/components/:**
- Purpose: Reusable React Native components
- Contains: UI components and complex interactive elements
- Key files:
  - `LiDARScanner.tsx` (500+ lines) — SVG point cloud scanner with body geometry
  - `CameraBackground.tsx` — Noise/scanlines/vignette effects
  - `ARScanAnimation.tsx` — AR bracket animations
  - `BodyDiagram.tsx` — Interactive body model with measurements
  - `ProgressChart.tsx` — Trend line chart
  - `ScanScoreRing.tsx` — Circular progress indicator
  - `MetricCard.tsx` — Measurement display card
  - `GradientCard.tsx` — Gradient background helper
  - `ErrorBoundary.tsx` — Error fallback
  - `KeyboardAwareScrollViewCompat.tsx` — Keyboard handling wrapper

**artifacts/sikai/context/:**
- Purpose: Global state and persistence
- Contains: Single file `AppContext.tsx`
- Exports: `AppProvider`, `useApp()`, `AppContextType`, `UserProfile`, `ScanRecord`, `ChatMessage`

**artifacts/sikai/hooks/:**
- Purpose: Custom React Native hooks
- Contains: Reusable hook logic
- Key files: `useColors.ts` — Device-aware color theme switcher

**artifacts/sikai/constants/:**
- Purpose: Static configuration and design tokens
- Contains: `colors.ts` — Dark theme color palette, radius values
- Used by: Every component via `useColors()` hook

**artifacts/api-server/:**
- Purpose: Express REST API backend
- Contains: Routes, middleware, application setup
- Structure:
  - `src/app.ts` — Express app configuration (middleware, CORS, routes mounting)
  - `src/index.ts` — Server entry point (reads PORT, starts listener)
  - `src/routes/index.ts` — Route mounting
  - `src/routes/health.ts` — GET /api/healthz endpoint
  - `src/lib/logger.ts` — Pino logger setup
  - `build.mjs` — esbuild configuration (builds to `dist/index.mjs`)

**artifacts/mockup-sandbox/:**
- Purpose: Web-based UI component prototyping
- Contains: Vite + React + Tailwind + shadcn/ui sandbox
- Structure:
  - `src/main.tsx` — Vite entry
  - `src/App.tsx` — Component preview loader
  - `src/components/mockups/` — UI prototype files
  - `src/components/ui/` — shadcn/ui component library
  - `src/.generated/` — Auto-generated component discovery (Vite plugin)

**lib/api-spec/:**
- Purpose: OpenAPI 3.1.0 API contract specification
- Contains: 
  - `openapi.yaml` — API specification (single source of truth)
  - `orval.config.ts` — Code generation configuration
- Codegen Output: Produces files in `lib/api-client-react/src/generated/` and `lib/api-zod/src/generated/`
- Command: `pnpm --filter @workspace/api-spec run codegen`

**lib/api-client-react/:**
- Purpose: Auto-generated TanStack Query v5 hooks for API calls
- Contains:
  - `src/generated/` — Generated files (do not edit)
    - `api.ts` — React Query hooks (e.g., `useScanMutation()`, `useHealthCheckQuery()`)
    - `api.schemas.ts` — TypeScript types extracted from OpenAPI
  - `src/custom-fetch.ts` — Fetch interceptor for auth, base URL configuration
  - `src/index.ts` — Public exports
- Used by: Mobile app screens and components
- Regenerate: `pnpm --filter @workspace/api-spec run codegen`

**lib/api-zod/:**
- Purpose: Auto-generated Zod validation schemas for API requests/responses
- Contains:
  - `src/generated/` — Generated files (do not edit)
    - Zod schema definitions matching OpenAPI spec
  - `src/generated/types/` — Generated TypeScript types
- Used by: API server routes for validation
- Regenerate: `pnpm --filter @workspace/api-spec run codegen`

**lib/db/:**
- Purpose: PostgreSQL schema and ORM configuration
- Contains:
  - `src/schema/index.ts` — Drizzle table definitions (currently empty, template provided)
  - `drizzle.config.ts` — Migration configuration
  - `src/index.ts` — Database client and type exports
- Pattern for new tables:
  ```typescript
  // Define table
  export const usersTable = pgTable("users", {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
  });
  // Generate Zod insert schema
  export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true });
  export type User = typeof usersTable.$inferSelect;
  export type InsertUser = z.infer<typeof insertUserSchema>;
  ```
- Apply changes: `pnpm --filter @workspace/db run push` (dev only)

**scripts/:**
- Purpose: Workspace utility scripts and tooling
- Contains: TypeScript utility files for monorepo tasks
- `src/hello.ts` — Example script

## Key File Locations

**Entry Points:**
- Mobile app root: `artifacts/sikai/app/_layout.tsx`
- API server: `artifacts/api-server/src/index.ts`
- Mockup sandbox: `artifacts/mockup-sandbox/src/main.tsx`

**Configuration:**
- Root TypeScript: `tsconfig.base.json`, `tsconfig.json`
- Workspace config: `pnpm-workspace.yaml` (dependency catalog, supply-chain security)
- API spec: `lib/api-spec/openapi.yaml`
- Database: `lib/db/drizzle.config.ts`, `lib/db/src/schema/index.ts`

**Core Logic:**
- App state: `artifacts/sikai/context/AppContext.tsx`
- Colors/theme: `artifacts/sikai/constants/colors.ts`
- API routes: `artifacts/api-server/src/routes/`
- Validation: `lib/api-zod/src/generated/`

**Testing:**
- No test files found in current state (tests/ or .test/.spec files absent)

## Naming Conventions

**Files:**
- React components: PascalCase (e.g., `LiDARScanner.tsx`, `BodyDiagram.tsx`)
- Screens: PascalCase matching route names (e.g., `index.tsx`, `scan.tsx`)
- Utilities: camelCase (e.g., `useColors.ts`, `custom-fetch.ts`)
- Types/exports: Defined in same file or dedicated `types.ts` file
- Config files: Descriptive (e.g., `drizzle.config.ts`, `orval.config.ts`, `build.mjs`)

**Directories:**
- Features: lowercase (e.g., `components/`, `hooks/`, `context/`)
- Grouped routes: Parentheses notation (e.g., `(tabs)/`, `(auth)/`)
- Generated code: `generated/` suffix (e.g., `src/generated/`)
- Utilities: `lib/` or `utils/` prefix

## Where to Add New Code

**New Mobile Screen:**
1. Create file in `artifacts/sikai/app/` or `artifacts/sikai/app/(tabs)/` depending on routing
2. Export default component accepting React Native props
3. Import `useApp()`, `useColors()`, navigation via Expo Router
4. Example: `artifacts/sikai/app/(tabs)/progress.tsx`

**New Component:**
1. Create file in `artifacts/sikai/components/` with PascalCase name
2. Accept styled props and measurement data from parent
3. Consume `useColors()` for theming
4. Export as default
5. Example: `artifacts/sikai/components/MetricCard.tsx`

**New API Endpoint:**
1. Update `lib/api-spec/openapi.yaml` with operation definition
2. Run `pnpm --filter @workspace/api-spec run codegen` to regenerate client hooks and Zod schemas
3. Create route handler in `artifacts/api-server/src/routes/[feature].ts`
4. Mount in `artifacts/api-server/src/routes/index.ts`
5. Example: Health check at `lib/api-spec/openapi.yaml` → `artifacts/api-server/src/routes/health.ts`

**New Database Table:**
1. Create file in `lib/db/src/schema/[table-name].ts` (or add to `index.ts` if small)
2. Define Drizzle table, insert schema, and types
3. Export from `lib/db/src/schema/index.ts`
4. Run `pnpm --filter @workspace/db run push` to apply to PostgreSQL
5. Example template in `lib/db/src/schema/index.ts`

**New Custom Hook:**
1. Create file in `artifacts/sikai/hooks/[hook-name].ts`
2. Export function starting with `use` prefix
3. Can call other hooks and context
4. Consumed by screens and components

**New Utility Function:**
1. If small: Add to existing `lib/` file in the relevant package
2. If large: Create `artifacts/[package]/src/utils/[feature].ts`
3. Export from package index if meant to be public

**Tests (when added):**
- Co-located: `ComponentName.test.tsx` next to component
- Separate directory: `artifacts/sikai/__tests__/` for integration/app tests
- Use format: `[name].test.ts` or `[name].spec.ts`

## Special Directories

**artifacts/sikai/.generated/ (Vite plugin output):**
- Purpose: Auto-discovered components for mockup sandbox
- Generated: Yes (by Vite build)
- Committed: No
- Do not edit

**artifacts/api-server/dist/ (esbuild output):**
- Purpose: Compiled API server bundle (`dist/index.mjs`)
- Generated: Yes (by `pnpm run build`)
- Committed: No
- Do not edit

**lib/api-client-react/src/generated/ (Orval output):**
- Purpose: Auto-generated React Query hooks and types
- Generated: Yes (by `pnpm --filter @workspace/api-spec run codegen`)
- Committed: No (generated from OpenAPI spec)
- Do not edit

**lib/api-zod/src/generated/ (Orval output):**
- Purpose: Auto-generated Zod validation schemas
- Generated: Yes (by `pnpm --filter @workspace/api-spec run codegen`)
- Committed: No (generated from OpenAPI spec)
- Do not edit

**artifacts/mockup-sandbox/src/.generated/ (Vite plugin output):**
- Purpose: Auto-discovered mockup components
- Generated: Yes (by Vite build)
- Committed: No
- Do not edit

---

*Structure analysis: 2026-04-29*
