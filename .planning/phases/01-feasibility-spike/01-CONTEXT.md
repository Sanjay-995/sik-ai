# Phase 1: Feasibility Spike - Context

**Gathered:** 2026-04-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Empirically determine whether the locked v1 measurement stack — Apple Vision 3D body pose + ARKit world-tracking scale + cylindrical heuristics around 3D pose keypoints (no parametric body-shape model) — can deliver **±2cm test-retest reproducibility** on waist / hip / chest across diverse BMI categories on real bodies. Output is a throwaway harness app and a written go/no-go report that gates everything downstream.

This phase does NOT productize anything. It builds a one-off measurement rig, takes data, and decides whether Phase 2's productization work is worth doing.

</domain>

<decisions>
## Implementation Decisions

### Spike measurement scope
- **D-01:** Tiered scope. The harness validates **waist / hip / chest** first (the SPIKE-04 gate measurements). If those clear the gate, the same harness is extended in-place to derive **neck, shoulders, left/right upper arm, left/right thigh** and reports their reproducibility too — but the extras do NOT block the go/no-go. The gate is decided on the 3 core circumferences only.
- **D-02:** **Body-fat % and muscle-mass are NOT validated in the spike.** They're heuristic guesses regardless of pose stack and v1 already labels them as estimates (REQ MEAS-03). Adding them to the spike adds tuning surface without affecting the gate. Phase 2 surfaces them with the "estimate" badge.

### Go/no-go gate criteria
- **D-03:** **Tiered gate, not a hard binary.** Same-body inter-session test-retest standard deviation on waist/hip/chest, measured per BMI bracket:
  - **≤ ±2cm across all tested BMI brackets → PASS.** Proceed to Phase 2 as planned.
  - **±2cm to ±3cm on at least one measurement or bracket → SOFT PASS.** Document the specific weakness in the go/no-go report (which measurement, which BMI bracket, magnitude). Proceed to Phase 2 with that risk acknowledged in writing — Phase 3 capture-flow tightening (CAP-01..05) is the planned mitigation. *This relaxes SPIKE-04 from "hard gate at ±2cm" to "tiered gate with ±3cm hard floor."*
  - **\> ±3cm on any core measurement in any tested BMI bracket → HARD RE-PLAN.** Stop. Reconvene on stack and scope before any Phase 2 work begins.
- **D-04:** "Test-retest reproducibility" = same body, same scanner, **two scans across days** (inter-session), reported as standard deviation in cm per measurement, per BMI bracket. Same-session reproducibility (rapid 5-shot variance) is reported as a secondary metric only — inter-session is the primary.

### Tester recruitment & diversity (Claude's lead, see <code_context>)
- **D-05:** Minimum **3 testers, one per BMI bracket: <22 (lean), 22–27 (normal), >27 (overweight, ideally also >32 obese)**. Founder + close circle is the default source. If the high-BMI bracket can't be filled from close circle, supplement via paid recruit through limited-scope outreach (e.g. local subreddit/community channel) — NOT solo founder data, NOT all-lean testers (Pitfall #3 demographic bias is the documented #1 failure mode for this exact stack).
- **D-06:** Each tester completes **≥4 sessions across at least 2 different days** (target: morning vs. evening, controlled lighting vs. natural lighting). Per session: 2 paired scans (front+side ×2). This produces enough paired observations to compute a meaningful per-measurement SD per tester per bracket.

