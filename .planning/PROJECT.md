# Sik AI

## What This Is

Sik AI is an iOS app that measures the user's body using only the iPhone's camera and tracks how those measurements change over time. The product is for general-fitness users — both people training for muscle gain and people losing weight — who want to see real changes from their workouts and diet without a tape measure or visit to a gym scanner. The closest reference product is ZOZOFIT, but Sik AI is **suitless**: no special clothing or hardware, just the phone.

Today, the codebase ships a high-fidelity *visual demo* of this experience: an Expo / React Native iOS app with a polished scan UI (animated LiDAR-style point cloud, AR brackets, simulated camera background), 8 weeks of mock measurement history, a coach chat, and a paywall — all backed by mock data in AsyncStorage. There is no real measurement, no real coach, no real payment, and the scaffolded backend (Express, Postgres via Drizzle, OpenAPI codegen) is not connected to the app.

This project is about **replacing the facade with real product**, starting with the measurement engine itself.

## Core Value

A user can scan their body with their iPhone and trust the result enough to track real changes over time.

If the measurements aren't trustworthy, nothing else matters — every other feature in the app (history, comparisons, coaching, paywall) depends on the numbers being real and reproducible. Everything we ship gets evaluated against this one thing.

## Requirements

### Validated

<!-- Existing capabilities inferred from the codebase mapping. These are demos / facades today, but the UI scaffolding is real and reusable. -->

- ✓ iOS-only Expo / React Native app shell with file-based routing — existing
- ✓ Dark-only theme system via `constants/colors.ts` + `useColors()` hook — existing
- ✓ Tab navigation (home, scan, progress, history, coach) — existing
- ✓ Onboarding flow — existing (UI only)
- ✓ Local-only state via React Context + AsyncStorage — existing
- ✓ Scan-flow UX: animated LiDAR-style point cloud, AR brackets, "camera" background — existing (visual only, no real capture)
- ✓ History / progress / compare screens — existing (rendering mock data)
- ✓ Paywall screen — existing (UI only, no real payments)
- ✓ TypeScript strict mode + pnpm catalog supply-chain protections — existing

### Active

<!-- v1 scope. Hypotheses until shipped and validated. -->

- [ ] **Real on-device body-measurement engine** — replace the simulated scanner with real capture and measurement using the iPhone camera, Apple Vision body pose, ARKit scale reference, and an open-source parametric body model (SMPL-X / SHAPY / 4D-Humans-class) running on-device via CoreML. Target accuracy: **±0.5cm test-retest reproducibility** for circumferences (chest, waist, hips, arms, thighs).
- [ ] **Spike-first feasibility gate** — before committing to full productization, run a 2-3 week technical spike that measures real bodies against tape-measure ground truth and produces a go/no-go decision based on actual data.
- [ ] **Capture protocol + UX** — design the scan flow so it produces *repeatable* results: pose guidance, framing checks, lighting checks, clothing guidance, retake prompts. Reuse the existing scan-flow visuals as polish on top of real capture.
- [ ] **Real measurement output** — extract circumferences for the same 11 body sites the existing UI already displays (chest, waist, hips, arms, thighs, neck, shoulders, body fat, muscle mass) — plus weight and BMI from user input. Score derivation rules to be defined.
- [ ] **Replace mock-data seeding with real-only history** — first-time users start with an empty history; the `generateMockData()` path is removed. Demo mode (for App Store screenshots / sales) is a separate, opt-in path, not the default.
- [ ] **Real coach commentary based on real trends** — the existing coach chat surface stays; canned responses are replaced with AI-generated commentary tied to the user's actual measurement history. Provider/approach TBD.
- [ ] **Real paywall via Apple In-App Purchase** — replace the UI-only paywall with real IAP through StoreKit / RevenueCat. No own-server billing, no Stripe.
- [ ] **All data on-device** — no cloud sync, no accounts, no server-side storage in v1. Data lives in AsyncStorage / local storage on the iPhone.

### Out of Scope

- **Android** — iOS-only for v1; Android is a separate future workstream that would require re-evaluating the measurement-engine choice (Apple Vision and ARKit are iOS-only).
- **Apple Watch / wearables / HealthKit / Bluetooth scale integration** — out of scope for v1; reconsider after the measurement engine is proven.
- **Social and sharing features** — no friend connections, no shared scans, no community feeds.
- **Medical or clinical positioning** — Sik AI is a consumer-fitness product. No medical claims, no clinical-grade marketing.
- **Cloud sync / multi-device / accounts** — explicitly punted to v2 (or later) based on user demand. v1 assumes a user only uses one device.
- **Server-side ML inference / sending body photos to a server** — privacy stance is on-device only. Photos do not leave the phone.
- **Licensed third-party body-measurement SDKs** (3DLOOK, Bodygee, Sizer, etc.) — rejected for v1 because pre-revenue economics make per-scan or annual license fees a poor fit. Revisit only if the spike shows DIY can't hit the accuracy bar.
- **Physical bodysuit (à la ZOZOFIT)** — rejected because shipping hardware turns a software business into a logistics business.
- **LiDAR-only / Pro-iPhone-only capture** — rejected because (a) it cuts the addressable market to ~30-40% of iPhone users and (b) LiDAR's depth resolution is not actually a winning sensor for body measurement; modern camera + ML pipelines match or beat it. LiDAR may be added later as a Pro-device enhancement.
- **`artifacts/mockup-sandbox`** — the parallel Vite + shadcn/ui design playground is unrelated to v1 and stays as-is.
- **Backend scaffolding** (`artifacts/api-server`, `lib/db`, `lib/api-spec`, `lib/api-client-react`, `lib/api-zod`) — not used in v1. Remains in the repo as future scaffolding for a possible cloud-sync v2.

