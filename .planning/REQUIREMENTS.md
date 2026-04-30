# Requirements: Sik AI

**Defined:** 2026-04-30
**Core Value:** A user can scan their body with their iPhone and trust the result enough to track real changes over time.

**v1 audience:** weight-loss users (cm-scale change tracking). Gym / hypertrophy precision is deferred to v2.

---

## v1 Requirements

Each requirement maps to a roadmap phase. REQ-IDs follow `[CATEGORY]-[NUMBER]`.

### Spike (Feasibility gate)

The spike is a time-boxed prototype, not a shippable feature. Its requirements describe the **gate decision** the spike must answer.

- [ ] **SPIKE-01**: A throwaway harness app can take front + side photos of a real body using `react-native-vision-camera` and Apple Vision 3D body pose, on a real iPhone (iOS 17+).
- [ ] **SPIKE-02**: The harness extracts circumferences (waist, hip, chest) from 3D pose keypoints + ARKit scale + cylindrical heuristics, with no parametric body-shape model.
- [ ] **SPIKE-03**: The harness produces a written **go/no-go report** containing: same-body test-retest standard deviation per measurement across ≥3 testers spanning low/normal/high BMI, absolute accuracy vs. tape measure, capture-protocol violations encountered, and a recommendation.
- [ ] **SPIKE-04**: The accuracy gate is met when test-retest reproducibility on waist / hip / chest is **±2cm or better across all tested BMI categories**. Failing this gate triggers a re-plan, not a silent continuation.

### Measurement engine (production)

- [ ] **MEAS-01**: User can capture a complete scan — two photos (front + side) — using their iPhone camera. The capture happens entirely on-device.
- [ ] **MEAS-02**: User receives real measurement values for **waist, hip, chest, neck, shoulders, left/right upper arm, left/right thigh** circumferences in cm and inches.
- [ ] **MEAS-03**: User sees an explicit "estimate" badge next to body-fat % and muscle-mass values; these are NOT presented as precise measurements in v1.
- [ ] **MEAS-04**: User's manually entered weight and height feed into the BMI calculation, displayed alongside scan measurements.
- [ ] **MEAS-05**: User sees a derived overall score (0-100) on each scan, with rules documented in code and visible in the UI.
- [ ] **MEAS-06**: All image processing for measurement runs natively in Swift; raw camera frames never cross the React Native bridge or persist to AsyncStorage.

### Capture flow & UX

- [ ] **CAP-01**: User sees a live overlay showing whether their pose, framing, distance, and lighting are acceptable for a measurement-grade scan. Visible green/yellow/red state per check.
- [ ] **CAP-02**: User cannot trigger a capture while any quality gate is red; the app prompts them to fix the issue.
- [ ] **CAP-03**: User can self-trigger capture via a hold-still timer (default 3 seconds) or a voice command, allowing the phone to be propped on a counter / tripod.
- [ ] **CAP-04**: User receives a brief first-time tutorial about clothing (tight clothing or undergarments produce reliable results), phone placement, and lighting before their first scan.
- [ ] **CAP-05**: After a scan, user can review the result and either accept it or retake. Rejected captures do not persist any data.
- [ ] **CAP-06**: A complete scan flow (both photos + processing) finishes in **under 2 minutes** for a user who follows the prompts. (Marketed as a quality goal, not a hard gate.)
- [ ] **CAP-07**: The existing animated LiDAR-style scanner UI, AR brackets, and camera background visuals are reused as the "capturing…" / "processing…" states on top of real capture; no new visual identity is needed.

### Data lifecycle

- [ ] **DATA-01**: First-time users see an empty history; the existing `generateMockData()` seeding is removed from the default first-launch path.
- [ ] **DATA-02**: Raw camera frames and intermediate image data are processed ephemerally in native Swift and discarded as soon as the measurement completes; only the final `ScanRecord` (numbers + ISO date) is persisted.
- [ ] **DATA-03**: A `ScanRecord` saved to AsyncStorage contains only scalar numeric measurements, an ISO 8601 date, the derived score, and optional user notes — no image references, no `photoUri`, no raw keypoints.
- [ ] **DATA-04**: User can delete an individual scan or all scans from Settings.
- [ ] **DATA-05**: User can export their scan history to a JSON file from Settings (shared via the iOS share sheet).

### History, progress, comparison

- [ ] **HIST-01**: User can view a chronological list of all their scans on the History tab.
- [ ] **HIST-02**: User can view trend lines per measurement over time on the Progress tab. Real data replaces the existing mock charts.
- [ ] **HIST-03**: User can select two scans on the Compare tab and see per-measurement deltas (cm / inch / percentage change).
- [ ] **HIST-04**: User can see their latest scan summary on the Home tab with a 1-line trend statement (e.g. "waist down 1.2cm vs. last scan").

