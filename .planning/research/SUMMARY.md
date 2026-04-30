# Research Summary

**Date:** 2026-04-30
**Sources:** `.planning/research/STACK.md`, `.planning/research/ARCHITECTURE.md`, `.planning/research/PITFALLS.md`, `.planning/research/FEATURES.md` (manual)
**Synthesizer:** main orchestrator (synthesizer agent unavailable; project-level synthesis written directly)

This document is a one-page synthesis of the four research dimensions, with the project-changing findings called out and the open questions surfaced for planning.

---

## Top 5 takeaways

1. **The SMPL/SMPL-X family of body-shape models — which would normally be the heart of any DIY body-measurement engine — all have non-commercial licenses.** Commercial use requires paid negotiation with MPI-IS, with unknown cost and weeks-long timelines. This was unanimously flagged as the single highest-risk pitfall by both the stack and pitfalls researchers (HIGH confidence). **Decision (locked in PROJECT.md):** v1 ships *without* a parametric body-shape model, sidestepping this risk entirely. The project pivots to weight-loss-only positioning where the lower accuracy ceiling is acceptable. Body-model integration becomes a v2 milestone.

2. **The right v1 measurement primitive is Apple's free 3D body-pose API** (`VNHumanBodyPose3DObservation`, iOS 17+) plus ARKit world tracking for scale calibration plus cylindrical heuristics around the 3D pose keypoints to estimate circumferences. This is the only commercially-clean stack that works on every iOS 17+ iPhone with no license risk. Achievable accuracy is `~±2cm` test-retest on waist / hip / chest with a tight capture protocol — sufficient for weight-loss-grade tracking, insufficient for gym-grade tracking.

3. **Two-shot capture (front + side photos) is the right protocol.** Single-shot has irresolvable depth ambiguity that caps accuracy at ±3-5cm; 360° video has painful UX. Two-shot is the published industry standard for the accuracy / UX balance.

4. **The pipeline must run entirely in native Swift** — image processing, pose estimation, and measurement extraction never cross the React Native bridge. Only the final scalar measurements (8-12 numbers) cross. This avoids the YUV format / bridge-crash class of failures that kill RN ML integrations. The bridge primitive is **Expo Modules API** (clean Swift↔TS bindings) on top of **Turbo Native Modules** (RN New Architecture, already enabled in this project).

5. **The spike must measure test-retest reproducibility, not just absolute accuracy.** A model that's ±1cm calibrated to a tape measure but ±3cm same-body-two-days is useless for tracking change. The whole product depends on reproducibility. The spike protocol must include: same body, same scanner, two scans per session, multiple sessions across days, **across diverse BMI categories** (the weight-loss audience is exactly where pose-based heuristics underperform).

---

## Recommended stack (v1)

| Layer | Choice | Why |
|-------|--------|-----|
| Camera library | `react-native-vision-camera` v4+ (MIT) | Only RN camera lib that exposes pixel-level frame buffers. `expo-camera` cannot do ML. Requires `expo prebuild` (bare workflow + EAS Build). |
| Native bridge | Expo Modules API + Turbo Native Module (Codegen / JSI) | Already on New Architecture. Type-safe Swift↔TS bindings. Standard 2026 path. |
| 3D body pose | Apple Vision: `VNHumanBodyPose3DObservation` (iOS 17+) | Free, on-device, 19 joints in metric camera space, height estimate included. |
| Scale / calibration | ARKit world tracking + ground-plane raycast; user-height fallback | Reliable px-per-cm without physical reference object. Height fallback for ARKit failures. |
| Body segmentation | `VNGeneratePersonSegmentationRequest` (Apple Vision) | For silhouette guidance + capture quality gates. |
| Body shape model | **None for v1** | Sidesteps SMPL license risk; deferred to v2. |
| Circumference extraction | Heuristic / cylindrical models around pose keypoints, parameterized by user height + BMI | Simpler than mesh slicing. Lower ceiling but commercially clean. |
| On-device storage | AsyncStorage (existing); raw frames discarded ephemerally | Body imagery never persisted. Only scalar measurements saved (and they DO get backed up to iCloud — that's fine; raw imagery doesn't). |
| Coach LLM | TBD (cloud LLM via API or on-device small model) | Decision deferred — privacy implications differ. |
| Paywall | Apple StoreKit 2 (or RevenueCat as a wrapper) | Standard iOS path; matches on-device-only architecture. |

---

## Pipeline (8 stages)

From the architecture research; these are the stage names that should appear in the roadmap:

