# Features Research

**Mode:** Project-level features research, written manually (web-research agent was blocked by tool restrictions)
**Date:** 2026-04-30
**Confidence:** MEDIUM. Synthesis is from training data through 2026-01 + the existing app's UI surfaces. Competitor specifics (current 2026 pricing, current capture protocols) are not verified — flagged with `[unverified]` where relevant.
**Scope adjusted:** v1 is weight-loss-only (no body-shape model). Some features that would normally be table stakes for a body-measurement app are deferred to v2.

---

## How this list was scoped

The existing Sik AI app already implies a feature taxonomy via its tab structure (`home`, `scan`, `progress`, `history`, `coach`) and screens (`onboarding`, `paywall`, `settings`, `compare`). I treat those as a starting hypothesis and categorize what should be **real for v1** vs. **deferred** vs. **explicitly cut**.

---

## Table Stakes for v1 (must have or users churn)

These are the features without which a weight-loss body-measurement app cannot ship:

### Capture flow

- **Two-shot capture (front + side)** — industry-standard protocol; reduces single-image depth ambiguity. *Complexity: high.*
- **Live pose / framing guidance** — visible skeleton overlay tells the user when they're framed correctly, when their pose is acceptable, and when to hold still. *Complexity: medium-high.*
- **Capture quality gates** — reject scans where lighting is too dim, framing is wrong, or pose is too far from the target. Force retake rather than producing bad data. *Complexity: medium.*
- **Clothing guidance** — short instructional first-time-user prompt explaining tight clothing or undergarments produce reliable measurements; baggy clothing produces noise. *Complexity: low (UI only).*
- **Phone-placement guidance** — instructions for propping the phone (counter, tripod) vs. holding it. Self-triggered capture (timer or voice). *Complexity: low.*
- **Privacy reassurance** — explicit "photos never leave your phone" message at first scan. *Complexity: low.*

### Measurement output

- **Real measurement values** — waist, hip, chest, neck, shoulders, arms, thighs as circumferences in cm/inches. *Complexity: high (tied to spike outcome).*
- **Per-measurement confidence labeling** — show a small "estimate" badge next to body-fat / muscle-mass numbers since these aren't reliably derivable without a body model. Honest UI > inflated marketing. *Complexity: low (UI only).*
- **Manually-entered weight + BMI** — keep as user input fields, separate from scanned measurements. *Complexity: low (already exists).*
- **Score derivation** — surface number; rules to be defined alongside spike data. *Complexity: low.*

### History & progress

- **Trend lines / charts per measurement** — show waist/hip/chest over time. Already in mock progress tab. *Complexity: low (component exists, swap mock data).*
- **Side-by-side scan comparison** — compare two scans, show the delta on each measurement. Already a screen in the app. *Complexity: low.*
- **Empty-state on first scan** — replace `generateMockData()`; first-time real users see "Take your first scan" not 8 weeks of fake history. *Complexity: low.*

### Onboarding

- **Goal-setting** — weight-loss / general fitness goal selector. Already exists; keep it. *Complexity: low.*
- **First-scan walkthrough** — interactive tutorial during the first capture. *Complexity: medium.*
- **Initial profile capture** — name, age, height, gender, current weight (already exists). *Complexity: low.*

### Reminders & habit

- **Scan-cadence reminders** — opt-in local notifications ("ready for your weekly scan?") via `expo-notifications`. *Complexity: low.*

### Monetization

- **Apple In-App Purchase paywall** — replace the UI-only paywall with real IAP. Standard 7-day free trial → monthly/annual sub is the category default. *Complexity: medium.* `[unverified]` Competitor pricing in 2026 is approximately $5–$15/mo.
- **Free tier limit** — define what the free user gets vs. Pro. Common pattern: free = 1 scan/month + last scan only; Pro = unlimited scans + full history + comparisons + coach commentary. *Complexity: low (gate logic).*

### Settings & maintenance

- **Profile editing** — change name, height, goal. Already exists in mocked form. *Complexity: low.*
- **Data export / delete-all** — required for App Store privacy compliance and good user trust. *Complexity: low.*
- **Demo mode** — opt-in path that loads mock data for App Store screenshots and sales demos, separate from the default empty state. *Complexity: low.*

---

## Differentiators for v1 (could win the category)

These set Sik AI apart from a generic body-measurement clone:

### Privacy-first positioning

- **Strict on-device processing** — explicit, marketed as a feature: photos never leave the phone, no account required, no cloud upload. Differentiator vs. cloud-based competitors like 3DLOOK. *Complexity: enabled by architecture, requires marketing copy.*

### Coach-style commentary

- **AI-generated commentary on real trends** — the coach tab is replaced from canned responses to LLM-generated commentary that reads the user's actual measurement history and surfaces patterns ("your waist has dropped 1.2 cm over the last 3 weeks"). *Complexity: medium.* Open question: cloud LLM (Claude/GPT) or on-device (smaller model)?
- **Goal-personalized framing** — commentary tone differs based on the user's stated goal (weight loss vs. general fitness). *Complexity: low.*