### Capture conditions tested in spike
- **D-07:** Mix of conditions, **not studio-only**. The spike must include at least one **unassisted solo capture condition** in a real-apartment environment per tester (Pitfall #4: capture protocol noise dominates model accuracy). Recommended split: ~50% controlled (researcher-assisted, decent lighting, plain wall) / ~50% solo-real-apartment. Both conditions reported separately in the go/no-go report.
- **D-08:** Pose: **A-pose** (arms ~45° from body), enforced by pose-confidence rejection from Apple Vision (Pitfall #8). Tight clothing or undergarments. Lighting check: no severe backlight; not pitch dark. Clothing fail / lighting fail conditions also included as documented failure-mode samples in the report — not excluded from the dataset.

### Spike harness scope (Claude's lead)
- **D-09:** **Throwaway harness, NOT in `artifacts/sikai`.** Separate Xcode project, bare Swift + minimal SwiftUI for UI, react-native-vision-camera + Apple Vision + ARKit invoked directly. No Expo, no React Native bridge in the spike. Rationale: bridge integration is itself a Phase 2 risk; including it in the spike conflates "does the model work" with "does the bridge work" — the spike must isolate the measurement question.
- **D-10:** **Heuristic parameters are LOCKED at spike start, not tuned during the spike.** Tuning during data collection is overfitting to N=3 testers and the resulting "pass" is meaningless. If the locked params produce poor results, that itself is the answer — re-plan, don't dial knobs. Param choices documented in spike harness README before first scan.

### Time-box & deliverable cadence (Claude's lead)
- **D-11:** **2-week soft cap, 4-week hard cap.** At week 2, if the 3 core measurements have produced enough paired data across all 3 BMI brackets to call the gate, ship the report. If high-BMI bracket recruiting is the bottleneck, extend up to 4 weeks but cap there — incomplete data + a dated report is a better artifact than open-ended drift.
- **D-12:** **Pre-spike checklist (gates harness build, not part of the 2 weeks):**
  1. Confirm `react-native-vision-camera` v4 vs. v5 compatibility against Expo SDK 54 / RN 0.81 — this isn't used in the spike harness itself but its compatibility gates Phase 2, and the answer should land before Phase 1 ends so Phase 2 plan isn't blocked.
  2. Tape-measure ground-truth protocol documented (anatomical landmarks: ISO 8559 / standard fitness landmarks, partner-assisted measurement preferred over self-measure, 3 takes per measurement averaged).
  3. Recruit the 3 testers (or have a recruitment plan with named candidates) before harness code begins.

### Claude's Discretion
- Specific Swift module structure of the harness, file layout, how the data table / CSV output is formatted.
- Exact ARKit calibration code path (ground-plane raycast at foot keypoints with user-height fallback, per research).
- Same-session 5-rapid-capture stability sub-test (Pitfall #6 segmentation flicker) — included as a secondary check unless it adds meaningful schedule risk.
- Whether to include a 2nd-iPhone / iPhone-generation comparison (Pitfall #5: CoreML regression). Default: no, single iPhone is enough to call the gate; cross-device benchmarking is Phase 2.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents (researcher, planner) MUST read these before planning Phase 1.**

### Phase scope & gate
- `.planning/PROJECT.md` — v1 scope, locked architecture decisions (no body-shape model, weight-loss audience, on-device only), constraints, key decisions table
- `.planning/REQUIREMENTS.md` §"Spike (Feasibility gate)" — SPIKE-01 through SPIKE-04 verbatim
- `.planning/ROADMAP.md` §"Phase 1: Feasibility Spike" — phase goal + 4 success criteria
- `.planning/STATE.md` §"Open Questions" / "Technical Risks" — project-wide context for the gate decision

### Research synthesis (informs spike protocol)
- `.planning/research/SUMMARY.md` — top-5 research takeaways, recommended v1 stack table, recommended phase structure, open questions for planning
- `.planning/research/PITFALLS.md` — 16 pitfalls. **Phase 1 must explicitly defend against:** Pitfall 1 (reproducibility ≠ absolute accuracy), Pitfall 3 (demographic bias on high-BMI bodies), Pitfall 4 (capture protocol failure modes), Pitfall 6 (segmentation flicker), Pitfall 7 (scale ambiguity), Pitfall 8 (mesh drift / pose sensitivity), Pitfall 11 (RN bridge / image format). See "Phase-Specific Warnings" table at the bottom of PITFALLS.md.
- `.planning/research/ARCHITECTURE.md` — 8-stage pipeline, with stages 5+6 collapsed into `CIRCUMFERENCE-EXTRACT` for v1 (no mesh slicing)
- `.planning/research/STACK.md` — full stack rationale (why Apple Vision over MediaPipe, why VisionCamera over expo-camera, why Expo Modules over hand-rolled bridges)
- `.planning/research/FEATURES.md` — competitor capture-protocol references (ZOZOFIT, 3DLOOK, Bodygee, Sizer)

### Existing codebase (informs Phase 2 transition planning, not Phase 1 harness)
- `.planning/codebase/STACK.md` — existing Expo SDK 54 / RN 0.81 / New Architecture / Reanimated 4 / React Compiler — these constrain Phase 2 native-module design but are NOT in the spike harness
- `.planning/codebase/ARCHITECTURE.md` — existing app structure
- `.planning/codebase/CONCERNS.md` §1–§3 — what's facade vs. real today (informs what the spike must replace, not what it must reuse)

### External (no project-local copy yet — researcher should fetch live)
- Apple Vision `VNHumanBodyPose3DObservation` documentation (iOS 17+) — the 19-joint metric output is the input to the cylindrical heuristic
- Apple ARKit world-tracking + ground-plane intersection — the scale calibration path
- `react-native-vision-camera` v4/v5 docs — needed for D-12 compatibility check
- ISO 8559-1 anatomical landmarks (or equivalent fitness-industry tape-measure standard) — ground-truth protocol

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
**None for Phase 1 itself.** The spike is a deliberately throwaway harness in a separate Xcode project (D-09). The existing `artifacts/sikai` codebase, scan UI visuals (`LiDARScanner.tsx`, `CameraBackground.tsx`, `ARScanAnimation.tsx`), and AppContext are NOT touched in this phase.

### Established Patterns That Constrain Phase 2 (not Phase 1)
- `artifacts/sikai/context/AppContext.tsx` — `ScanRecord` shape (11 numeric fields + weight + bmi + score + ISO date + notes; no `photoUri`). The spike output format should mirror this so Phase 2 has a clear handoff target.
- `generateMockData()` in `AppContext.tsx` — Phase 2 will remove this from the default first-launch path (REQ DATA-01). Spike doesn't touch it.
- New Architecture is enabled (`app.json` `newArchEnabled: true`), React Compiler is on, Reanimated 4 is in use — these are the targets for Phase 2 native module integration, not the spike.

### Integration Points (forward-looking, for Phase 2)
- The spike harness produces a small JSON output per scan: `{ measurements: { waist_cm, hip_cm, chest_cm, ... }, capture_conditions, tester_id, session_id, timestamp }`. Phase 2's native module is expected to produce a compatible shape that maps cleanly to `ScanRecord`.
- The native pipeline boundary is fixed by research: only scalar measurements cross the RN bridge in Phase 2. The spike, by being native-only, naturally validates the "native side does all heavy lifting" assumption (D-09).

### What the Spike Will Generate For Phase 2
- A locked set of cylindrical-heuristic parameters (per-measurement) that performed well on the test cohort.
- A characterization of failure modes (which BMI brackets, which capture conditions, which measurements have the highest variance).
- A documented capture protocol with empirical justification for each rule (clothing, distance, pose, lighting).

</code_context>

<specifics>
## Specific Ideas

- **Tier the gate, don't loosen the standard.** The spike still aims for ±2cm. The ±2-3cm soft-pass band exists so a marginal miss documented honestly doesn't kill the project; it does NOT mean we lower the marketing claim or relax Phase 3 capture-flow ambitions. The product-facing "trust the result" language must survive.
- **Reproducibility, not accuracy, is the outcome.** A scanner that consistently reads "waist = 84.2cm" is more valuable than one whose mean matches a tape measure but drifts ±3cm across days. Phase 1 report should LEAD with reproducibility numbers, accuracy second.
- **The high-BMI bracket is the make-or-break tester demographic.** Pitfall #3 documents that pose-based heuristic stacks underperform on bodies outside the lean-athletic training distribution — and this is exactly the v1 weight-loss audience. If the spike ships with only lean/normal testers, the gate is meaningless. This is the single hardest recruitment problem and it deserves more time than the engineering.

</specifics>

<deferred>
## Deferred Ideas

- **Body-fat % / muscle-mass spike validation** (D-02) — punted to Phase 2 with the existing "estimate" labeling pattern (MEAS-03). Revisit only if a customer-research signal demands it.
- **Cross-iPhone-generation latency benchmarking** (Pitfall #5) — deferred to Phase 2's native engine work. Single-device is sufficient for the gate.
- **Bridge-integration validation** — deliberately excluded from the spike (D-09) and folded into Phase 2 risk. The spike's "native-only" stance is a feature, not a bug.
- **SMPL/SMPL-X body-shape-model pivot path** — surfaced briefly when discussing the fail-action gate. Already locked as v2 territory in PROJECT.md and out of scope for any v1 phase. If the hard ±3cm floor breaks, re-plan happens at the milestone level, not inside Phase 1.

</deferred>

---

*Phase: 01-feasibility-spike*
*Context gathered: 2026-04-30*
