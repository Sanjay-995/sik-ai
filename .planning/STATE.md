---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 01
current_plan: 1
status: executing
last_updated: "2026-05-01T05:11:34.489Z"
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 7
  completed_plans: 0
  percent: 0
---

# State: Sik AI v1

**Last updated:** 2026-04-30
**Milestone:** v1

---

## Project Reference

**Core value:** A user can scan their body with their iPhone and trust the result enough to track real changes over time.

**v1 audience:** Weight-loss users — cm-scale change tracking (±2cm reproducibility target). Gym / hypertrophy precision is v2.

**Architecture decisions locked:**

- No parametric body-shape model (SMPL/SMPL-X family) — sidesteps MPI commercial-license risk
- Measurement primitive: Apple Vision 3D body pose + ARKit scale + cylindrical heuristics
- Two-shot capture protocol (front + side)
- All processing in native Swift; only scalar measurements cross the RN bridge
- On-device only — no cloud sync, no server-side storage in v1
- Apple IAP (StoreKit 2 / RevenueCat) for monetization

---

## Current Position

Phase: 01 (feasibility-spike) — EXECUTING
Plan: 1 of 7
**Current phase:** 01
**Current plan:** 1
**Status:** Executing Phase 01

**Progress:**

```
[Phase 1: Feasibility Spike      ] ░░░░░░░░░░ Not started
[Phase 2: Native Measurement Eng ] ░░░░░░░░░░ Not started
[Phase 3: Capture Flow & History ] ░░░░░░░░░░ Not started
[Phase 4: Coach, Paywall & Ship  ] ░░░░░░░░░░ Not started
```

---

## Performance Metrics

- Scans completed: 0 (real)
- Phases complete: 0 / 4
- Plans complete: 0 / 0 (plans not yet created)
- Requirements done: 0 / 47

---

## Accumulated Context

### Decisions Made

| Decision | Rationale | Phase |
|----------|-----------|-------|
| v1 ships without parametric body-shape model | Removes SMPL/MPI commercial license risk (unknown cost, weeks-long negotiation). ±2cm acceptable for weight-loss audience. | Pre-spike |
| v1 audience: weight-loss only | Cm-scale changes detectable with heuristic measurement. Gym-grade precision deferred to v2. | Pre-spike |
| Spike gates everything | Accuracy assumptions are unproven. Empirical data required before months of productization work. | Pre-spike |
| Two-shot capture (front + side) | Resolves depth ambiguity without 360° video UX complexity. Industry standard for accuracy/UX balance. | Pre-spike |
| Native-Swift-only pipeline | YUV format / bridge crash class of failures kills RN ML integrations. Only scalar measurements cross the bridge. | Pre-spike |
| On-device data only | Privacy-first; no cloud cost; matches pre-revenue stage. | Pre-spike |
| Apple IAP (no own-server billing) | Standard iOS path; matches on-device-only architecture. | Pre-spike |
| Reuse existing scan UI visuals | LiDAR animation, AR brackets, camera background are a real visual asset — keep as polish on top of real capture. | Pre-spike |
| Demo mode as hidden opt-in | Mock data must not fight real scans. Demo path is separate, not the default. | Pre-spike |

### Open Questions

| Question | Blocking? | Notes |
|----------|-----------|-------|
| Coach LLM choice: cloud (opt-in) vs. on-device | No — Phase 4 decision | Options: cloud LLM with user consent (COACH-03), on-device small model, or trend-text-only fallback |
| VisionCamera v4 vs. v5 compatibility with Expo SDK 54 / RN 0.81 | Yes — spike setup | Verify before spike harness is built |
| Free vs. Pro tier split specifics | No — Phase 4 decision | Price points and exact gating TBD |
| Demo mode trigger mechanism | No — Phase 4 decision | Hidden Settings toggle vs. build flag |

### Technical Risks (from research)

| Risk | Severity | Phase that mitigates |
|------|----------|---------------------|
| ±2cm reproducibility unachievable with heuristic-only | Critical | Phase 1 (spike gates this) |
| Demographic bias: pose models underperform on high-BMI bodies | High | Phase 1 (must include diverse BMI testers) |
| Capture protocol noise dominates model accuracy | High | Phase 1 (solo test condition) + Phase 3 (quality gates) |
| YUV format / bridge crash on iOS camera buffers | Medium | Phase 2 (native Swift pipeline) |
| Raw frames leaking into iCloud Backup via AsyncStorage | High | Phase 2 (ephemeral frame lifecycle before any TestFlight build) |
| AsyncStorage schema drift corrupts scan history | Medium | Phase 2 (schema versioning before first real scan) |
| CoreML latency regression across iOS versions | Medium | Phase 2 (benchmark on 3 device generations) |
| App Store rejection: body imagery age-rating / medical claims / IAP | Medium | Phase 4 (review checklist) |

### Todos

- [ ] Verify VisionCamera v4/v5 compatibility with Expo SDK 54 before spike
- [ ] Set up spike test harness: throwaway Xcode project, not the main sikai app
- [ ] Recruit ≥3 spike testers: one each from BMI <22, 22-27, >27 (ideally >32)
- [ ] Define spike measurement protocol: same anatomical landmarks as tape-measure ground truth
- [ ] Schema versioning for ScanRecord before first real scan is persisted (Concern #2 in CONCERNS.md)

### Blockers

None currently.

---

## Session Continuity

**To resume after a break:**

1. Read `.planning/STATE.md` (this file) — current position and open questions
2. Read `.planning/ROADMAP.md` — phase structure and success criteria
3. Check current phase's plan (if it exists): `.planning/phases/phase-N/PLAN.md`
4. Run `/gsd-plan-phase 1` to create the Phase 1 execution plan

**Key files:**

- `.planning/PROJECT.md` — scope, constraints, key decisions
- `.planning/REQUIREMENTS.md` — all 47 v1 requirements with phase mappings
- `.planning/research/SUMMARY.md` — research synthesis + recommended stack
- `.planning/research/PITFALLS.md` — critical risks per phase

---

*State initialized: 2026-04-30*

**Planned Phase:** 01 (feasibility-spike) — 7 plans — 2026-05-01T03:25:43.502Z
