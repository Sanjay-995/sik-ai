# Sik AI — Body Scanning & Measurement Tracker

> A premium iOS fitness app that uses a simulated LiDAR body scanner to track 11 body measurements over time, powered by Expo / React Native with a stunning dark UI and emerald accent theme.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Screens](#screens)
- [File Structure](#file-structure)
- [Color Palette](#color-palette)
- [Measurements Tracked](#measurements-tracked)
- [Local Development with Expo Go](#local-development-with-expo-go)
- [Building for Production](#building-for-production)
- [Project Configuration](#project-configuration)
- [Data & Persistence](#data--persistence)

---

## Overview

Sik AI is a fully dark-themed iOS fitness application with a **demo body-scan flow** (no real LiDAR or depth camera), illustrative measurements, and optional **live coaching** when you point the app at a running `api-server` with `OPENAI_API_KEY`. Scan history defaults to **empty**; you can load labeled demo data from Settings for UI review. On-device data still uses AsyncStorage until sync is wired.

| | |
|---|---|
| **Bundle ID** | `com.sikai.bodyscanner` |
| **Platform** | iOS 17+ (portrait only) |
| **Framework** | Expo SDK 54 / React Native 0.81 |
| **Architecture** | New Architecture enabled (`newArchEnabled: true`) |
| **Navigation** | Expo Router (file-based) — 5-tab layout |
| **Theme** | Dark only (`userInterfaceStyle: dark`) |

---

## Key Features

### LiDAR Body Scanner
- **500+ point cloud dots** fill a full-body silhouette rendered with React Native SVG
- Dots reveal **top-to-bottom** driven by a `progress` prop (0–100)
- **Glow band** highlights the recently-revealed frontier
- Measurement **brackets** animate outward on key body zones (chest, waist, hips, arms)
- HUD overlay with live measurement readouts
- **Scan beam** — an `Animated.View` sweeping top-to-bottom over the body cloud

### Camera Background Simulation
- 380+ **static noise pixels** that shift position every 80 ms
- Horizontal **scan lines** every 3 px
- **Radial vignette** darkened at edges
- Top/bottom **gradient fade** to transparent
- **Camera flicker** effect and night-vision tint during active scanning

### Dashboard & Analytics
- Fitness score ring (0–100) with animated arc
- **Optional** 8 weeks of labeled demo history (Settings → Data) for chart QA — not auto-seeded as real user data
- Weekly trend chart per measurement
- Before/After **comparison view** with side-by-side body diagrams

### AI Coach Tab
- Conversational interface providing personalized insights
- Recommendations derived from recent scan delta values

### Progress & History
- Full scan history list sorted by date
- Per-measurement progress charts (area/line with `react-native-svg`)
- Percentage change badges (positive = green, negative = red)

### Paywall & Settings
- Subscription paywall screen (UI only — ready for RevenueCat integration)
- Settings screen: units (metric/imperial), notification preferences, data reset

---

## Tech Stack

| Category | Library | Version |
|----------|---------|---------|
| Framework | Expo | ~54.0.27 |
| Language | TypeScript | ~5.9.2 |
| Navigation | expo-router | ~6.0.17 |
| Animations | react-native-reanimated | ~4.1.1 |
| Charts/Graphics | react-native-svg | 15.12.1 |
| Persistence | @react-native-async-storage/async-storage | 2.2.0 |
| Gradients | expo-linear-gradient | ~15.0.8 |
| Haptics | expo-haptics | ~15.0.8 |
| State | React Context API | — |
| Fonts | @expo-google-fonts/inter | ^0.4.0 |
| Gestures | react-native-gesture-handler | ~2.28.0 |
| Safe Area | react-native-safe-area-context | ~5.6.0 |

---

## Screens

| Screen | File | Description |
|--------|------|-------------|
| Splash / Onboarding | `app/onboarding.tsx` | Animated intro with brand logo, value props, and CTA to start scanning |
| Dashboard | `app/(tabs)/index.tsx` | Score ring, recent scan summary, quick-action cards |
| Scan | `app/(tabs)/scan.tsx` | Full-screen immersive LiDAR scanner; slide-up results panel after scan |
| AI Coach | `app/(tabs)/coach.tsx` | Chat-style coaching recommendations |
| History | `app/(tabs)/history.tsx` | Chronological list of all past scans with thumbnails |
| Progress | `app/(tabs)/progress.tsx` | Per-measurement trend charts over 8 weeks |
| Compare | `app/compare.tsx` | Side-by-side before/after scan comparison |
| Paywall | `app/paywall.tsx` | Premium subscription upsell screen |
| Settings | `app/settings.tsx` | Units, notifications, data management |

---

## File Structure

```
artifacts/sikai/
├── app/                          # Expo Router pages (file = route)
│   ├── _layout.tsx               # Root layout — fonts, splash, AppContext provider
│   ├── index.tsx                 # Redirects to /onboarding or /(tabs)
│   ├── onboarding.tsx            # Onboarding flow
│   ├── compare.tsx               # Before/After comparison screen
│   ├── paywall.tsx               # Subscription paywall
│   ├── settings.tsx              # App settings
│   ├── +not-found.tsx            # 404 fallback
│   └── (tabs)/                   # 5-tab navigator
│       ├── _layout.tsx           # Tab bar config (icons, labels, colors)
│       ├── index.tsx             # Dashboard tab
│       ├── scan.tsx              # Scan tab (main feature)
│       ├── coach.tsx             # AI Coach tab
│       ├── history.tsx           # History tab
│       └── progress.tsx          # Progress tab
│
├── components/                   # Shared UI components
│   ├── LiDARScanner.tsx          # ★ Core scanner — 500+ dot point cloud, scan beam, HUD
│   ├── CameraBackground.tsx      # Camera simulation (noise, scanlines, vignette)
│   ├── ARScanAnimation.tsx       # AR-style zone bracket animations
│   ├── BodyDiagram.tsx           # Static body outline SVG diagram
│   ├── ScanScoreRing.tsx         # Animated circular score ring (0–100)
│   ├── ProgressChart.tsx         # SVG area/line chart for measurement trends
│   ├── MetricCard.tsx            # Single-measurement stat card
│   ├── GradientCard.tsx          # Reusable card with emerald gradient border
│   ├── ErrorBoundary.tsx         # React error boundary wrapper
│   ├── ErrorFallback.tsx         # Error UI fallback
│   └── KeyboardAwareScrollViewCompat.tsx  # Cross-platform keyboard avoidance
│
├── context/
│   └── AppContext.tsx            # Global state — scans, measurements, 8-week seed data
│
├── constants/
│   └── colors.ts                 # Full design token palette
│
├── hooks/
│   └── useColors.ts              # Hook returning the active color scheme tokens
│
├── assets/
│   └── images/
│       └── icon.png              # App icon (used for splash + home screen)
│
├── app.json                      # Expo config (bundle ID, permissions, plugins)
├── babel.config.js               # Babel config (React Compiler + Reanimated plugin)
├── metro.config.js               # Metro bundler config
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies
```

---

## Color Palette

All tokens live in `constants/colors.ts` and are consumed via the `useColors()` hook.

| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#0A0A0A` | Screen backgrounds |
| `card` | `#1A1A1A` | Card/panel backgrounds |
| `surface` | `#141414` | Slightly elevated surfaces |
| `emerald` / `primary` | `#10B981` | Primary accent — buttons, highlights, dots |
| `emeraldDim` | `#059669` | Pressed/secondary emerald |
| `emeraldGlow` | `rgba(16,185,129,0.15)` | Glow halos around dots and rings |
| `border` | `#2A2A2A` | Dividers and card edges |
| `textSecondary` | `#9CA3AF` | Subtitles, labels |
| `textTertiary` | `#4B5563` | Placeholder, muted text |
| `chartBlue` | `#3B82F6` | Secondary chart series |
| `chartOrange` | `#F59E0B` | Tertiary chart series |
| `destructive` | `#EF4444` | Delete actions, negative deltas |

---

## Measurements Tracked

Sik AI tracks **11 body measurements** per scan, stored as numeric values in centimeters (or inches depending on user preference):

| Key | Label |
|-----|-------|
| `chest` | Chest |
| `waist` | Waist |
| `hips` | Hips |
| `leftArm` | Left Arm |
| `rightArm` | Right Arm |
| `leftThigh` | Left Thigh |
| `rightThigh` | Right Thigh |
| `neck` | Neck |
| `shoulders` | Shoulders |
| `bodyFat` | Body Fat % |
| `muscleMass` | Muscle Mass % |

Each scan record also includes: `id`, `date`, `score` (0–100), and `photoUri` (optional).

---

## Local Development with Expo Go

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| pnpm | 9+ | `npm install -g pnpm` |
| Expo Go app | Latest | [iOS App Store](https://apps.apple.com/app/expo-go/id982107779) |
| Expo CLI | Installed via devDeps | — |

### Step 1 — Clone the repo

```bash
git clone https://github.com/Sanjay-995/sik-ai.git
cd sik-ai
```

### Step 2 — Install dependencies

This is a pnpm workspace. Run the install from the **repo root**:

```bash
pnpm install
```

### Step 3 — Start the Expo dev server

Navigate into the app directory and start the bundler:

```bash
cd artifacts/sikai
npx expo start
```

Or from the repo root using the pnpm filter:

```bash
pnpm --filter @workspace/sikai dev
```

> The `dev` script in `package.json` passes several environment variables needed for the Replit hosting environment. When running **locally outside Replit**, use `npx expo start` directly inside `artifacts/sikai/` instead.

### Step 4 — Open in Expo Go

1. Make sure your **phone and computer are on the same Wi-Fi network**
2. Scan the **QR code** printed in the terminal with:
   - **iOS**: Camera app → point at QR code → tap the Expo Go banner
   - **Android**: Open Expo Go → tap "Scan QR Code"
3. The app will bundle and open in Expo Go in ~15–30 seconds

### Step 5 — Hot reload

Any file change in `artifacts/sikai/` will trigger a **fast refresh** automatically — no need to restart the server.

### Useful Expo CLI flags

```bash
# Clear Metro cache (fixes most "module not found" errors)
npx expo start --clear

# Open in iOS Simulator (requires Xcode + macOS)
npx expo start --ios

# Open in Android emulator (requires Android Studio)
npx expo start --android

# Open in browser (limited — some native modules won't work)
npx expo start --web
```

---

## Building for Production

### EAS Build (recommended)

[EAS Build](https://docs.expo.dev/build/introduction/) is Expo's managed cloud build service — no local Xcode required.

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Log in to your Expo account
eas login

# Configure your project (first time only)
cd artifacts/sikai
eas build:configure

# Build a development client (for testing on device)
eas build --profile development --platform ios

# Build for the App Store
eas build --profile production --platform ios
```

> Make sure the `bundleIdentifier` in `app.json` (`com.sikai.bodyscanner`) matches your Apple Developer account App ID.

### Local iOS Build (requires macOS + Xcode 15+)

```bash
cd artifacts/sikai

# Generate the native ios/ directory
npx expo prebuild --platform ios --clean

# Open in Xcode
open ios/SikAI.xcworkspace
```

Then select your device/simulator and press **Run** (⌘R) in Xcode.

---

## Project Configuration

### `app.json` highlights

```json
{
  "expo": {
    "name": "Sik AI",
    "slug": "sikai",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "dark",
    "newArchEnabled": true,
    "backgroundColor": "#0A0A0A",
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.sikai.bodyscanner"
    }
  }
}
```

### Babel config

Located at `babel.config.js`. Includes:
- **`babel-plugin-react-compiler`** — experimental React Compiler for automatic memoization
- **`react-native-reanimated/plugin`** — required for Reanimated 3 worklets

### Metro config

Located at `metro.config.js`. Standard Expo Metro config with SVG transformer support via `react-native-svg`.

---

## Data & Persistence

Primary storage is **on-device** (`@react-native-async-storage/async-storage`). The monorepo also includes **`artifacts/api-server`** with `/api/coach` (OpenAI proxy) and `/api/scans` (Postgres when `DATABASE_URL` is set, otherwise in-memory for local dev). The app does not sync automatically yet — see `NATIVE_ROADMAP.md`.

**Local Postgres (Docker):** from the monorepo root, run `pnpm run db:up`, copy `artifacts/api-server/.env.example` → `artifacts/api-server/.env`, then `pnpm run db:push`. Start the API with `pnpm --filter @workspace/api-server run dev` (or `build` + `start` with `PORT` set).

### `AppContext` (`context/AppContext.tsx`)

The global context exposes profile, scan history, chat, `scanDataSource` (`empty` | `live` | `demo` | `legacy_demo`), and helpers such as `loadDemoScanHistory()`.

### Demo vs live data

Charts treat **demo** and **legacy_demo** sources as synthetic (banner on the dashboard). Saving a real scan from the demo flow clears demo rows and marks the source **live**.

### Scan data shape

```ts
type Scan = {
  id: string;
  date: string;                // ISO 8601
  score: number;               // 0–100 fitness score
  measurements: {
    chest: number;
    waist: number;
    hips: number;
    leftArm: number;
    rightArm: number;
    leftThigh: number;
    rightThigh: number;
    neck: number;
    shoulders: number;
    bodyFat: number;           // percentage
    muscleMass: number;        // percentage
  };
  photoUri?: string;
};
```

---

## Planned Integrations

| Feature | Status | Notes |
|---------|--------|-------|
| RevenueCat subscriptions | UI ready | Paywall screen built; SDK not yet integrated |
| Apple Health (HealthKit) | Planned | `expo-health` when available |
| Camera / AR scanning | Planned | Real LiDAR via `VisionCamera` or ARKit |
| Push notifications | Planned | `expo-notifications` for scan reminders |
| iCloud sync | Planned | For cross-device data backup |

---

## License

Private — all rights reserved.
