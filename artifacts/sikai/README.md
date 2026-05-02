# Sik AI — Body Scanning & Measurement Tracker

> A premium iOS fitness app powered by GPT-4.1 Vision AI that scans your body through the camera, tracks 11 precise measurements over time, and coaches you with a personalized AI fitness guide. Built with Expo / React Native on a dark UI with an emerald accent theme.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Screens](#screens)
- [Scan Flow](#scan-flow)
- [File Structure](#file-structure)
- [Color Palette](#color-palette)
- [Measurements Tracked](#measurements-tracked)
- [Local Development with Expo Go](#local-development-with-expo-go)
- [Building for Production](#building-for-production)
- [Project Configuration](#project-configuration)
- [Data & Persistence](#data--persistence)
- [API Server](#api-server)

---

## Overview

Sik AI uses GPT-4.1 Vision to analyze camera photos and return real body measurements. It tracks 11 body metrics over time, visualizes progress with interactive charts, and provides an AI coaching interface. All profile and scan data is stored locally using AsyncStorage.

| | |
|---|---|
| **Bundle ID** | `com.sikai.bodyscanner` |
| **Platform** | iOS 17+ (portrait only) |
| **Framework** | Expo SDK 54 / React Native 0.81 |
| **Architecture** | New Architecture enabled (`newArchEnabled: true`) |
| **Navigation** | Expo Router (file-based) — 5-tab layout |
| **Theme** | Dark only (`userInterfaceStyle: dark`) |
| **AI** | GPT-4.1 Vision via Express API server |

---

## Key Features

### AI-Powered Body Scanner
- Camera photo → GPT-4.1 Vision API → real body measurements in seconds
- **Pre-scan checklist** modal with 5 environment tips before capture (lighting, distance, pose, clothing, camera height)
- Optional front + side photo for improved accuracy
- **LiDAR animation** during processing — 500+ point cloud dots over body silhouette with scan beam
- **Confidence scores** on every measurement (e.g. `97.2 cm ±1.5`)
- **Outlier detection** — warns when any measurement deviates >5 cm / >5% / >5 kg from your previous scan
- Graceful fallback to generated data if AI is unavailable

### Units System
- Full **metric ↔ imperial** toggle in Settings (cm/kg vs in/lbs)
- All measurement displays app-wide update instantly — dashboard, scan results, history, profile card
- Conversion is display-only; all data stored internally in metric

### Dashboard & Analytics
- Fitness score ring (0–100) with animated arc
- Body diagram with tappable zones showing live measurements
- 8 weeks of seeded mock data for immediate visual richness
- Key metric cards: Weight, Body Fat %, BMI, Muscle Mass

### Progress & History
- Full scan history list sorted by date with expandable measurement rows
- Per-measurement trend charts for all 10 metrics
- 8-week summary with Weight Lost, Fat Lost, Muscle Gained, Score Improved

### Compare
- Side-by-side Before/After comparison table for any two scans
- Color-coded change column (green = improvement, red = regression)
- Smart empty state when fewer than 2 scans exist

### AI Coach
- Conversational chat interface with AI fitness recommendations
- Context-aware responses based on your latest scan data and goal
- Inverted FlatList with keyboard-aware input (native iOS chat behavior)
- Quick-question shortcuts for common queries

### CSV Export
- Export full scan history as a CSV file (15 columns per scan)
- Uses native iOS Share sheet — save to Files, AirDrop, email, or any app

### Paywall
- 3-tier pricing: **Free** / **Pro** ($9.99/mo or $79.99/yr) / **Pro+** ($19.99/mo)
- 7-day free trial badge
- Free vs Pro feature comparison table
- Pro+ extras card (HealthKit sync, PDF reports, Priority AI) when Pro+ is selected

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
| Keyboard | react-native-keyboard-controller | latest |
| Camera | expo-image-picker | ~16.1.4 |
| Haptics | expo-haptics | ~15.0.8 |
| Safe Area | react-native-safe-area-context | ~5.6.0 |
| State | React Context API + AsyncStorage | — |
| Fonts | @expo-google-fonts/inter | ^0.4.0 |
| Gestures | react-native-gesture-handler | ~2.28.0 |

---

## Screens

| Screen | File | Description |
|--------|------|-------------|
| Onboarding | `app/onboarding.tsx` | 3-step intro + profile setup (name, age, height, weight, goal, gender) |
| Dashboard | `app/(tabs)/index.tsx` | Score ring, body diagram, key metrics, measurements grid, quick actions |
| Scan | `app/(tabs)/scan.tsx` | Pre-scan checklist → camera → AI analysis → results with confidence scores |
| AI Coach | `app/(tabs)/coach.tsx` | Chat-style AI coaching with context from your scans |
| History | `app/(tabs)/history.tsx` | Chronological scan list with expandable detail rows |
| Progress | `app/(tabs)/progress.tsx` | Per-measurement trend charts, 8-week summary grid |
| Compare | `app/compare.tsx` | Side-by-side before/after scan comparison table |
| Paywall | `app/paywall.tsx` | 3-tier subscription screen with trial badge |
| Settings | `app/settings.tsx` | Profile, units toggle, notifications, CSV export, data reset |

---

## Scan Flow

1. User taps **Take Front Photo** on the Scan tab
2. **Pre-scan checklist modal** slides up with 5 environment tips
3. User taps **I'm Ready** → `expo-image-picker` opens camera
4. Optional: take a **side photo** for better accuracy
5. Tap **Analyze with AI** → photos + profile sent to `POST /api/scan/analyze`
6. **LiDAR animation** plays while the API processes (progress gates at 85% until response arrives)
7. GPT-4.1 Vision analyzes photos + profile → returns real measurements
8. **Results panel** slides up showing: score ring, body fat %, muscle mass, BMI, all 11 measurements with ±confidence, AI insights text
9. **Outlier warning** banner appears if any measurement deviates significantly from the previous scan
10. Tap **Save Scan** → stored to AsyncStorage scan history
11. Fallback: if AI is unavailable, realistic values are generated from profile data

---

## File Structure

```
artifacts/sikai/
├── app/                          # Expo Router pages (file = route)
│   ├── _layout.tsx               # Root layout — fonts, splash, AppContext provider
│   ├── index.tsx                 # Redirects to /onboarding or /(tabs)
│   ├── onboarding.tsx            # 4-step onboarding flow
│   ├── compare.tsx               # Before/After comparison screen
│   ├── paywall.tsx               # 3-tier subscription paywall
│   ├── settings.tsx              # App settings (units, notifications, export, reset)
│   ├── +not-found.tsx            # 404 fallback
│   └── (tabs)/                   # 5-tab navigator
│       ├── _layout.tsx           # Tab bar — NativeTabs (iOS 26) + BlurView fallback
│       ├── index.tsx             # Dashboard tab
│       ├── scan.tsx              # Scan tab (core AI feature)
│       ├── coach.tsx             # AI Coach chat tab
│       ├── history.tsx           # History tab
│       └── progress.tsx          # Progress charts tab
│
├── components/                   # Shared UI components
│   ├── LiDARScanner.tsx          # Core scanner — 500+ dot point cloud, scan beam, HUD
│   ├── CameraBackground.tsx      # Camera simulation (noise, scanlines, vignette)
│   ├── ARScanAnimation.tsx       # AR-style zone bracket animations
│   ├── BodyDiagram.tsx           # Tappable body outline SVG diagram
│   ├── ScanScoreRing.tsx         # Animated circular score ring (0–100)
│   ├── ProgressChart.tsx         # SVG area/line chart for measurement trends
│   ├── MetricCard.tsx            # Single-measurement stat card with change delta
│   ├── GradientCard.tsx          # Reusable card with emerald gradient border
│   ├── ErrorBoundary.tsx         # React error boundary wrapper
│   ├── ErrorFallback.tsx         # Error UI fallback
│   └── KeyboardAwareScrollViewCompat.tsx  # Cross-platform keyboard avoidance
│
├── context/
│   └── AppContext.tsx            # Global state — profile, scans, chat, seed data
│
├── hooks/
│   ├── useColors.ts              # Returns active color scheme design tokens
│   └── useUnits.ts               # Unit conversion helpers (metric ↔ imperial)
│
├── constants/
│   └── colors.ts                 # Full design token palette
│
├── assets/
│   └── images/
│       └── icon.png              # App icon
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
| `emerald` | `#10B981` | Primary accent — buttons, highlights, active states |
| `emeraldDim` | `#059669` | Pressed/secondary emerald |
| `emeraldGlow` | `rgba(16,185,129,0.15)` | Glow halos, icon backgrounds |
| `border` | `#2A2A2A` | Dividers and card edges |
| `foreground` | `#F9FAFB` | Primary text |
| `textSecondary` | `#9CA3AF` | Subtitles, labels |
| `textTertiary` | `#4B5563` | Placeholder, muted text |
| `chartBlue` | `#3B82F6` | Secondary chart series |
| `chartOrange` | `#F59E0B` | Tertiary chart series |
| `destructive` | `#EF4444` | Delete actions, negative deltas |

---

## Measurements Tracked

Sik AI tracks **11 body measurements** per scan. All values stored in metric (cm/kg); displayed in metric or imperial based on user preference.

| Key | Label | Unit |
|-----|-------|------|
| `chest` | Chest | cm / in |
| `waist` | Waist | cm / in |
| `hips` | Hips | cm / in |
| `leftArm` | Left Arm | cm / in |
| `rightArm` | Right Arm | cm / in |
| `leftThigh` | Left Thigh | cm / in |
| `rightThigh` | Right Thigh | cm / in |
| `neck` | Neck | cm / in |
| `shoulders` | Shoulders | cm / in |
| `bodyFat` | Body Fat | % |
| `muscleMass` | Muscle Mass | kg / lbs |

Each scan record also includes: `id`, `date` (ISO 8601), `score` (0–100), `weight`, and `bmi`.

---

## Local Development with Expo Go

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| pnpm | 9+ | `npm install -g pnpm` |
| Expo Go app | Latest | [iOS App Store](https://apps.apple.com/app/expo-go/id982107779) |

### Step 1 — Clone & install

```bash
git clone https://github.com/Sanjay-995/sik-ai.git
cd sik-ai
pnpm install
```

### Step 2 — Start the Expo dev server

```bash
cd artifacts/sikai
npx expo start
```

Or from the repo root:

```bash
pnpm --filter @workspace/sikai dev
```

### Step 3 — Open in Expo Go

1. Ensure your phone and computer are on the **same Wi-Fi network**
2. Scan the **QR code** with:
   - **iOS**: Camera app → point at QR code → tap the Expo Go banner
   - **Android**: Open Expo Go → tap "Scan QR Code"
3. App bundles and opens in ~15–30 seconds

### Useful Expo CLI flags

```bash
# Clear Metro cache (fixes most "module not found" errors)
npx expo start --clear

# iOS Simulator (requires Xcode + macOS)
npx expo start --ios

# Android emulator (requires Android Studio)
npx expo start --android

# Browser preview (limited — some native modules won't work)
npx expo start --web
```

---

## Building for Production

Production builds are handled via **Replit Expo Launch** (App Store / iOS only). To build manually with EAS:

```bash
npm install -g eas-cli
eas login
cd artifacts/sikai
eas build:configure

# Development build (for testing on device)
eas build --profile development --platform ios

# App Store build
eas build --profile production --platform ios
```

> Ensure the `bundleIdentifier` in `app.json` (`com.sikai.bodyscanner`) matches your Apple Developer App ID.

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

### Tab navigation

The tab bar supports two modes selected at runtime:
- **NativeTabs** (iOS 26+) — uses `expo-router/unstable-native-tabs` with SF Symbols and liquid glass tab bar
- **Classic Tabs** — Expo Router `Tabs` with `BlurView` frosted glass background (iOS < 26 and Android)

---

## Data & Persistence

All data is stored **100% on-device** using `@react-native-async-storage/async-storage`. No account or internet connection required to use the app (AI scan analysis requires a connection).

### `AppContext` (`context/AppContext.tsx`)

The global context provider exposes:

```ts
{
  profile: UserProfile;              // Name, age, height, weight, goal, gender, units, isPro
  updateProfile: (p) => Promise<void>;
  scanHistory: ScanRecord[];         // All scans, newest-first
  addScan: (s) => Promise<void>;     // Save a scan to AsyncStorage
  latestScan: ScanRecord | null;
  previousScan: ScanRecord | null;
  chatMessages: ChatMessage[];       // AI coach conversation history
  addChatMessage: (m) => Promise<void>;
  clearChat: () => Promise<void>;
}
```

### `useUnits` hook (`hooks/useUnits.ts`)

Reads `profile.units` and returns conversion helpers:

```ts
const { fmtLen, fmtWt, fmtHt, convertLen, convertWt, lenUnit, wtUnit } = useUnits();

fmtLen(97.5)   // "97.5 cm"  or  "38.4 in"
fmtWt(82)      // "82.0 kg"  or  "180.8 lbs"
fmtHt(178)     // "178 cm"   or  "5'10\""
```

All storage stays in metric (cm/kg). Conversion is display-only.

### Seeded mock data

On first launch, `AppContext` seeds **8 weeks of realistic scan data** so every chart and history screen shows meaningful content immediately.

### Scan data shape

```ts
type ScanRecord = {
  id: string;
  date: string;             // ISO 8601
  score: number;            // 0–100 fitness score
  weight: number;           // kg
  bmi: number;
  measurements: {
    chest: number;          // cm
    waist: number;
    hips: number;
    leftArm: number;
    rightArm: number;
    leftThigh: number;
    rightThigh: number;
    neck: number;
    shoulders: number;
    bodyFat: number;        // percentage
    muscleMass: number;     // kg
  };
};
```

---

## API Server

The Express API server (`artifacts/api-server`) handles AI analysis and runs alongside the Expo app.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/healthz` | Health check |
| `POST` | `/api/scan/analyze` | AI body scan analysis |

### `POST /api/scan/analyze`

**Request body:**
```json
{
  "frontImage": "<base64 JPEG>",
  "sideImage": "<base64 JPEG — optional>",
  "profile": {
    "height": 178,
    "weight": 82,
    "age": 28,
    "gender": "male",
    "goal": "build_muscle"
  }
}
```

**Response:**
```json
{
  "measurements": {
    "chest": 97.2, "waist": 81.5, "hips": 96.1,
    "leftArm": 36.4, "rightArm": 36.8,
    "leftThigh": 58.9, "rightThigh": 59.2,
    "neck": 38.5, "shoulders": 122.7,
    "bodyFat": 16.3, "muscleMass": 43.1
  },
  "weight": 82,
  "bmi": 25.9,
  "score": 84,
  "insights": ["Your waist-to-hip ratio improved...", "..."]
}
```

The server uses GPT-4.1 Vision via the Replit AI Integrations proxy.

---

## License

Private — all rights reserved.
