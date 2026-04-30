# Roadmap: Sik AI v1

**Created:** 2026-04-30
**Granularity:** Coarse (3-5 phases)
**Core Value:** A user can scan their body with their iPhone and trust the result enough to track real changes over time.
**Audience (v1):** Weight-loss users — cm-scale change tracking. Gym / hypertrophy precision is v2.

---

## Phases

- [ ] **Phase 1: Feasibility Spike** — Empirical go/no-go gate. Produce test-retest data and a written decision before committing to any productization work.
- [ ] **Phase 2: Native Measurement Engine** — Swift Expo module producing real ScanRecord values; replace mock data; enforce ephemeral image lifecycle.
- [ ] **Phase 3: Capture Flow & History** — Two-shot capture protocol with live quality gates, onboarding integration, and real-data history/progress/compare surfaces.
- [ ] **Phase 4: Coach, Paywall & Ship** — AI coach commentary, Apple IAP, notifications, demo mode, App Store submission.

---

## Phase Details

### Phase 1: Feasibility Spike
**Goal**: Determine empirically whether Apple Vision 3D body pose + ARKit scale + cylindrical heuristics can deliver ±2cm test-retest reproducibility on waist / hip / chest across diverse BMI categories — and produce a written go/no-go decision that gates the entire build path.
**Depends on**: Nothing
**Requirements**: SPIKE-01, SPIKE-02, SPIKE-03, SPIKE-04
**Success Criteria** (what must be TRUE):
  1. A throwaway harness app on a real iPhone (iOS 17+) captures front + side photos using react-native-vision-camera and successfully runs Apple Vision 3D body pose extraction.
  2. The harness produces derived circumference values (waist, hip, chest) for at least 3 real testers spanning low / normal / high BMI categories, with no parametric body-shape model involved.
  3. The go/no-go report exists as a written document containing: same-body test-retest standard deviation per measurement, absolute accuracy vs. tape measure, and a clear recommendation.
  4. The accuracy gate decision is documented: either "test-retest reproducibility is ±2cm or better across all BMI categories tested — proceed to Phase 2" OR "gate failed — re-plan before proceeding."
**Plans**: TBD

---

### Phase 2: Native Measurement Engine
**Goal**: Productize the spike's validated approach as a Swift Expo Module that the existing sikai app can call, producing real ScanRecord values with a strict ephemeral image lifecycle, replacing all mock data seeding.
**Depends on**: Phase 1 (go decision required)
**Requirements**: MEAS-01, MEAS-02, MEAS-03, MEAS-04, MEAS-05, MEAS-06, DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, PRIV-01, PRIV-02
**Success Criteria** (what must be TRUE):
  1. A TestFlight build of artifacts/sikai completes a real two-shot scan and produces non-zero numeric measurements for waist, hip, chest, neck, shoulders, and arms/thighs — with no mock data involved.
  2. First-time users see an empty history on launch; generateMockData() is no longer called on the default path.
  3. Body-fat % and muscle-mass values are visually distinguished as estimates in the UI; weight and BMI display based on user-entered values.
  4. After a scan completes, no camera frames or intermediate image data remain accessible in AsyncStorage, iCloud Backup, or the photo library — only the final ScanRecord (scalars + date + score) is persisted.
  5. User can delete individual scans or their entire history, and export scan history as a JSON file via the iOS share sheet.
**Plans**: TBD
**UI hint**: yes

---

### Phase 3: Capture Flow & History
**Goal**: Deliver a two-shot capture flow that real users complete unassisted in under 2 minutes — with live pose / framing / lighting quality gates, clear clothing and placement guidance, and history / progress / compare screens wired to real scan data.
**Depends on**: Phase 2
**Requirements**: CAP-01, CAP-02, CAP-03, CAP-04, CAP-05, CAP-06, CAP-07, HIST-01, HIST-02, HIST-03, HIST-04, ONBD-01, ONBD-02, ONBD-03, ONBD-04
**Success Criteria** (what must be TRUE):
  1. During a scan, the user sees a live green / yellow / red indicator overlay for pose alignment, framing, distance, and lighting — and cannot trigger capture while any gate is red.
  2. A user who has never used the app before completes onboarding (goal selection, profile entry, privacy consent, first-scan tutorial) and arrives at the scan screen ready to scan.
  3. A solo user (phone propped on a counter) completes both the front and side shots, accepts the result, and sees it saved to history — in under 2 minutes.
  4. The History, Progress, and Compare tabs display real scan data: chronological list, per-measurement trend lines, and two-scan delta comparison respectively.
  5. The Home tab shows the latest scan summary with a one-line trend statement based on real data (e.g., "waist down 1.2cm vs. last scan").
**Plans**: TBD
**UI hint**: yes

---

### Phase 4: Coach, Paywall & Ship
**Goal**: Complete the product by shipping real AI coach commentary tied to user measurement history, a functional Apple IAP paywall, local scan-cadence reminders, demo mode for marketing, and passing App Store review.
**Depends on**: Phase 3
**Requirements**: COACH-01, COACH-02, COACH-03, COACH-04, PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, NOTIF-01, NOTIF-02, NOTIF-03, PRIV-03, DEMO-01, DEMO-02
**Success Criteria** (what must be TRUE):
  1. After a scan, the Coach tab displays AI-generated commentary referencing the user's actual measurement trends — not a canned response — and the commentary never makes medical or clinical claims.
  2. A free-tier user who has completed 1 scan this calendar month is blocked from scanning again and shown a paywall; a subscriber with an active Apple IAP subscription can scan without restriction, including when offline.
  3. Sik AI v1 is live on the App Store and passes review for camera privacy, IAP, age rating, and absence of unsupported health claims.
  4. A user who opts in during onboarding receives a weekly local notification prompting them to scan, and can change or disable the cadence from Settings.
  5. Demo mode can be activated via a hidden Settings toggle, seeds the existing 8-week mock data, and shows a visible badge distinguishing it from real data — and is off by default on first launch.
**Plans**: TBD

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Feasibility Spike | 0/0 | Not started | - |
| 2. Native Measurement Engine | 0/0 | Not started | - |
| 3. Capture Flow & History | 0/0 | Not started | - |
| 4. Coach, Paywall & Ship | 0/0 | Not started | - |

---

## Coverage

| Phase | Requirements | Count |
|-------|-------------|-------|
| Phase 1 | SPIKE-01, SPIKE-02, SPIKE-03, SPIKE-04 | 4 |
| Phase 2 | MEAS-01, MEAS-02, MEAS-03, MEAS-04, MEAS-05, MEAS-06, DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, PRIV-01, PRIV-02 | 13 |
| Phase 3 | CAP-01, CAP-02, CAP-03, CAP-04, CAP-05, CAP-06, CAP-07, HIST-01, HIST-02, HIST-03, HIST-04, ONBD-01, ONBD-02, ONBD-03, ONBD-04 | 15 |
| Phase 4 | COACH-01, COACH-02, COACH-03, COACH-04, PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, NOTIF-01, NOTIF-02, NOTIF-03, PRIV-03, DEMO-01, DEMO-02 | 15 |
| **Total** | | **47 / 47** |

---

*Last updated: 2026-04-30 — initial roadmap created*
