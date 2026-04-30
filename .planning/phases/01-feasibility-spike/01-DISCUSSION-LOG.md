# Phase 1: Feasibility Spike - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `01-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-04-30
**Phase:** 01-feasibility-spike
**Mode:** discuss (interactive)
**Areas discussed:** Spike measurement scope, Fail-action gate
**Areas not discussed (Claude led):** Tester recruitment, Capture conditions priority, Time-box

---

## Gray Area Selection

User was offered 4 spike-design areas to discuss and selected:

| Area | Description | Selected |
|------|-------------|----------|
| Tester recruitment | Who gets scanned and how to find them | |
| Spike measurement scope | Just 3 vs. all 8 v1 measurements | ✓ |
| Capture conditions priority | Real-apartment-solo vs. controlled studio | |
| Time-box vs. data-driven stop | Hard 2-week cap vs. empirical | |

User also pre-committed on a separate fail-action question (presented in same turn).

---

## Fail-action gate

**Question:** If the spike fails the ±2cm gate, what's your default reaction?

| Option | Description | Selected |
|--------|-------------|----------|
| Hard re-plan, no fallback gate (Recommended) | Treat ±2cm as binding; missing it = stop and re-plan from scratch. | |
| Accept relaxed gate (~±3cm) and continue | Ship at ±3cm if that's what the data shows. | ✓ |
| Pivot to body-shape-model path (license work) | Treat failure as signal that heuristic-only insufficient; accept SMPL commercial-license work. | |
| Decide at the time, no default | Wait for data, decide then. | |

**User's choice:** Accept relaxed gate (~±3cm) and continue
**Recorded as:** Tiered gate. ≤±2cm = pass, ±2-3cm = soft pass with documented risk, >±3cm = hard re-plan. Captured as D-03 / D-04 in CONTEXT.md.
**Notes:** This relaxes SPIKE-04 from "hard ±2cm gate" to "tiered gate with ±3cm hard floor." The hard floor preserves the "trust the result" core value while preventing a marginal-miss kill of months of work.

---

## Spike measurement scope

**Question 1:** How wide does the spike's measurement coverage need to be before we declare go/no-go?

| Option | Description | Selected |
|--------|-------------|----------|
| Tier it: 3 first, then expand (Recommended) | Validate waist/hip/chest first (gate); if pass, extend harness to all 8 — extras don't block go/no-go. | ✓ |
| Just the 3 (waist/hip/chest) | Minimum scope. Fastest report. Risk: extras break in Phase 2. | |
| All 8 from day 1 | Full coverage. Highest confidence but slower; tuning small measurements before core 3 is wasted. | |

**User's choice:** Tier it: 3 first, then expand
**Recorded as:** D-01 in CONTEXT.md.

**Question 2:** Should the spike also attempt body-fat % and muscle-mass 'estimates'?

| Option | Description | Selected |
|--------|-------------|----------|
| No — punt to Phase 2 with 'estimate' label (Recommended) | Heuristic body-fat is genuinely a guess; v1 already labels as estimate (MEAS-03). | ✓ |
| Yes — surface a number with caveats | Generate estimate even if rough; useful for marketing. Cost: more code, doesn't affect gate. | |

**User's choice:** No — punt to Phase 2 with 'estimate' label
**Recorded as:** D-02 in CONTEXT.md.

---

## Claude's Discretion

The user did not select these for discussion; defaults below were chosen by Claude based on PROJECT.md constraints and PITFALLS.md research:

| Area | Default chosen | Rationale |
|------|---------------|-----------|
| Tester recruitment | 3 testers, one per BMI bracket (<22, 22-27, >27 ideally >32). Founder + close circle, supplement high-BMI via paid recruit if needed. ≥4 sessions/tester across ≥2 days. | Pitfall #3 (demographic bias) is the documented #1 failure mode for this stack. Solo founder data or all-lean testers makes the gate meaningless. |
| Capture conditions | ~50% controlled / ~50% solo-real-apartment. Both reported separately. | Pitfall #4 — capture protocol noise dominates model accuracy. Studio-only data hides the real-world failure mode. |
| Spike harness scope | Throwaway separate Xcode project, bare Swift + minimal SwiftUI; no Expo / RN bridge in the harness. | Bridge integration is itself a Phase 2 risk; including it conflates "model works" with "bridge works." Spike must isolate the measurement question. |
| Heuristic param tuning | LOCKED at start, not tuned during data collection. | Tuning during the spike is overfitting to N=3. If locked params produce poor results, that IS the answer. |
| Time-box | 2-week soft cap, 4-week hard cap. | Tiered scope (D-01) makes the soft cap realistic; high-BMI recruiting is the most likely bottleneck. |
| Pre-spike checklist | VisionCamera v4/v5 compatibility check, ground-truth protocol (ISO 8559 / partner-assisted tape, 3 takes averaged), recruit named candidates before harness code. | Each item is a known blocker if left to drift. |

## Deferred Ideas

- Body-fat % / muscle-mass spike validation (punted per D-02 to Phase 2)
- Cross-iPhone latency benchmarking (Pitfall #5) — deferred to Phase 2
- Bridge integration validation — deliberately excluded from spike, folded into Phase 2 risk
- SMPL/SMPL-X body-shape-model pivot — already v2 territory in PROJECT.md