## Context

**Codebase state (from `.planning/codebase/`):**
- The mobile app (`artifacts/sikai`) is the only real product surface today. It is a polished UI shell with simulated behavior — see `.planning/codebase/CONCERNS.md` §1–§3 for the full breakdown of what is real vs. facade.
- Scan data type today is `ScanRecord` in `artifacts/sikai/context/AppContext.tsx`: 11 numeric body fields, weight, BMI, score, ISO date, optional notes. (Note: the project's existing `CLAUDE.md` is slightly out of date — it mentions a `photoUri` field that no longer exists.)
- 8 weeks of mock scans are seeded into AsyncStorage on first launch via `generateMockData()`. This will fight any real-scan integration unless cleanly replaced.
- The performance-sensitive components (`LiDARScanner.tsx`, `CameraBackground.tsx`, `ARScanAnimation.tsx`) are real RN code and can stay as polish on top of real capture.
- React Native New Architecture is enabled; React Compiler (Babel plugin) is on; Reanimated 4 is in use.

**Domain context:**
- ZOZOFIT achieves ±1cm accuracy using a polka-dot bodysuit + camera + ML — the suit is the secret sauce, not the LiDAR.
- The closest *suitless* commercial competitors (3DLOOK, Bodygee, Sizer, MeThreeSixty) achieve ±1-2cm with strict capture protocols (tight clothing, plain background, 360° rotation, controlled lighting).
- For the gym audience specifically, **test-retest reproducibility matters more than absolute accuracy**: a system that always reads "waist = 84.2cm" reliably is more useful for tracking weekly hypertrophy progress than one that reads "between 81 and 85" with better calibration to a tape measure.
- For the weight-loss audience, ±2cm is acceptable because cm-scale changes happen quickly.
- Open-source body models (SMPL-X, SHAPY, PIXIE, 4D-Humans) are mature enough to drive a serious DIY attempt and can be converted to CoreML for on-device inference.

**User context:**
- Founder is non-technical and is relying on Claude to lead engineering choices.
- Pre-revenue, exploring; no rush; no in-house ML team.
- "Build it right" was the explicit framing — this project privileges quality and reproducibility over speed-to-launch.

## Constraints

- **Platform**: iOS only for v1 — `app.json` declares portrait, dark UI, bundle id `com.sikai.bodyscanner`, `supportsTablet: false`. Apple Vision body pose and ARKit are iOS-only APIs.
- **Sensor**: camera only — no LiDAR dependency, so v1 must work on every iPhone that runs iOS 17+.
- **Privacy**: all photos and measurements stay on-device. No cloud upload of body imagery in v1.
- **Build path**: in-house, no licensed third-party measurement SDKs. Pre-revenue economics make recurring license fees a non-starter.
- **Accuracy bar**: ±0.5cm test-retest reproducibility for circumferences (gym-user grade). Fallback: if the spike shows ~±2cm and not better, ship to the weight-loss audience first and defer the gym positioning until accuracy improves.
- **Tooling**: pnpm only (workspace enforces it); Node 24; TypeScript 5.9 strict; Expo SDK 54; React Native 0.81 with New Architecture; React Compiler enabled; Reanimated 4. These are existing constraints we inherit, not new choices.
- **Supply chain**: `minimumReleaseAge: 1440` (24h) is in place — do not disable. New deps respect this unless the publisher is on the trusted allowlist.
- **Generated code**: `lib/*/src/generated/` is read-only by convention.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Suitless capture (no ZOZOFIT-style bodysuit) | Shipping a physical product turns a software business into a logistics business. | — Pending |
| Camera-only, no LiDAR for v1 | LiDAR locks out 60–70% of iPhone users; modern camera + ML matches or beats LiDAR for body measurement; repeatability matters more than the sensor. | — Pending |
| Build in-house, no third-party measurement SDK for v1 | Pre-revenue can't sustain $50–200K/yr or per-scan license fees; "no rush" gives time to build the moat. | — Pending |
| Spike before product build | A 2-3 week feasibility test reduces the risk of investing 4+ months and missing the accuracy bar. Decision driven by data, not by faith. | — Pending |
| Fallback positioning if accuracy is ~±2cm | Ship to the weight-loss audience first; treat hypertrophy-grade tracking as a v1.1 goal. Don't block launch on unsolved precision. | — Pending |
| On-device data only for v1 | Strongest privacy story; no cloud cost; matches "exploring" stage. Cross-device sync is a future opt-in, not a default. | — Pending |
| Reuse existing UI scaffolding (LiDAR animation, AR brackets, camera background) | The visual identity is a real asset — keep it as polish on top of real capture, not throw it away. | — Pending |
| Backend scaffolding stays dormant | `api-server`, `lib/db`, `lib/api-spec` aren't needed for on-device v1 but remain in the repo as future foundation for cloud sync. | — Pending |
| Replace `generateMockData()` with empty-state on first launch | Mock data fighting real scans is a pollution risk. Demo mode for screenshots/sales is a separate opt-in path. | — Pending |
| Apple IAP for monetization (no own-server billing) | Standard iOS path, no server cost, fits on-device-only architecture. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-30 after initialization*
