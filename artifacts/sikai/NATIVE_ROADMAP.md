# Native sensing & product roadmap

## LiDAR / body measurements (Expo constraint)

Apple’s depth APIs and reliable body metrics live in **ARKit / RealityKit (Swift)**. Expo’s managed workflow does not expose raw LiDAR streams the way a native fitness app would. Credible paths:

1. **Expo dev client + custom native module** that wraps ARKit capture and exposes a thin JS bridge (still hard: metric estimation from meshes is its own product).
2. **Bare React Native or full SwiftUI** app if body scanning is the core SKU.

This repo’s scan UI is explicitly a **visualization and onboarding prototype**, not a medical or metrology instrument.

## Backend & sync

`artifacts/api-server` exposes `/api/coach` (OpenAI when `OPENAI_API_KEY` is set) and `/api/scans` (Postgres when `DATABASE_URL` is set, otherwise in-memory for local dev). The mobile app still stores primary history in **AsyncStorage** until sync UI is built.

## Payments

Ship **StoreKit 2** or **RevenueCat** with products configured in App Store Connect; server-side receipt validation is strongly recommended before entitling Pro features.

## Tests

`pnpm exec vitest run` from `artifacts/sikai` runs unit tests for deterministic scan simulation helpers.