### Coach commentary

- [ ] **COACH-01**: After a scan completes, user sees a short AI-generated commentary on their measurement trends (e.g. recognizing sustained progress, flat periods, or noisy / suspicious data) on the Coach tab.
- [ ] **COACH-02**: Coach commentary tone adapts to the user's stated goal (weight loss vs. general fitness) selected in onboarding.
- [ ] **COACH-03**: Coach commentary is opt-in. The user explicitly consents during onboarding to either (a) on-device commentary only, or (b) cloud-LLM commentary using anonymized scan numbers (no images). Default is on-device or "off" — never cloud-by-default.
- [ ] **COACH-04**: Coach never makes medical or clinical claims. Style guide / system prompt documented and reviewed.

### Paywall & monetization

- [ ] **PAY-01**: User can subscribe to Sik AI Pro via Apple In-App Purchase (StoreKit 2 or RevenueCat as wrapper) — no own-server billing.
- [ ] **PAY-02**: Free-tier user can complete 1 scan per calendar month and see only the most recent scan; full history, comparisons, and coach commentary are Pro-gated.
- [ ] **PAY-03**: Pro subscription includes a 7-day free trial, then monthly + annual pricing options. Exact prices defined in the paywall phase.
- [ ] **PAY-04**: Pro user retains full Pro features when offline (no server check required).
- [ ] **PAY-05**: User can restore a prior purchase from Settings (App Store requirement).

### Reminders & habit

- [ ] **NOTIF-01**: User can opt in to local scan-cadence reminders during onboarding (default cadence: weekly).
- [ ] **NOTIF-02**: User can change reminder cadence or disable reminders entirely from Settings.
- [ ] **NOTIF-03**: All reminders are local notifications (`expo-notifications`); no remote push, no server.

### Onboarding

- [ ] **ONBD-01**: User completes a goal-setting flow on first launch (weight loss / general fitness; gym positioning is NOT offered in v1).
- [ ] **ONBD-02**: User enters initial profile data — display name, age, gender, height, current weight, goal — during onboarding. Existing UI is reused.
- [ ] **ONBD-03**: User sees the privacy reassurance ("photos never leave your phone") and consents to camera + photo library permissions during onboarding, before the first scan attempt.
- [ ] **ONBD-04**: Onboarding ends with the first-scan walkthrough described in CAP-04.

### Privacy & compliance

- [ ] **PRIV-01**: App Privacy Manifest declares: camera access, optional notifications, no analytics-by-default, no data leaves the device unless the user opts into cloud coach (COACH-03).
- [ ] **PRIV-02**: No body imagery (raw frames, processed frames, segmented silhouettes) is ever persisted to disk, AsyncStorage, or any cloud service. Enforced in code via Swift-side image-buffer lifecycle.
- [ ] **PRIV-03**: The app passes Apple App Store review for camera privacy, IAP, and lack of medical claims.

### Demo mode

- [ ] **DEMO-01**: A hidden Settings toggle (or build-flag) re-enables the existing 8-week mock-data seeding for App Store screenshots, sales demos, and marketing material. This is opt-in, not the default.
- [ ] **DEMO-02**: Demo mode is visually distinguishable when active (small badge in the UI) so a real user cannot mistake it for genuine data.

---

## v2 Requirements (deferred — tracked but not in current roadmap)

These are real product needs we have intentionally pushed out of v1.

### Body-shape model & gym precision

- **MEAS-V2-01**: User receives ±0.5cm test-retest reproducibility on circumferences (gym-grade), enabling weekly hypertrophy tracking.
- **MEAS-V2-02**: User sees a real 3D body-shape visualization based on a fitted parametric mesh.
- **MEAS-V2-03**: Body-fat % and muscle-mass are real measurements, not "estimate"-labeled approximations.

### Sync & accounts

- **SYNC-V2-01**: User can create an account and sync their scan history across devices.
- **SYNC-V2-02**: User can recover their history after reinstalling the app.

### Wearables

- **WEAR-V2-01**: User can connect a Bluetooth scale and have weight auto-populate alongside scans.
- **WEAR-V2-02**: User has an Apple Watch companion that displays trends and triggers reminders.

### Platform

- **PLAT-V2-01**: Sik AI is available on Android (requires re-evaluating the measurement engine since Apple Vision and ARKit are iOS-only).

---

## Out of Scope

