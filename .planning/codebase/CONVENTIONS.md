# Coding Conventions

**Mapped:** 2026-04-29
**Scope:** pnpm monorepo (`artifacts/sikai`, `artifacts/api-server`, `artifacts/mockup-sandbox`, `lib/*`)

## Naming

| Element | Convention | Example |
|---------|-----------|---------|
| React components | PascalCase | `LiDARScanner`, `MetricCard`, `CameraBackground` |
| Functions / variables | camelCase | `seedMockData`, `currentScan` |
| Hooks | `use*` prefix, camelCase | `useColors`, `useAppContext` |
| TypeScript types/interfaces | PascalCase | `AppContextType`, `MetricCardProps`, `Scan` |
| Files (components) | PascalCase.tsx | `LiDARScanner.tsx` |
| Files (utilities/hooks) | camelCase.ts | `useColors.ts`, `colors.ts` |
| Workspace packages | `@workspace/*` | `@workspace/api-zod`, `@workspace/db` |

## Code Style

- **Formatter:** Prettier v3.8.1 (defaults: 2-space indent, 80-char width).
- **Linter:** No ESLint config detected — typecheck-only via `tsc --noEmit` per package and at root (`pnpm run typecheck`).
- **TypeScript:** Strict mode enabled across all packages. TS 5.9.
- **Module system:** ESM throughout (workspace packages use `"type": "module"`); `api-server` builds to `dist/index.mjs` via esbuild.

## Import Organization

Three-tier ordering observed across `.tsx` / `.ts` files:

1. External packages (`react`, `expo-router`, `react-native`, `zod`, etc.)
2. Workspace / alias imports (`@workspace/*`, `@/*`)
3. Relative internal modules (`./constants`, `../hooks`)

The mobile app uses the `@/*` path alias rooted at `artifacts/sikai/` (configured in `tsconfig.json`).

## Patterns

### React component shape (mobile app)

```tsx
type MetricCardProps = {
  label: string;
  value: number;
};

export function MetricCard({ label, value }: MetricCardProps) {
  const colors = useColors();
  // …
}
```

- Named exports preferred; default exports limited to Expo Router screens (`app/index.tsx`, `app/_layout.tsx`).
- Props destructured at the function signature; types declared inline above the component.

### Color tokens via hook

All theming flows through `hooks/useColors.ts` reading from `constants/colors.ts`. Components must call `useColors()` rather than hard-coding hex values.

### Global state

Single `AppContext` (`context/AppContext.tsx`) owns scan history, exposes a typed `useAppContext()` hook, persists to AsyncStorage. No Redux/Zustand/Jotai.

### Generated code is read-only

`lib/api-client-react/src/generated/` and `lib/api-zod/src/generated/` are produced by Orval (`pnpm --filter @workspace/api-spec run codegen`) from `lib/api-spec/openapi.yaml`. CLAUDE.md explicitly forbids hand-editing these directories.

## Error Handling

- **React Error Boundary:** Class component at app root (`artifacts/sikai/app/_layout.tsx`) wraps the tree.
- **Async work:** `try/catch` with fallback values; AsyncStorage reads in `AppContext` swallow errors and seed defaults.
- **Validation:** Zod v4 schemas (auto-generated from OpenAPI and Drizzle) parse inputs at API boundaries before further processing.

## Logging

- **API server:** Pino v9 + pino-http; level via `LOG_LEVEL`; sensitive headers auto-redacted; pretty-printing in development.
- **Mobile app:** No structured logger; `console.warn`/`console.error` only.

## Comments

- JSDoc on exported hooks (return shape, behavior).
- Inline comments reserved for non-obvious logic (e.g. mock-data seeding in `AppContext`).
- No multi-paragraph block comments observed.

## Module Structure

- **Named exports** by default; barrel files (`index.ts` re-exports) are not used in app code.
- Lib packages declare explicit `exports` maps in `package.json` (e.g. `@workspace/api-zod`).

## Workspace-wide Constraints (from `CLAUDE.md`)

- pnpm only — `npm`/`yarn` blocked by preinstall script.
- Use `catalog:` in `package.json` for dependencies pinned in `pnpm-workspace.yaml`.
- `minimumReleaseAge: 1440` is intentional supply-chain protection — do not remove.
- esbuild/rollup/lightningcss platform overrides strip non-linux-x64 binaries (Replit hosting requirement) — do not remove.

---
*Last mapped: 2026-04-29*
