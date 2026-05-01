# react-native-vision-camera — Phase 2 Compatibility Note (D-12.1)

> **Summary.** `react-native-vision-camera` is **NOT** used in the Phase 1 spike harness. Per D-09, the harness is a throwaway native Swift Xcode project that uses **AVFoundation directly** for camera capture. This note exists to (a) record the v4/v5 status so Phase 2 planning isn't blocked, and (b) resolve the textual contradiction between ROADMAP Phase 1 SC#1 and D-09.
>
> **Phase 2 must target `react-native-vision-camera` v5.** v4 is archived and unmaintained.

---

## ROADMAP SC#1 contradiction — resolution

ROADMAP `Phase 1 Success Criterion #1` originally read:

> "A throwaway harness app on a real iPhone (iOS 17+) captures front + side photos using **react-native-vision-camera** and successfully runs Apple Vision 3D body pose extraction."

That wording is a **documentation carryover** from when the spike was scoped inside `artifacts/sikai`. Decision **D-09** (locked in `01-CONTEXT.md`) explicitly removes the React Native bridge from the spike — the harness is a separate Swift Xcode project that calls `AVFoundation` + `Vision` + `ARKit` directly. Including the bridge in the spike would conflate two questions ("does the measurement work" vs. "does the bridge work"), which is exactly what D-09 forbids.

**Resolution:** ROADMAP SC#1 has been amended to read:

> "captures front + side photos using **AVFoundation** and successfully runs Apple Vision 3D body pose extraction."

The amended SC#1 in `.planning/ROADMAP.md` now references this note. Future Phase 2 plans may legitimately reintroduce VisionCamera; that is **not** a contradiction with SC#1 — it is the next step.

---

## Version status (verified 2026-04-30 via npmjs.com and react-native-vision-camera.com)

| Version | Status | Notes |
|---------|--------|-------|
| **v5** | GA, current maintained | Built on Nitro Modules (JSI direct, no codegen bridge). Target Phase 2 against this. |
| **v4** | **Archived — no longer maintained.** | Per the official VisionCamera site. Any plan referencing "v4.x" is stale and must be updated. |
| v3 | Legacy architecture | Not applicable to a New-Architecture project. |

**Phase 2 must target v5.** Plans, READMEs, or notes elsewhere in the repo that say "v4" should be considered out of date and corrected when they are touched.

---

## Expo SDK 54 / RN 0.81 compatibility

The `artifacts/sikai` app runs Expo SDK 54 + React Native 0.81 with the New Architecture enabled (`app.json: newArchEnabled: true`). v5 of `react-native-vision-camera` is compatible with the New Architecture; v4 needed a compatibility shim that has since been removed.

Practical caveats for Phase 2 integration:

- **v5 uses Nitro Modules (JSI-based).** It is not an Expo-managed module — installation requires the bare workflow. `npx expo prebuild` must be run before installing the package.
- **EAS Build path.** Expo SDK 54 supports the bare workflow with EAS Build. Phase 2 plan should include an `npx expo prebuild && eas build --platform ios --profile development` validation step **early** in the phase, before any frame-processor wiring.
- **Frame format.** v5 emits `YCbCr` (YUV) frames; the Swift frame processor receives a `CMSampleBuffer`. Confirm `VNImageRequestHandler(cmSampleBuffer:options:)` accepts v5 output **before** wiring it to the Vision 3D pipeline. This is one of the cheaper Phase 2 risks to retire early.
- **Unverified-in-this-project risk.** v5 + Expo SDK 54 + the New Architecture has not yet been built and run against a real device in this codebase. Expect a non-zero amount of native build pain on the first prebuild.

---

## Phase 2 action items

When Phase 2 planning starts, these are the v5-specific gates that should appear in the plan:

1. **Use `react-native-vision-camera` v5** (not v4 — v4 is archived).
2. **Run `npx expo prebuild`** before installing VisionCamera. The bare workflow is non-optional for Nitro Modules.
3. **Verify the frame-format handshake.** Confirm v5's `CMSampleBuffer` output works with `VNImageRequestHandler(cmSampleBuffer:options:)` in a minimal frame processor before wiring to the Vision 3D body-pose pipeline.
4. **Re-use the spike's measurement code as the source of truth.** The spike harness (Phase 1) validates the Vision 3D + ARKit + cylindrical-heuristic pipeline in pure native Swift. Phase 2 wraps that exact code in a VisionCamera frame processor. The two-step isolation (spike → product) is the entire point of D-09.
5. **Re-verify v4/v5 status before locking the Phase 2 plan.** This note was verified on 2026-04-30; npm package state can change. If a v6 ships before Phase 2 starts, this note should be re-issued.

---

## Anchors

- **D-09** (`01-CONTEXT.md`) — Throwaway harness, not in `artifacts/sikai`. Native-only.
- **ROADMAP SC#1** (`.planning/ROADMAP.md`, Phase 1) — Now references this note.
- **`01-RESEARCH.md`** — Standard Stack section; State of the Art section; Open Questions #1 and #10; Assumptions A9 and A10.