Explicitly excluded. Reasons captured to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Gym / hypertrophy precision tracking in v1 | Requires the body-shape model deferred to v2 due to SMPL commercial-license cost and timeline. |
| Parametric body-shape models (SMPL, SMPL-X, SHAPY, PIXIE, 4D-Humans) in v1 | All carry non-commercial licenses; commercial license cost is unknown. Sidesteppable for the weight-loss audience. |
| Cloud-default coach commentary | Privacy stance is on-device first. Cloud commentary is opt-in only (COACH-03). |
| Cloud sync / cross-device accounts | v1 is single-device; sync is v2. |
| Server-side ML inference / sending body photos to a server | Body imagery never leaves the device. |
| Licensed third-party measurement SDKs (3DLOOK, Bodygee, Sizer, etc.) | Pre-revenue economics make per-scan or annual fees a poor fit. |
| Physical bodysuit (à la ZOZOFIT) | Hardware logistics are a different business. |
| LiDAR-only / Pro-iPhone-only capture | Cuts addressable market; LiDAR isn't a winning sensor for body measurement. |
| Apple Watch / wearable / HealthKit integration in v1 | Out of scope; revisit in v2. |
| Bluetooth scale integration in v1 | Same. |
| Social / sharing features (friends, public profiles, comparison feeds) | Pulls UX away from the private-tracker positioning. |
| Public sharing of scans | Body imagery is sensitive even when user-initiated. |
| Calorie tracking / food logging | Scope discipline — not a body-measurement feature. |
| Workout-video library | Same. |
| Medical or clinical positioning | Consumer fitness only; medical claims trigger App Store review issues. |
| Android | Future workstream; iOS-only for v1. |
| Multi-user / family accounts | Single-user device assumption for v1. |
| Conversational chatbot coach (back-and-forth) | v1 coach is read-only commentary, not chat. |
| `artifacts/mockup-sandbox` work | Unrelated Vite playground; stays as-is. |
| Activating the dormant backend (`artifacts/api-server`, `lib/db`, `lib/api-spec`) | Not used in v1; foundation for v2 cloud-sync. |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SPIKE-01 | Phase 1 | Pending |
| SPIKE-02 | Phase 1 | Pending |
| SPIKE-03 | Phase 1 | Pending |
| SPIKE-04 | Phase 1 | Pending |
| MEAS-01 | Phase 2 | Pending |
| MEAS-02 | Phase 2 | Pending |
| MEAS-03 | Phase 2 | Pending |
| MEAS-04 | Phase 2 | Pending |
| MEAS-05 | Phase 2 | Pending |
| MEAS-06 | Phase 2 | Pending |
| CAP-01 | Phase 3 | Pending |
| CAP-02 | Phase 3 | Pending |
| CAP-03 | Phase 3 | Pending |
| CAP-04 | Phase 3 | Pending |
| CAP-05 | Phase 3 | Pending |
| CAP-06 | Phase 3 | Pending |
| CAP-07 | Phase 3 | Pending |
| DATA-01 | Phase 2 | Pending |
| DATA-02 | Phase 2 | Pending |
| DATA-03 | Phase 2 | Pending |
| DATA-04 | Phase 2 | Pending |
| DATA-05 | Phase 2 | Pending |
| HIST-01 | Phase 3 | Pending |
| HIST-02 | Phase 3 | Pending |
| HIST-03 | Phase 3 | Pending |
| HIST-04 | Phase 3 | Pending |
| COACH-01 | Phase 4 | Pending |
| COACH-02 | Phase 4 | Pending |
| COACH-03 | Phase 4 | Pending |
| COACH-04 | Phase 4 | Pending |
| PAY-01 | Phase 4 | Pending |
| PAY-02 | Phase 4 | Pending |
| PAY-03 | Phase 4 | Pending |
| PAY-04 | Phase 4 | Pending |
| PAY-05 | Phase 4 | Pending |
| NOTIF-01 | Phase 4 | Pending |
| NOTIF-02 | Phase 4 | Pending |
| NOTIF-03 | Phase 4 | Pending |
| ONBD-01 | Phase 3 | Pending |
| ONBD-02 | Phase 3 | Pending |
| ONBD-03 | Phase 3 | Pending |
| ONBD-04 | Phase 3 | Pending |
| PRIV-01 | Phase 2 | Pending |
| PRIV-02 | Phase 2 | Pending |
| PRIV-03 | Phase 4 | Pending |
| DEMO-01 | Phase 4 | Pending |
| DEMO-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 47 total
- Mapped to phases: 47
- Unmapped: 0

---
*Requirements defined: 2026-04-30*
*Last updated: 2026-04-30 — phase mappings added by roadmapper*