### Scan UX polish (existing asset)

- **The animated LiDAR-style scanner UI** — keep it as a "scanning…" state on top of real capture. The existing visual identity is genuinely better than what most competitors ship. *Complexity: zero (already built).*
- **AR brackets and reticles during capture** — also existing; keep them as live framing aids. *Complexity: zero.*

### Reproducibility focus

- **"Same conditions every time" capture protocol** — stricter-than-competitors framing/lighting/pose gates that lift test-retest reproducibility. The marketed promise: "you'll see real changes, not just measurement noise." *Complexity: emerges from the spike + capture-protocol design.*

---

## Deferred to v2

These are real features, but cost / complexity / license issues push them past v1:

| Feature | Reason for deferral |
|---------|--------------------|
| Body-shape mesh visualization (3D model of the user's body) | Requires SMPL/SMPL-X commercial license. The existing app shows a stylized 3D mesh in mockups; v1 will show flat measurement cards instead. |
| Body-fat % and muscle-mass real measurements | Cannot be reliably derived from heuristic pose-based circumferences. v1 surfaces them as "estimate" labels only or hides them entirely. |
| Gym / hypertrophy tracking (mm-scale weekly muscle changes) | Requires the body-model precision deferred above. v1 marketing must NOT promise this. |
| Cross-device sync / cloud accounts | Requires the dormant backend; out of scope per "on-device-only" decision. |
| HealthKit integration | Out of scope per Validated section in PROJECT.md. |
| LiDAR enhancement on Pro iPhones | Considered, deferred — diminishing returns vs. complexity. |
| Multi-user / family accounts | Single-user device assumption for v1. |
| Coach as conversational chatbot | v1 coach is read-only commentary, not a back-and-forth chat. |

---

## Anti-Features (deliberately don't build)

These belong in `Out of Scope` in PROJECT.md / REQUIREMENTS.md with reasoning:

| Feature | Why we don't build it |
|---------|----------------------|
| Social feed / friends / following | Pulls UX away from the "private health tracker" positioning. Other apps have failed by adding social features that turn the product into a comparison-trap. |
| Public sharing of scans | Same reason. Body imagery is sensitive even when the user owns the choice. |
| BMI shaming / "ideal body" overlays | Body-positive product stance. Show numbers; let the user interpret them. No "you should weigh X" overlays. |
| Calorie tracking / food logging | Out of scope category — not a body-measurement feature. Don't blur into MyFitnessPal territory. |
| Fitness video library / workouts | Same. Stay focused on measurement + tracking. |
| Medical claims / "track diabetes risk" / etc. | Explicit Out of Scope: not a clinical product. App Store will reject medical positioning without FDA-style backing. |
| Weight scale integration (Bluetooth scale) | Cut for v1 to keep scope tight. Could be revisited in v2. |
| Apple Watch companion | Cut for v1. Not core to the value prop. |

---

## Reference competitors (training-data, not verified for 2026)

`[unverified]` — these competitor profiles are from training-data; verify before using in marketing or strategy.

| Product | Capture | Accuracy claim | Notes |
|---------|---------|----------------|-------|
| ZOZOFIT | Polka-dot suit + 360° rotation video on phone | ~±1cm waist/hip | Suit is the differentiator; suit shipping logistics are a real business cost |
| 3DLOOK / YourFit | Front + side photos via web/SDK | ~±1.5cm | API/SDK licensed to apparel and fitness companies; pricing not public |
| Bodygee | Multi-photo capture | ~±1-2cm | German, more apparel-focused historically |
| Sizer | Single image + height input | Claims competitive accuracy | Direct image-to-measurements ML, more apparel than fitness |
| MeThreeSixty | 360° rotation video | ~±1-2cm | Acquired by 3DLOOK in 2021 (per training data) |
| Naked Labs | Smart mirror (defunct) | Hardware-based | Failed because of hardware unit economics |

**Common patterns across all winners:**
- Strict capture protocol (tight clothing, plain background, controlled lighting)
- Explicit reproducibility messaging in onboarding
- Photos never leave the device (or, if they do, are deleted post-processing)
- Multi-photo or video capture, never single-photo
- Trend visualization is the primary user-facing surface, not the absolute number

---

## Roadmap implications

The feature set bins cleanly into the 3-phase structure already implied by the architecture research:

- **Phase 1 (Spike):** Validate the table-stakes Capture-flow + Measurement-output features can deliver weight-loss-grade accuracy. No UI integration yet — pure feasibility test.
- **Phase 2 (Productize measurement):** Wire the spike learnings into the real app — replace simulated scanner, ship two-shot capture protocol, replace mock data, real measurements feeding `AppContext`.
- **Phase 3 (Coach + paywall + ship):** Layer differentiators on top of the working measurement engine — AI commentary, real IAP paywall, polish, App Store submission.

Settings, history, compare, onboarding screens are mostly already built — they need swap-in of real data, not new UI.