1. **CAPTURE** — AVFoundation, two-shot front + side, capture quality gates
2. **FRAME-PREPROCESS** — YUV→RGB, normalization, person segmentation crop
3. **POSE-ESTIMATE** — Apple Vision 3D body pose, 19 keypoints in metric space
4. **SCALE-ESTIMATE** — ARKit world tracking + ground-plane intersect at foot keypoints; user-height fallback
5. **CIRCUMFERENCE-EXTRACT** *(was BODY-MODEL-FIT in original architecture; reframed for v1)* — heuristic cylinders/ellipses around 3D pose keypoints, parameterized by height + bone lengths
6. **MEASUREMENT-EXTRACT** *(folded into above for v1; will separate again in v2 with body model)*
7. **SMOOTH-AGGREGATE** — combine front + side measurements, reject outliers
8. **SCAN-RECORD-PERSIST** — pass final scalar values across the bridge to `AppContext.addScan()`; raw frames discarded

For v1 stages 5+6 collapse into one (`CIRCUMFERENCE-EXTRACT`) because we're not fitting a mesh.

---

## Phase structure (suggested for the roadmap)

| Phase | Goal | Output |
|-------|------|--------|
| **1. Feasibility spike** | Validate that Apple Vision + ARKit + cylindrical heuristics can deliver ±2cm test-retest reproducibility on waist/hip/chest across diverse BMI categories. | A throwaway harness app + a written go/no-go report. The decision: build the real product, OR pivot strategy. |
| **2. Native measurement engine** | Productize the spike learnings into a Swift Expo Module that the existing `artifacts/sikai` app can call. Produces real `ScanRecord` values. Replace mock data. | `artifacts/sikai` produces real measurements end-to-end on a TestFlight build. Empty-state on first launch. |
| **3. Capture-flow UX** | Two-shot capture flow with live pose / framing / lighting / distance / clothing guidance and quality gates. Reuse existing LiDAR / AR visual polish. | A capture flow that real users complete in under 2 minutes and produces consistent measurements. |
| **4. Coach commentary + paywall + ship** | Real AI-generated coach commentary on user trend data; real Apple IAP paywall; App Store submission. | Sik AI v1 in the App Store. |

Phases 2 and 3 may merge under "coarse" granularity; that decision is for the roadmapper.

---

## Critical risks (and where each phase addresses them)

| Risk | Severity | Phase that addresses |
|------|----------|---------------------|
| ±2cm reproducibility unachievable with heuristic-only approach | High | Phase 1 (spike) — go/no-go gate |
| Demographic bias of pose models on high-BMI bodies | High | Phase 1 (spike must include diverse testers) |
| Capture protocol noise dominates model accuracy | High | Phase 3 (capture-flow UX); also tested in Phase 1 |
| YUV format / bridge crashes on iOS camera buffers | Medium | Phase 2 (native engine integration) |
| Privacy: raw frames leaking into iCloud Backup via AsyncStorage | High | Phase 2 — explicit ephemeral-frame policy |
| App Store rejection (camera privacy / medical claims / IAP) | Medium | Phase 4 (review-readiness checklist) |
| Coach LLM cost / latency / privacy posture | Low for v1 | Phase 4 — decision can be deferred |

---

## Open questions for planning

These are unresolved at research-time and will be revisited during phase planning:

- **Coach LLM choice**: cloud (Claude / GPT, low complexity, privacy tradeoff) vs. on-device (smaller model, harder, fully private). The on-device-only stance makes cloud LLM tension; one option is "user can opt in to cloud-based coach commentary; on-device default is just trend lines."
- **VisionCamera v4 vs. v5**: verify current latest version + Expo SDK 54 / RN 0.81 compatibility before committing.
- **Test-retest target ±2cm**: is this empirically achievable with cylinders alone? Spike answers this.
- **Free vs. Pro tier split**: business-model question, not a research question. Park for Phase 4.
- **Demo mode mechanism**: how does the user trigger it (hidden settings toggle? testflight-only flag?). UX question for Phase 2 or 4.

---

## What was NOT covered (limitations)

- **No live competitor verification.** Web research tools were restricted; competitor claims in `FEATURES.md` are from training data and labeled `[unverified]`. The user / team should spot-check pricing, capture protocols, and current accuracy claims before any go-to-market work.
- **No license-cost data from MPI-IS.** Since v1 sidesteps the body model, this is not blocking. When v2 planning starts, MPI outreach should kick off in parallel.
- **No empirical accuracy data.** The numbers in this document (±2cm, ±0.5cm, etc.) are domain-typical estimates. The spike phase generates the real numbers.
