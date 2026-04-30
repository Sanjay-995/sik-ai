# Phase 1: Feasibility Spike - Research

**Researched:** 2026-04-30
**Domain:** On-device monocular body measurement (Apple Vision 3D body pose + ARKit + cylindrical heuristics, no parametric body model)
**Confidence:** HIGH on the locked stack APIs and on the spike protocol design; MEDIUM on heuristic-formula prior art (cylindrical-from-pose alone, no SMPL, is a thinly published path); MEDIUM on react-native-vision-camera v5 New-Arch fitness for Phase 2 (verified released, exact stability profile must be observed in practice).

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Spike measurement scope**
- **D-01:** Tiered scope. The harness validates **waist / hip / chest** first (the SPIKE-04 gate measurements). If those clear the gate, the same harness is extended in-place to derive **neck, shoulders, left/right upper arm, left/right thigh** and reports their reproducibility too — but the extras do NOT block the go/no-go. The gate is decided on the 3 core circumferences only.
- **D-02:** **Body-fat % and muscle-mass are NOT validated in the spike.** They're heuristic guesses regardless of pose stack and v1 already labels them as estimates (REQ MEAS-03). Adding them to the spike adds tuning surface without affecting the gate. Phase 2 surfaces them with the "estimate" badge.

**Go/no-go gate criteria**
- **D-03:** **Tiered gate, not a hard binary.** Same-body inter-session test-retest standard deviation on waist/hip/chest, measured per BMI bracket:
  - **≤ ±2cm across all tested BMI brackets → PASS.** Proceed to Phase 2 as planned.
  - **±2cm to ±3cm on at least one measurement or bracket → SOFT PASS.** Document the specific weakness in the go/no-go report (which measurement, which BMI bracket, magnitude). Proceed to Phase 2 with that risk acknowledged in writing — Phase 3 capture-flow tightening (CAP-01..05) is the planned mitigation. *This relaxes SPIKE-04 from "hard gate at ±2cm" to "tiered gate with ±3cm hard floor."*
  - **\> ±3cm on any core measurement in any tested BMI bracket → HARD RE-PLAN.** Stop. Reconvene on stack and scope before any Phase 2 work begins.
- **D-04:** "Test-retest reproducibility" = same body, same scanner, **two scans across days** (inter-session), reported as standard deviation in cm per measurement, per BMI bracket. Same-session reproducibility (rapid 5-shot variance) is reported as a secondary metric only — inter-session is the primary.

**Tester recruitment & diversity**
- **D-05:** Minimum **3 testers, one per BMI bracket: <22 (lean), 22–27 (normal), >27 (overweight, ideally also >32 obese)**. Founder + close circle is the default source. If the high-BMI bracket can't be filled from close circle, supplement via paid recruit through limited-scope outreach (e.g. local subreddit/community channel) — NOT solo founder data, NOT all-lean testers.
- **D-06:** Each tester completes **≥4 sessions across at least 2 different days** (target: morning vs. evening, controlled lighting vs. natural lighting). Per session: 2 paired scans (front+side ×2). This produces enough paired observations to compute a meaningful per-measurement SD per tester per bracket.

**Capture conditions tested in spike**
- **D-07:** Mix of conditions, **not studio-only**. The spike must include at least one **unassisted solo capture condition** in a real-apartment environment per tester. Recommended split: ~50% controlled (researcher-assisted, decent lighting, plain wall) / ~50% solo-real-apartment. Both conditions reported separately in the go/no-go report.
- **D-08:** Pose: **A-pose** (arms ~45° from body), enforced by pose-confidence rejection from Apple Vision. Tight clothing or undergarments. Lighting check: no severe backlight; not pitch dark. Clothing fail / lighting fail conditions also included as documented failure-mode samples in the report — not excluded from the dataset.

**Spike harness scope**
- **D-09:** **Throwaway harness, NOT in `artifacts/sikai`.** Separate Xcode project, bare Swift + minimal SwiftUI for UI, Apple Vision + ARKit invoked directly via native AVFoundation (NOT react-native-vision-camera, NOT Expo, NOT React Native bridge in the spike). Rationale: bridge integration is itself a Phase 2 risk; including it in the spike conflates "does the model work" with "does the bridge work" — the spike must isolate the measurement question.
- **D-10:** **Heuristic parameters are LOCKED at spike start, not tuned during the spike.** Tuning during data collection is overfitting to N=3 testers and the resulting "pass" is meaningless. If the locked params produce poor results, that itself is the answer — re-plan, don't dial knobs. Param choices documented in spike harness README before first scan.

**Time-box & deliverable cadence**
- **D-11:** **2-week soft cap, 4-week hard cap.** At week 2, if the 3 core measurements have produced enough paired data across all 3 BMI brackets to call the gate, ship the report. If high-BMI bracket recruiting is the bottleneck, extend up to 4 weeks but cap there.
- **D-12:** **Pre-spike checklist (gates harness build, not part of the 2 weeks):**
  1. Confirm `react-native-vision-camera` v4 vs. v5 compatibility against Expo SDK 54 / RN 0.81 — this isn't used in the spike harness itself but its compatibility gates Phase 2.
  2. Tape-measure ground-truth protocol documented (anatomical landmarks: ISO 8559 / standard fitness landmarks, partner-assisted measurement preferred over self-measure, 3 takes per measurement averaged).
  3. Recruit the 3 testers (or have a recruitment plan with named candidates) before harness code begins.

### Claude's Discretion
- Specific Swift module structure of the harness, file layout, how the data table / CSV output is formatted.
- Exact ARKit calibration code path (ground-plane raycast at foot keypoints with user-height fallback, per research).
- Same-session 5-rapid-capture stability sub-test (Pitfall #6 segmentation flicker) — included as a secondary check unless it adds meaningful schedule risk.
- Whether to include a 2nd-iPhone / iPhone-generation comparison (Pitfall #5: CoreML regression). Default: no, single iPhone is enough to call the gate; cross-device benchmarking is Phase 2.

### Deferred Ideas (OUT OF SCOPE for this phase)
- **Body-fat % / muscle-mass spike validation** (D-02) — punted to Phase 2 with the existing "estimate" labeling pattern (MEAS-03).
- **Cross-iPhone-generation latency benchmarking** (Pitfall #5) — deferred to Phase 2's native engine work.
- **Bridge-integration validation** — deliberately excluded from the spike (D-09) and folded into Phase 2 risk.
- **SMPL/SMPL-X body-shape-model pivot path** — already locked as v2 territory in PROJECT.md.
- **artifacts/sikai integration of any kind** — the spike does not touch the existing app.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SPIKE-01 | A throwaway harness app can take front + side photos of a real body using Apple Vision 3D body pose, on a real iPhone (iOS 17+). | Section 4 (Harness Architecture). Resolves the SC#1 vs D-09 contradiction in favor of D-09 (native AVFoundation, no react-native-vision-camera). `VNDetectHumanBodyPose3DRequest` confirmed available on all iOS 17+ iPhones (no LiDAR required for the pose; LiDAR only affects metric height calibration). |
| SPIKE-02 | The harness extracts circumferences (waist, hip, chest) from 3D pose keypoints + ARKit scale + cylindrical heuristics, no parametric body-shape model. | Section 1 (Vision 3D pose: 17 joints in metric meters). Section 2 (ARKit ground-plane scale calibration). Section 3 (cylindrical/elliptical heuristic formula, locked params per D-10). |
| SPIKE-03 | The harness produces a written go/no-go report containing: same-body test-retest SD per measurement across ≥3 testers spanning low/normal/high BMI, absolute accuracy vs. tape measure, capture-protocol violations encountered, and a recommendation. | Section 5 (Reproducibility analysis methodology). Section 6 (Pre-spike checklist incl. ISO-8559 tape protocol). Section 9 (Report format). |
| SPIKE-04 | The accuracy gate is met when test-retest reproducibility on waist/hip/chest is **±2cm or better across all tested BMI categories**. Failing this gate triggers a re-plan, not a silent continuation. | Tiered per D-03: ≤±2cm PASS / ±2-3cm SOFT PASS with documented weakness / >±3cm HARD RE-PLAN. Inter-session SD is the primary metric (D-04). |
</phase_requirements>

---

## Summary

This is a measurement-feasibility spike, not a productization phase. Its purpose is to put a Swift+SwiftUI throwaway harness on a real iPhone, capture front+side stills of real human bodies, run `VNDetectHumanBodyPose3DRequest` to get 17 body joints in metric world coordinates, calibrate scale with ARKit ground-plane raycasting, and apply locked-parameter cylindrical/elliptical circumference heuristics — then measure how well the result reproduces across same-body different-day captures across three BMI brackets.

The gate is tiered (D-03). The primary metric is inter-session test-retest standard deviation per measurement per BMI bracket (D-04). Heuristic parameters are locked at spike start (D-10) — the spike measures the locked-parameter outcome and deliberately does NOT auto-tune.

**The most important contradiction resolved here:** the ROADMAP success criterion #1 mentions `react-native-vision-camera`, but **D-09 explicitly overrides this** in favor of native AVFoundation in a separate Xcode project. The spike must NOT use react-native-vision-camera or any RN bridge — that's a Phase 2 integration concern. SC#1 should be read as describing the productization intent, not the spike implementation. (See Section 4 for full reasoning.) The pre-spike checklist (D-12.1) separately requires verifying `react-native-vision-camera` v4 vs v5 compatibility against Expo SDK 54 / RN 0.81 — that note informs Phase 2 planning, not Phase 1 code. **Verified during research:** v5 is GA, v4 is no longer maintained — Phase 2 should plan for v5.

**The most important hardware caveat surfaced here:** Apple's `VNHumanBodyPose3DObservation.bodyHeight` returns `.measured` only when LiDAR depth metadata is fed to the request; on non-LiDAR iPhones (the majority of the iOS 17+ install base), it falls back to a `.reference` height of 1.8m. **This means we cannot rely on Vision's own height estimate as our scale calibration.** ARKit ground-plane raycast (the primary scale path) and user-input height (fallback) are both LiDAR-independent and are the right scale sources. The spike test device should **not** be a Pro iPhone (LiDAR), or at minimum the harness should run with `.reference` mode forced so we measure the no-LiDAR experience that v1 will actually ship to.

**Primary recommendation:** Build a single-screen SwiftUI harness, target iOS 17+, that combines `ARKit ARSession` (worldTracking + plane detection) with a `VNDetectHumanBodyPose3DRequest` run on still snapshots. Output one JSON file per scan with full keypoint dump + computed circumferences + capture metadata. Aggregate per-tester results into a CSV for the report. Use partner-assisted ISO-8559-style tape ground truth, three takes averaged. Lock all heuristic constants in a `HeuristicParams.swift` file before the first real scan, commit it, and never edit it during the data-collection window.

---

## Architectural Responsibility Map

The spike is a single-process, single-tier native iOS app. There is only one tier in the spike harness. The "tiers" below are conceptual stages of the data flow, mapped to where in the harness they live. (For Phase 2 the responsibility map will look very different — see ARCHITECTURE.md for the production multi-tier breakdown.)

| Capability | Primary Stage | Secondary Stage | Rationale |
|------------|---------------|-----------------|-----------|
| Camera capture (front + side stills) | Native iOS / AVFoundation (`AVCaptureSession` + `AVCapturePhotoOutput`) | — | D-09 mandates native, no RN bridge. AVFoundation is the canonical Swift path. |
| Live pose preview / framing aid | Native iOS / Vision 2D pose (`VNDetectHumanBodyPoseRequest`) | — | Optional during capture; cheap and runs at video rate; helps tester self-frame. |
| 3D pose extraction | Native iOS / Vision 3D (`VNDetectHumanBodyPose3DRequest`) | — | The locked stack primitive. Operates on still images. |
| World-scale calibration | Native iOS / ARKit (`ARSession` worldTracking + `ARRaycastQuery`) | Manual user-height input | ARKit ground-plane is the primary scale path; user-height is the documented fallback when ARKit confidence is low. |
| Person segmentation (optional silhouette) | Native iOS / Vision (`VNGeneratePersonSegmentationRequest`) | — | Useful for front-vs-side width measurement; not strictly required for keypoint-only heuristic. |
| Circumference computation | Native Swift (pure CPU, no GPU/CoreML) | — | Closed-form geometric formula; no model inference. |
| Data persistence (per scan) | Native iOS / FileManager → app sandbox (JSON + photo) | — | Throwaway harness — local files only, no AsyncStorage, no cloud, no AppContext. |
| Aggregation / reproducibility analysis | Off-device, in a Python notebook or spreadsheet | — | Easier to audit. Spike harness exports CSV; analysis runs separately. |
| Go/no-go report authoring | Markdown document, manual | — | Final deliverable is human-written. |

**Boundary the spike must NOT cross:** the spike does not write to `artifacts/sikai`, does not touch `AppContext.tsx`, does not touch `AsyncStorage`, does not run `npx expo prebuild`, does not depend on Expo SDK 54 / RN 0.81 / Reanimated / React Compiler in any way.

---

## Standard Stack

### Core (Spike Harness — Native Only)

| Library / API | Version | Purpose | Why Standard |
|---------------|---------|---------|--------------|
| Xcode | 15.4+ (16.x preferred) | Build the standalone harness | Required for iOS 17+ SDK and the Vision 3D body pose API. `[CITED: developer.apple.com/xcode]` |
| Swift | 5.9+ | Harness implementation language | Native, no bridge, no transpilation. |
| SwiftUI | iOS 17+ baseline | Minimal UI for harness (camera view + capture buttons + scan log) | Apple-native, zero deps, fastest path to a one-screen tool. |
| AVFoundation | iOS system | Camera capture (`AVCaptureSession`, `AVCapturePhotoOutput`) | Apple-canonical photo capture. `[CITED: developer.apple.com/documentation/avfoundation]` |
| Vision (`VNDetectHumanBodyPose3DRequest`) | iOS 17.0+ | 3D body pose: 17 joints in metric meters (root at hip center) | The locked v1 measurement primitive. `[CITED: developer.apple.com/documentation/vision/vndetecthumanbodypose3drequest]` `[VERIFIED: WWDC23 session 111241]` |
| Vision (`VNDetectHumanBodyPoseRequest`) | iOS 14+ | 2D body pose for live preview / framing feedback (lower latency than 3D for video frames) | Free, fast, well-supported. |
| Vision (`VNGeneratePersonSegmentationRequest`) | iOS 15+ | Person silhouette mask (optional, for body-width estimation orthogonal to keypoints) | Useful for waist/hip width-from-silhouette as a cross-check; `.accurate` quality recommended. `[CITED: developer.apple.com/documentation/vision/vngeneratepersonsegmentationrequest]` |
| ARKit (`ARSession` + `ARWorldTrackingConfiguration`) | iOS 13+ (recommend iOS 17+ here) | World tracking, ground-plane detection for scale calibration | Provides metric world coordinates without LiDAR. `[CITED: developer.apple.com/documentation/arkit]` |
| simd (Apple) | iOS system | `simd_float4x4` matrix math for joint positions, camera origin, raycast hits | Vision 3D returns positions as `simd_float4x4`; ARKit uses the same type — no conversion needed. |

### Supporting

| Library | Purpose | When to Use |
|---------|---------|-------------|
| Python 3.11+ with `pandas`, `numpy`, `scipy.stats` | Off-device reproducibility analysis (per-measurement SD, ICC, repeatability coefficient) | After data collection ends, run analysis on exported CSV. |
| A standard tape measure (fitness / tailor grade, cm-marked, ≤1cm increments) | Ground-truth circumference measurement | Per ISO-8559-1 anatomical landmarks. Three takes per measurement, averaged. |
| Tripod or counter prop (~chest-to-shoulder height for adult subject) | Stable phone positioning during solo capture (D-07) | Required to test the unassisted-solo condition honestly. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native Swift / SwiftUI harness | Expo + react-native-vision-camera | **Rejected per D-09.** Conflates "does the model work" with "does the bridge work." Adds Phase 2 risk into Phase 1. |
| `VNDetectHumanBodyPose3DRequest` | `ARBodyTrackingConfiguration` | ARKit body tracking is live-only (requires ongoing ARSession with the body in frame); Vision 3D works on still images. Vision 3D is the simpler match for two-shot still capture. ARKit body tracking would also pin us to A12+ and would not give us materially better data for this use case. `[CITED: STACK.md §1.2]` |
| ARKit ground plane | Reference object in frame (credit card, ruler) | Adds UX friction — tester must hold/place an object. ARKit is friction-free on flat textured floors. |
| Apple Vision body pose | MediaPipe Pose / OpenPose | Apple Vision is system-supplied, free, MIT-equivalent platform license, optimized for the device. MediaPipe would add a CoreML conversion step and lose the metric-meters output. |
| Cylindrical heuristic | SMPL/SMPL-X mesh fitting | **Out of scope per PROJECT.md.** Sidesteps MPI commercial-license risk. Body-shape model deferred to v2. |

**Installation (spike harness has no package manager — pure Apple frameworks):**

```bash
# No npm/pip/CocoaPods/SPM dependencies needed for the harness itself.
# Vision, ARKit, AVFoundation, SwiftUI are built into iOS 17+.
#
# Off-device analysis only:
python3 -m venv .venv && source .venv/bin/activate
pip install pandas numpy scipy
```

**Version verification:**
- `VNDetectHumanBodyPose3DRequest` introduced iOS 17.0 (WWDC 2023). Confirmed in Apple docs and WWDC23 session 111241. `[VERIFIED: developer.apple.com via WebSearch 2026-04-30]`
- `react-native-vision-camera` latest (Phase 2 concern only, not used in spike): **v5.x is GA as of 2026; v4 is no longer maintained.** `[VERIFIED: npmjs.com via WebSearch 2026-04-30]` Phase 2 should plan for v5 specifically; the existing STACK.md notes mentioning "v4.x" are stale and should be updated when Phase 2 planning starts.

---

## Architecture Patterns

### System Architecture Diagram

```
                         ┌──────────────────────────────────┐
                         │  Tester (real human body, A-pose)│
                         └──────────────┬───────────────────┘
                                        │ stands ~2-3m from phone
                                        ▼
        ┌────────────────────────────────────────────────────────┐
        │  iPhone running spike harness (separate Xcode project) │
        │                                                        │
        │  ┌──────────────────────────────────────────────────┐  │
        │  │ SwiftUI HarnessApp (single screen)               │  │
        │  │  - Tester ID / Session ID / Condition selector   │  │
        │  │  - Live preview + 2D pose overlay (framing aid)  │  │
        │  │  - Front-shot button   ──┐                       │  │
        │  │  - Side-shot button    ──┤                       │  │
        │  │  - View results / export CSV                     │  │
        │  └──────────────────────────────────────────────────┘  │
        │                              │                         │
        │                              ▼                         │
        │  ┌──────────────────────────────────────────────────┐  │
        │  │ CaptureService (AVFoundation)                    │  │
        │  │  AVCaptureSession + AVCapturePhotoOutput         │  │
        │  │  - .photo preset, isHighResolutionCaptureEnabled │  │
        │  │  - HEIF or JPEG output, full sensor resolution   │  │
        │  └──────────────────────┬───────────────────────────┘  │
        │                         │ CGImage / CVPixelBuffer       │
        │                         ▼                                │
        │  ┌──────────────────────────────────────────────────┐  │
        │  │ PoseService (Vision)                             │  │
        │  │  VNDetectHumanBodyPose3DRequest                  │  │
        │  │  → VNHumanBodyPose3DObservation                  │  │
        │  │     - 17 joints (simd_float4x4, meters)          │  │
        │  │     - bodyHeight + heightEstimation              │  │
        │  │     - cameraOriginMatrix                         │  │
        │  │  Reject if joint count < 15 or any joint missing │  │
        │  └──────────────────────┬───────────────────────────┘  │
        │                         │                                │
        │  ┌──────────────────────┴───────────────────────────┐  │
        │  │ ScaleService (ARKit, runs in parallel)           │  │
        │  │  ARSession.worldTracking with horizontal planes  │  │
        │  │  ARRaycastQuery from camera through foot pixel   │  │
        │  │    target: .estimatedPlane (allows non-anchored) │  │
        │  │  → distance camera→foot in metric meters          │  │
        │  │  Fallback: scale = userHeightCm /                │  │
        │  │            (head_y - ankle_y in pixels)          │  │
        │  └──────────────────────┬───────────────────────────┘  │
        │                         │                                │
        │                         ▼                                │
        │  ┌──────────────────────────────────────────────────┐  │
        │  │ SegmentService (Vision, optional)                │  │
        │  │  VNGeneratePersonSegmentationRequest .accurate   │  │
        │  │  → silhouette mask CVPixelBuffer                  │  │
        │  │  Used to compute body-width-at-anatomical-y      │  │
        │  └──────────────────────┬───────────────────────────┘  │
        │                         │                                │
        │                         ▼                                │
        │  ┌──────────────────────────────────────────────────┐  │
        │  │ HeuristicService (pure Swift, locked params)     │  │
        │  │  Inputs: front shot {keypoints, scale, mask}     │  │
        │  │          side shot  {keypoints, scale, mask}     │  │
        │  │  Per measurement (waist, hip, chest):            │  │
        │  │   1. Pick anatomical y from keypoints            │  │
        │  │   2. Read width_front from mask at that y        │  │
        │  │   3. Read width_side  from mask at same y on side│  │
        │  │   4. C = π · √( (a²+b²)/2 ),  a = w_f/2, b=w_s/2 │  │
        │  │      (Ramanujan ellipse perimeter approximation) │  │
        │  │  All constants from HeuristicParams.swift        │  │
        │  └──────────────────────┬───────────────────────────┘  │
        │                         │                                │
        │                         ▼                                │
        │  ┌──────────────────────────────────────────────────┐  │
        │  │ ScanLogger                                       │  │
        │  │  Appends one JSON row per scan to                │  │
        │  │   FileManager .documentDirectory/scans.jsonl     │  │
        │  │  Schema: tester_id, session_id, scan_id,         │  │
        │  │    timestamp, condition_label, height_input_cm,  │  │
        │  │    pose_confidence_min, scale_source,            │  │
        │  │    raw_keypoints, computed_circumferences,       │  │
        │  │    tape_measurements (entered post-scan)         │  │
        │  └──────────────────────┬───────────────────────────┘  │
        │                         │                                │
        │                         ▼                                │
        │           Export → AirDrop / Files / iCloud Drive       │
        └──────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                  ┌─────────────────────────────────────────┐
                  │  Off-device analysis (laptop, Python)   │
                  │  - Per-tester per-measurement SD        │
                  │    across paired sessions (D-04)        │
                  │  - Per-BMI-bracket aggregation          │
                  │  - Bias vs. tape-measure ground truth   │
                  │  - Same-session 5-shot variance check   │
                  │  - Capture-condition split (D-07)       │
                  │  - Output: 01-GO-NO-GO-REPORT.md        │
                  └─────────────────────────────────────────┘
```

### Recommended Project Structure

```
~/sikai-spike-harness/                    # NOT in artifacts/sikai (D-09)
└── SikAISpike.xcodeproj/
    └── SikAISpike/
        ├── SikAISpikeApp.swift           # @main + SwiftUI App
        ├── ContentView.swift             # single-screen harness UI
        ├── Capture/
        │   ├── CaptureService.swift      # AVCaptureSession wrapper
        │   └── CameraView.swift          # SwiftUI bridge to AVPreviewLayer
        ├── Measurement/
        │   ├── PoseService.swift         # Vision 3D body pose
        │   ├── ScaleService.swift        # ARKit ground-plane raycast
        │   ├── SegmentService.swift      # person segmentation (optional)
        │   ├── HeuristicService.swift    # circumference formulas
        │   └── HeuristicParams.swift     # ⚠ LOCKED at spike start (D-10)
        ├── Logging/
        │   ├── ScanLogger.swift          # JSONL persistence
        │   └── ScanRecord.swift          # codable schema
        ├── Models/
        │   └── Tester.swift              # tester id + bmi bracket + height
        └── Resources/
            └── README.md                 # spike protocol + locked params
```

### Pattern 1: Two-Shot Still Capture, Native AVFoundation

**What:** Each scan is two stills (front + side). Each still is captured at full sensor resolution via `AVCapturePhotoOutput`, kept in-memory as `CGImage` + `CVPixelBuffer`, fed to Vision and ARKit, then discarded after the JSONL row is written. (No persistent photo library writes — privacy posture even in the throwaway tool.)

**When to use:** This is the spike-mandated capture protocol per the locked stack and D-08. Front gives waist/hip/shoulder *width*; side gives the *depth* at the same anatomical y-coordinate. The two together let an ellipse approximation produce a circumference without a body-shape model.

**Example pseudocode (Swift):**
```swift
// Source: developer.apple.com/documentation/avfoundation/avcapturephotooutput
// Source: developer.apple.com/documentation/vision/vndetecthumanbodypose3drequest

func captureFrontShot() async throws -> Shot {
    let photo = try await captureService.capturePhoto()  // AVCapturePhotoOutput
    let pose = try await poseService.detect3D(photo)     // VNDetectHumanBodyPose3DRequest
    let scale = scaleService.estimate(footPosition: pose.foot, arSession: ar)
    let mask = try await segmentService.mask(photo)      // optional
    return Shot(photo: photo, pose: pose, scale: scale, mask: mask, view: .front)
}

let frontShot = try await captureFrontShot()
// instructional UI: "Now turn 90° to your right"
let sideShot = try await captureSideShot()

let measurements = HeuristicService.compute(
    front: frontShot, side: sideShot, params: HeuristicParams.locked)

ScanLogger.append(ScanRecord(
    testerID: tester.id,
    sessionID: session.id,
    scanID: UUID(),
    timestamp: Date(),
    conditionLabel: condition.rawValue,
    heightInputCm: tester.heightCm,
    poseConfidenceMin: min(frontShot.pose.minConfidence, sideShot.pose.minConfidence),
    scaleSource: scale.source,    // .arkit or .userHeight
    measurements: measurements,
    tapeMeasurements: nil          // entered post-scan, separate flow
))
```

### Pattern 2: ARKit Ground-Plane Raycast with User-Height Fallback

**What:** Run an `ARSession` with `ARWorldTrackingConfiguration` and `planeDetection = .horizontal` for ~3-5 seconds before the front shot. Cast a ray from the camera through the foot keypoint pixel coordinate against `.estimatedPlane` targets; the hit's distance gives metric scale. If ARKit tracking is `.notAvailable` or `.limited` for the entire pre-capture window, fall back to `scale = userHeightCm / headToAnklePixels`.

**When to use:** Always, on every capture. ARKit is the primary scale source; the fallback is the documented degenerate path (poor floor texture, dark room, very plain carpet).

**Example pseudocode:**
```swift
// Source: developer.apple.com/documentation/arkit/arraycastquery
//         + ARCHITECTURE.md §"Stage 4 — SCALE-ESTIMATE"

func estimateScale(at footPixel: CGPoint, session: ARSession) -> ScaleResult {
    let query = session.raycastQuery(
        from: footPixel,
        allowing: .estimatedPlane,
        alignment: .horizontal)
    if let q = query, let hit = session.raycast(q).first {
        // hit.worldTransform.translation in meters relative to camera
        let cameraToFoot = simd_distance(.zero, hit.worldTransform.translation)
        return .arkit(metersPerCameraDistance: cameraToFoot, hit: hit)
    }
    // Fallback
    let pxSpan = footPixel.y - headPixel.y    // image y is top-down
    return .userHeight(cmPerPixel: tester.heightCm / Double(pxSpan))
}
```

**Important nuance from research:** Vision's `bodyHeight` property is NOT a viable third source on non-LiDAR iPhones — it falls back to a hardcoded **1.8m reference** when no LiDAR depth is provided. We must distinguish "LiDAR-derived metric height" from this default; check `observation.heightEstimation == .measured` before trusting `bodyHeight`. For the spike test devices we want NO LiDAR (so we measure the no-LiDAR experience that v1 will ship to the majority of users), or, if a Pro iPhone is the only available device, force-ignore `bodyHeight` regardless.

### Pattern 3: Locked Heuristic Parameters File

**What:** A single Swift file (`HeuristicParams.swift`) holds every numeric constant the heuristic uses (anatomical y-fraction multipliers, ellipse correction factors, smoothing weights, confidence thresholds). It is committed to git BEFORE the first real scan and not edited during the data-collection window. (D-10.)

**When to use:** Mandatory per D-10. The file is the audit trail proving we did not tune to the test cohort.

**Example:**
```swift
// HeuristicParams.swift — LOCKED at spike start.
// Any change during the spike data-collection window invalidates the run.
enum HeuristicParams {
    static let locked = Self(
        // Anatomical y as fraction of (hipKeypoint.y - shoulderKeypoint.y)
        chestYFromShoulder: 0.20,    // ~20% down from shoulder line toward hip
        waistYNarrowestSearchBand: 0.40 ... 0.65,  // search narrowest mask width in this band
        hipYFromHip: -0.05,           // 5% below hip joint line (greater trochanter)

        // Ellipse correction (front and side widths to circumference)
        // Ramanujan: C ≈ π · √(2·(a²+b²)) / 2, where a=halfWidthFront, b=halfWidthSide
        // No additional bias correction — the bias correction would itself be a tunable.
        usePlainRamanujan: true,

        // Pose acceptance gates
        minJointConfidence: 0.4,
        minRequiredJoints: 15,         // out of 17

        // Outlier handling within a session (5-rapid-capture stability sub-test)
        sessionMedianTrim: 0.20         // drop top/bottom 10% before mean
    )
}
```

### Anti-Patterns to Avoid

- **Reaching into `artifacts/sikai`.** The spike is in a separate Xcode project per D-09. If anyone is tempted to "just reuse `ScanRecord`" or "just borrow the LiDARScanner UI" — that's a violation. The output `ScanRecord` shape *informs* what Phase 2 will produce, but the spike must not import or share code with the existing app. (See `code_context.Reusable Assets: None for Phase 1` in CONTEXT.md.)
- **Auto-tuning during data collection.** Forbidden by D-10. If a result is bad, write that down. Do not adjust constants and re-run.
- **Single tester ("it works for me").** Forbidden by D-05. Three-bracket coverage is the gate condition; one-bracket data is not a partial pass.
- **Studio-only conditions.** Forbidden by D-07. Half the captures must be unassisted-solo in a real apartment.
- **Trusting `VNHumanBodyPose3DObservation.bodyHeight` blindly.** On non-LiDAR iPhones it is a 1.8m placeholder. Treat as `.reference` mode unless `heightEstimation == .measured`.
- **Capturing while `bodyHeight.heightEstimation == .reference` AND ARKit raycast failed.** Both scale sources have failed; the scan is unscaleable. Surface a "scale unavailable, using user-input height" tag on the JSONL row so analysis can isolate these.
- **Mixing testers in one session log.** Tester ID must be the first column of every record; never mutate it mid-session.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 3D body pose inference | A custom CoreML pose model | `VNDetectHumanBodyPose3DRequest` | Apple-supplied, free, optimized for ANE, gives metric meters out of the box, available on all iOS 17+ devices. |
| Camera capture | A hand-rolled `CIImage` pipeline | `AVCaptureSession` + `AVCapturePhotoOutput` | The standard Swift photo capture path. Full sensor resolution, HEIF/JPEG, exposure metadata in one call. |
| Scale calibration | A reference-object detection routine | `ARKit` ground-plane + raycast | ARKit handles plane detection robustly. Reference-object capture is UX hostile. |
| Person segmentation | A custom segmentation model | `VNGeneratePersonSegmentationRequest` (`.accurate` quality) | iOS 15+ system request, temporally smoothed in `.accurate` mode, free. |
| Body-shape mesh fitting | SMPL/SMPL-X loader + optimizer | **Don't do this in v1 at all.** PROJECT.md "Out of Scope". | Non-commercial license, blocked. v2 territory. |
| Reproducibility statistics | Custom Swift number-crunching | Export CSV → Python `pandas` + `scipy.stats` | Off-device analysis is auditable, easy to redo, and the spike harness should not be a stats engine. |
| Tape-measure ground truth | Approximating it from the keypoints themselves | An actual tape measure, partner-assisted, ISO-8559-1 landmarks, 3 takes averaged | Self-comparison is circular; the gate decision depends on an external truth. |

**Key insight:** Apple has done almost all the hard work. The spike's job is to *combine* their primitives in the right order with the right scale source — not to invent a new ML pipeline. Any custom code beyond ~500 lines of Swift is a smell.

---

## Runtime State Inventory

> Greenfield phase — no rename / refactor / migration concerns. **Section omitted as not applicable.**
> The spike creates a new Xcode project; it does not modify any existing service, datastore, OS-registered task, secret, env var, or build artifact in the sikai monorepo.

---

## Common Pitfalls

(Each pitfall maps directly to a PITFALLS.md item the spike must defend against. Mitigations here are spike-protocol-specific.)

### Pitfall 1: Conflating Test-Retest Reproducibility With Absolute Accuracy `[CITED: PITFALLS.md §1]`
**What goes wrong:** The report leads with mean absolute error vs. tape and declares success at ±2cm — but day-to-day inter-session variance is actually ±4cm.
**Why it happens:** Absolute accuracy is the academic metric researchers publish; reproducibility is what users actually feel.
**How to avoid:**
- Lead the report with **per-measurement inter-session SD** (the gate metric per D-04).
- Report mean absolute error vs. tape as a secondary metric, clearly labeled "calibration / bias."
- Same-session 5-shot variance is a tertiary metric (Pitfall 6 cross-check).
- Compute repeatability coefficient `CR = SW × 2.77` (where `SW` is the within-subject SD across paired sessions). A CR ≤ 4cm aligns with our ±2cm SD gate at the 95% bound. `[CITED: pmc.ncbi.nlm.nih.gov/articles/PMC3767825 — Vaz et al., PLoS ONE 2013]`
**Warning signs:** Words like "accuracy" or "ground truth" appearing more than "reproducibility" or "standard deviation" in the report draft.

### Pitfall 3: Demographic Bias on High-BMI Bodies `[CITED: PITFALLS.md §3]`
**What goes wrong:** Heuristic + Apple Vision works on the founder (lean) but underestimates a >32 BMI tester's waist by 5cm — and the gate report ships pretending the cohort was representative.
**Why it happens:** Pose models are trained on academic datasets that under-represent high-BMI bodies; ellipse approximations also break down where the cross-section is more bean-shaped than oval.
**How to avoid:**
- D-05 mandate: 3 BMI brackets, with the >27 (ideally >32) bracket prioritized in recruitment.
- The gate is decided per-bracket, not aggregate (D-03). A pass on lean+normal but a >±3cm result on overweight is a HARD RE-PLAN, not a soft pass.
- The spike report MUST include per-bracket reproducibility tables; aggregate-only reporting is not acceptable.
- Recruitment is the single largest schedule risk per CONTEXT.md "specifics" — start before code.
**Warning signs:** "Founder + 1 friend" tester list. Aggregate-only stats. Excited language about lean-tester results.

### Pitfall 4: Capture Protocol Looks Easy in UX, Impossible for Real Users `[CITED: PITFALLS.md §4]`
**What goes wrong:** Researcher-assisted captures pass the gate, but the user-tested solo-apartment captures show 2-3× the variance — and only the controlled numbers get reported.
**Why it happens:** The capture protocol noise dominates the model error.
**How to avoid:**
- D-07 mandates ~50/50 controlled/solo split.
- Both conditions reported separately, not merged. The gate decision applies to BOTH sets.
- In the JSONL row, `condition_label` is mandatory: one of `assisted_studio`, `assisted_apartment`, `solo_apartment`, `solo_apartment_lighting_fail`, `solo_apartment_clothing_fail`.
- Failure-mode samples (D-08) are kept in the dataset, not silently dropped — they are the documentation of where the protocol fails.
**Warning signs:** Report claims "~50% solo" but the bin counts are 80/20.

### Pitfall 6: Segmentation Flicker Destroys Measurement Consistency `[CITED: PITFALLS.md §6]`
**What goes wrong:** Two captures of the same pose, ~5 seconds apart, produce different waist circumferences by 1-2cm because the silhouette mask edge moved a few pixels.
**Why it happens:** `VNGeneratePersonSegmentationRequest` is not pixel-deterministic across slight image variations (shadows, hair, clothing).
**How to avoid:**
- Use `.accurate` quality level (the docs note `.accurate` is stateful and temporally smoothed). `[CITED: developer.apple.com/.../qualitylevel-swift.enum]`
- Same-session 5-rapid-capture stability sub-test (Claude's discretion per CONTEXT.md): take 5 successive front shots in ~10 seconds without the tester moving, report the SD as a "segmentation noise floor." If this floor is already ≥1cm, the locked formula has no headroom for real-world conditions and the report should call that out.
- Median-trim outliers within the 5-shot window (top/bottom 10% via `HeuristicParams.sessionMedianTrim`).
- If silhouette-derived width drifts more than keypoint-derived position estimate, prefer the keypoint path (it's more deterministic).
**Warning signs:** A single 5-shot SD of >2cm on any tester.

### Pitfall 7: Scale Ambiguity Without a Reliable Reference `[CITED: PITFALLS.md §7]`
**What goes wrong:** The user enters their height as 175cm but is actually 172cm; all circumferences are scaled ~1.7% too large.
**Why it happens:** Self-reported height is biased upward by 1-3cm. (Also, `bodyHeight.reference = 1.8m` on non-LiDAR iPhones is an even worse default.)
**How to avoid:**
- ARKit ground-plane raycast is the primary scale path (independent of self-reported height).
- User-height fallback is ONLY used when `ARSession.frame.camera.trackingState` is `.notAvailable` or persistently `.limited(reason: .insufficientFeatures)`.
- For the spike, **all 3 testers' actual height is measured with a wall + tape** at the start of the cohort, not self-reported — pre-spike checklist.
- The JSONL row records `scale_source: arkit | user_height` so analysis can split results.
- **NEVER use `VNHumanBodyPose3DObservation.bodyHeight` as a scale source** unless `heightEstimation == .measured` (LiDAR present) — a `.reference` value is just the 1.8m default and would silently bias all results.
**Warning signs:** Rows with `scale_source: user_height` showing systematically different circumferences than `scale_source: arkit` rows for the same tester.

### Pitfall 8: Mesh Drift / Pose Sensitivity `[CITED: PITFALLS.md §8]`
**What goes wrong:** Two captures of the same body produce different shape estimates because the tester's arm angle was ~10° different.
**Why it happens:** With cylindrical heuristics, the chest "y-fraction" depends on the shoulder→hip pixel span. If the tester droops or stretches, the anatomical y shifts.
**How to avoid:**
- D-08: enforce A-pose (arms ~45° from torso). Reject captures where the angle is >15° from spec.
- Pose-confidence rejection: `minJointConfidence: 0.4` with at least 15 of 17 joints meeting it (per existing ARCHITECTURE.md guidance, applied to the 17-joint Vision-3D scheme).
- All-fraction calculations in `HeuristicService` derive from joint coordinates, not pixel coordinates from a fixed baseline — so if the tester slouches, the math follows the actual shoulder→hip span instead of a stale assumption.
- Report a "pose validity gate" rejection rate per tester. If a tester's rejection rate is >30%, that's a UX-flag for Phase 3 capture-flow tightening.
**Warning signs:** Same-session 5-shot SD large; pose rejection rate near 0% on some testers and high on others (maybe the heuristic accepts bad poses).

### Pitfall 11: React Native Bridge / Image Format `[CITED: PITFALLS.md §11]`
**What goes wrong:** YUV420 → RGB conversion bug or buffer-lifetime crash kills the spike.
**Why it happens (in Phase 2):** Camera buffers across the JS bridge.
**Why it does NOT happen in Phase 1:** D-09 explicitly excludes the RN bridge from the spike. The harness is pure native Swift; `CVPixelBuffer` from AVCapturePhotoOutput goes straight into Vision without any bridge crossing.
**How to defend the spike anyway:** Verify `Vision` accepts the photo output's pixel format directly via `VNImageRequestHandler(cgImage:)` (the simplest path) or `VNImageRequestHandler(cvPixelBuffer:options:)`. No manual format conversion needed; if Vision rejects the buffer, that's a Phase 2 concern, not a Phase 1 blocker — escalate to the bridge-integration risk register.
**Warning signs:** Anyone wiring up a TurboModule or VisionCamera frame processor in the spike harness.

---

## Code Examples

### Set up `VNDetectHumanBodyPose3DRequest` on a captured photo

```swift
// Source: developer.apple.com/documentation/vision/vndetecthumanbodypose3drequest
// Source: WWDC23 session 111241

import Vision
import UIKit

enum PoseError: Error {
    case noObservation
    case lowConfidence(jointCount: Int)
}

struct PoseResult {
    let observation: VNHumanBodyPose3DObservation
    let joints: [VNHumanBodyPose3DObservation.JointName: simd_float4x4]
    let bodyHeightMeters: Double
    let isHeightMeasured: Bool   // false on non-LiDAR
    let cameraOrigin: simd_float4x4
}

func detect3DPose(in cgImage: CGImage) async throws -> PoseResult {
    let request = VNDetectHumanBodyPose3DRequest()
    let handler = VNImageRequestHandler(cgImage: cgImage)
    try handler.perform([request])

    guard let obs = request.results?.first as? VNHumanBodyPose3DObservation else {
        throw PoseError.noObservation
    }

    // Pull all 17 joints
    let allGroups: [VNHumanBodyPose3DObservation.JointsGroupName] =
        [.head, .torso, .leftArm, .rightArm, .leftLeg, .rightLeg]
    var joints: [VNHumanBodyPose3DObservation.JointName: simd_float4x4] = [:]
    for group in allGroups {
        let pts = try obs.recognizedPoints(group)
        for (name, pt) in pts {
            joints[name] = pt.position   // simd_float4x4 in meters, root at hip
        }
    }

    if joints.count < 15 {
        throw PoseError.lowConfidence(jointCount: joints.count)
    }

    return PoseResult(
        observation: obs,
        joints: joints,
        bodyHeightMeters: Double(obs.bodyHeight),
        isHeightMeasured: obs.heightEstimation == .measured,
        cameraOrigin: obs.cameraOriginMatrix
    )
}
```

### Cylindrical-elliptical circumference from front+side widths

```swift
// Approach: at the anatomical y-coordinate (e.g., narrowest waist band),
// measure body width in the front photo (W_f) and the side photo (W_s).
// Approximate the cross-section as an ellipse with semi-axes a = W_f/2, b = W_s/2.
// Circumference: Ramanujan first approximation
//   C ≈ π · [3(a+b) - √( (3a+b)·(a+3b) )]
// (More accurate than the symmetric-RMS form for asymmetric ellipses.)

import Foundation

struct AnatomicalSlice {
    let widthFrontMeters: Double   // a*2
    let widthSideMeters: Double    // b*2
}

func ellipseCircumference(_ slice: AnatomicalSlice) -> Double {
    let a = slice.widthFrontMeters / 2.0
    let b = slice.widthSideMeters  / 2.0
    let term = 3.0*(a+b) - sqrt((3.0*a + b) * (a + 3.0*b))
    return .pi * term
}

// Convert silhouette mask + scale to widthMeters
func bodyWidthMeters(
    mask: CVPixelBuffer,
    scaleMetersPerPixel: Double,
    atImageY y: Int
) -> Double {
    // Walk the mask row at y; find leftmost & rightmost foreground pixels.
    let (leftX, rightX) = maskRowExtents(mask: mask, y: y)
    let widthPixels = Double(rightX - leftX)
    return widthPixels * scaleMetersPerPixel
}
```

### ARKit ground-plane raycast for scale

```swift
// Source: developer.apple.com/documentation/arkit/arraycastquery
// Source: ARCHITECTURE.md §"Stage 4 — SCALE-ESTIMATE"

import ARKit

enum ScaleSource: String, Codable { case arkit, userHeight, none }

struct ScaleResult: Codable {
    let metersPerPixelAtFootDepth: Double
    let source: ScaleSource
    let trackingState: String      // .normal, .limited, .notAvailable
}

func estimateScale(
    session: ARSession,
    footPixelInUIKitCoords: CGPoint,
    userHeightCm: Double,
    headPixelInUIKitCoords: CGPoint
) -> ScaleResult {
    if let frame = session.currentFrame,
       case .normal = frame.camera.trackingState {

        let q = ARRaycastQuery(
            origin: frame.camera.transform.columns.3.xyz,
            direction: cameraRayThrough(footPixelInUIKitCoords, frame: frame),
            allowing: .estimatedPlane,
            alignment: .horizontal)

        if let hit = session.raycast(q).first {
            // Foot depth in meters (camera origin → hit point)
            let footDepth = simd_distance(
                frame.camera.transform.columns.3.xyz,
                hit.worldTransform.columns.3.xyz)
            // Convert: at depth d with focal length f, 1 pixel = d / f meters
            let f = Double(frame.camera.intrinsics.columns.0.x)
            return ScaleResult(
                metersPerPixelAtFootDepth: Double(footDepth) / f,
                source: .arkit,
                trackingState: "normal")
        }
    }

    // Fallback: user-height regression
    let pxSpan = abs(footPixelInUIKitCoords.y - headPixelInUIKitCoords.y)
    return ScaleResult(
        metersPerPixelAtFootDepth: (userHeightCm / 100.0) / Double(pxSpan),
        source: .userHeight,
        trackingState: "fallback")
}
```

### JSONL scan-record schema (per scan)

```json
{
  "tester_id": "T02",
  "tester_bmi_bracket": "normal_22_27",
  "tester_height_cm": 174.5,
  "session_id": "T02-S03",
  "scan_id": "T02-S03-scan-002",
  "timestamp": "2026-05-04T18:42:11Z",
  "condition_label": "solo_apartment",
  "lighting_label": "natural_window_diffuse",
  "clothing_label": "tight_athletic",
  "device_model": "iPhone 14 (non-LiDAR)",
  "ios_version": "17.5.1",
  "harness_commit": "abc1234",
  "heuristic_params_hash": "sha256:...",
  "scale_source": "arkit",
  "scale_meters_per_pixel": 0.00148,
  "ar_tracking_state": "normal",
  "pose_confidence_min": 0.62,
  "pose_joint_count": 17,
  "vision_body_height_m": 1.745,
  "vision_height_estimation": "measured | reference",
  "raw_keypoints_3d": { "leftShoulder": [x, y, z], "...": [] },
  "raw_keypoints_image": { "leftShoulder": [u, v], "...": [] },
  "computed_circumferences_cm": {
    "waist": 78.4,
    "hip": 96.1,
    "chest": 92.7,
    "neck": null,
    "shoulders": null,
    "left_upper_arm": null,
    "right_upper_arm": null,
    "left_thigh": null,
    "right_thigh": null
  },
  "tape_measurements_cm": {
    "waist": 79.0,
    "hip": 96.5,
    "chest": 93.0,
    "_taken_by": "partner_assisted",
    "_takes_averaged": 3
  },
  "shot_count": 2,
  "front_image_sha256": "ephemeral",
  "side_image_sha256": "ephemeral",
  "notes": ""
}
```

### CSV aggregation (off-device, Python)

```python
# Per-tester, per-measurement inter-session SD (the gate metric, per D-04)
import pandas as pd
df = pd.read_json("scans.jsonl", lines=True)
# Aggregate to one mean per (tester, session, measurement)
session_mean = (df
    .melt(id_vars=["tester_id", "tester_bmi_bracket", "session_id"],
          value_vars=["computed_circumferences_cm.waist",
                      "computed_circumferences_cm.hip",
                      "computed_circumferences_cm.chest"],
          var_name="measurement", value_name="cm")
    .groupby(["tester_id", "tester_bmi_bracket", "session_id", "measurement"])
    .mean().reset_index())

# Inter-session SD per tester per measurement
inter_session_sd = (session_mean
    .groupby(["tester_id", "tester_bmi_bracket", "measurement"])["cm"]
    .std().reset_index().rename(columns={"cm": "sd_cm"}))

# Roll up to per-bracket
per_bracket_sd = (inter_session_sd
    .groupby(["tester_bmi_bracket", "measurement"])["sd_cm"]
    .agg(["max", "mean", "count"]).reset_index())

# Gate decision (D-03):
#   max sd_cm in any (bracket, measurement) cell:
#     ≤ 2.0  → PASS
#     2.0 < x ≤ 3.0  → SOFT PASS (document)
#     > 3.0  → HARD RE-PLAN
worst = per_bracket_sd["max"].max()
gate = "PASS" if worst <= 2.0 else ("SOFT_PASS" if worst <= 3.0 else "HARD_REPLAN")
print(f"Worst inter-session SD across all (bracket × measurement) cells: {worst:.2f}cm → {gate}")
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 2D pose only (`VNDetectHumanBodyPoseRequest`, 19 joints, normalized 0-1) | 3D pose with metric meters (`VNDetectHumanBodyPose3DRequest`, 17 joints, world coordinates) | iOS 17 / WWDC 2023 | Removes the need for a separate scale-estimation model from pixels-to-meters; ARKit is still needed for absolute camera-to-foot calibration. `[CITED: WWDC23 session 111241]` |
| `react-native-vision-camera` v3 (legacy arch) | v4 → **v5 (Nitro Modules, current GA)** | v5 GA in 2026 | **Phase 2 concern only.** v4 is no longer maintained per the official VisionCamera site. v5 is rewritten on Nitro Modules with first-class New Architecture support. Phase 2 plans should target v5; existing STACK.md notes referring to "v4.x" are stale. `[VERIFIED: react-native-vision-camera.com/docs/guides/vision-camera-v5; npmjs.com via WebSearch 2026-04-30]` |
| Single-photo body measurement | Two-photo (front + side) is the mature consumer standard (3DLOOK, Bodygee, ZOZOFIT) | ~2020-2023 | Single-photo has irreducible depth ambiguity. Two-photo is the default for the spike. `[CITED: FEATURES.md]` |
| SMPL/SMPL-X mesh fitting | **Skipped for v1** — pose-keypoint cylindrical heuristic instead | 2026-04 (this project's PROJECT.md decision) | Sidesteps non-commercial license. Lower accuracy ceiling acceptable for weight-loss audience. |

**Deprecated/outdated:**
- `react-native-vision-camera` v4 — no longer maintained per official site. Plan Phase 2 around v5.
- Treating `bodyHeight` as a calibration source on non-LiDAR iPhones — research confirms it returns a `.reference` 1.8m default in the absence of LiDAR depth metadata.
- Using `ARBodyTrackingConfiguration` for still-image measurement — overkill; `VNDetectHumanBodyPose3DRequest` is the simpler path for two-shot capture (per existing STACK.md §1.2).

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Ramanujan ellipse approximation `C ≈ π·[3(a+b) − √((3a+b)(a+3b))]` is an acceptable initial heuristic for waist/hip/chest cross-sections that are roughly elliptical. | Code Examples §"Cylindrical-elliptical circumference"; HeuristicParams | LOW — the spike DESIGN is the test of this assumption. If results fail the gate with an elliptical heuristic, the conclusion is "this stack cannot deliver ±2cm without a body-shape model" — which is a valid outcome of the spike, not a research bug. |
| A2 | A `pose_confidence_min` threshold of 0.4 with ≥15 of 17 joints is a reasonable acceptance gate for the spike. | Pattern 1, HeuristicParams | LOW — derived from ARCHITECTURE.md §3 which used the prior 19-joint API. May need to be re-derived for the 17-joint 3D API; but this is a locked spike parameter so any miscalibration just shows up as a higher rejection rate, not a wrong answer. |
| A3 | ARKit ground-plane raycast against `.estimatedPlane` provides usable scale within ~3 seconds in the typical real-apartment environment (textured wood / tile / carpet edges). | Pattern 2, ScaleService | MEDIUM — if ARKit fails frequently in real apartments, the user-height fallback rate climbs and the comparison `arkit vs userHeight` rows in the report will quantify that. Either way the data is useful. |
| A4 | Vision's `.accurate` person segmentation quality level is sufficient for ±1cm-pixel-edge waist width detection on typical lighting. | Pattern 1 / SegmentService | MEDIUM — if segmentation flicker is high, the same-session 5-shot test exposes it (Pitfall 6). Spike design surfaces this as data, doesn't depend on it being true. |
| A5 | The non-LiDAR iPhone install base is the dominant v1 audience target, so the spike should NOT use a Pro / LiDAR iPhone as the primary device. | Summary; Pitfall 7 | LOW — confirmed by PROJECT.md Constraints ("Sensor: camera only — no LiDAR dependency"). |
| A6 | A 2-week soft / 4-week hard time-box leaves enough room for 3 testers × 4 sessions × 2 days = 24 paired observations to call the SD gate. | D-11 (locked) | MEDIUM — per CONTEXT.md "specifics", high-BMI bracket recruiting is the documented schedule risk. If recruiting takes the first week, engineering has 1 week to ship the harness — which is feasible for a single-screen native Swift app but tight. |
| A7 | The harness can run with the `iPhone 13 (4GB RAM)` floor (PITFALLS Pitfall #11) without thermal/memory issues, given there is no SMPL inference. | Architecture | LOW — without CoreML inference, peak memory is dominated by the captured stills (~10MB each). No realistic concern. |
| A8 | Self-reported tester height should be replaced by wall-and-tape measurement at cohort start. | Pitfall 7, Pre-spike checklist | LOW — well-documented self-report bias (Pitfall 14). One-time cost per tester. |
| A9 | The roadmap success-criterion #1 reference to `react-native-vision-camera` is a documentation hangover from when the spike was scoped to live in `artifacts/sikai`; D-09's later decision overrides it. | Summary, Open Questions | LOW — the planner will have CONTEXT.md and this RESEARCH.md both pointing at native AVFoundation; the contradiction is documented and resolved. The downstream gsd-discuss-phase / gsd-planner can confirm when consuming this research. |
| A10 | Phase 2 will adopt `react-native-vision-camera` v5 (not v4) given v4 is no longer maintained. | State of the Art | MEDIUM — informs Phase 2 plan, not Phase 1 code. The pre-spike checklist (D-12.1) item should explicitly resolve this for Phase 2 by writing a 1-page compatibility note. |

**On confirmation:** A1, A3, A4, A6 are the assumptions the spike data itself answers (the spike is the experiment). A2, A5, A7, A8, A9, A10 are operational assumptions that the planner / discuss-phase should sanity-check before the spike kicks off, but none should require user re-discussion since they all align with already-locked decisions in CONTEXT.md.

---

## Open Questions

1. **Roadmap SC#1 vs D-09 textual contradiction.**
   - What we know: `ROADMAP.md` Phase 1 success criterion #1 says "captures front + side photos using react-native-vision-camera." `CONTEXT.md` D-09 says "react-native-vision-camera + Apple Vision + ARKit invoked directly. No Expo, no React Native bridge in the spike." (Note: the CONTEXT.md text mentions react-native-vision-camera in passing — this seems to be a stale carry-over; the rationale paragraph clearly says "no React Native bridge in the spike," and the `code_context` block says "Reusable Assets: None for Phase 1 itself.")
   - What's unclear: How literally should the planner interpret the SC#1 wording vs the D-09 rationale?
   - Recommendation: Treat D-09's rationale as authoritative — **native AVFoundation + Vision + ARKit only, no `react-native-vision-camera` in the spike harness.** The roadmap success criterion should be amended at phase transition to read "captures front + side photos using AVFoundation and successfully runs Apple Vision 3D body pose extraction." Surface this for the discuss-phase to confirm before planning.

2. **Vertex-index / anatomical-y mapping for cylindrical heuristic with 17-joint Vision-3D output.**
   - What we know: Apple gives us 17 joints in metric meters (head center/top, torso 6, arms 6, legs 6). We have shoulder, hip, knee, ankle, wrist y-positions.
   - What's unclear: The narrowest-waist y-coordinate is between shoulder and hip but is not itself a joint. We have to search the silhouette mask in a band defined by joint y-fractions. The exact y-fraction band that matches ISO-8559 "natural waist" definitions across body types is empirical. CONTEXT.md D-10 says lock the parameters, so this gets locked at spike start, not tuned.
   - Recommendation: Lock `waistYNarrowestSearchBand: 0.40 ... 0.65` of (shoulder→hip span), and lock `chestYFromShoulder: 0.20`, `hipYFromHip: -0.05`. These are educated initial values; the spike measures whether they work. Document them in `HeuristicParams.swift` with citations to ISO 8559-1 landmark definitions. If results fail the gate, that's a HARD_REPLAN signal per D-03.

3. **Should the same-session 5-rapid-capture sub-test be mandatory or optional?**
   - What we know: CONTEXT.md "Claude's Discretion" says "included as a secondary check unless it adds meaningful schedule risk."
   - What's unclear: What's the schedule cost?
   - Recommendation: Include it. It's ~10 seconds per session per tester (5 fast captures back-to-back), and it directly characterizes the segmentation noise floor (Pitfall 6). Skipping it means we cannot distinguish "the body actually changed" from "the segmentation flickered." Include — schedule cost is negligible.

4. **Which iPhone to use for the spike?**
   - What we know: A non-LiDAR iPhone is preferred so we measure the no-LiDAR experience that v1 will ship to the majority of the install base. Apple Vision 3D works on all iOS 17+ iPhones; LiDAR only changes `bodyHeight` accuracy (which we shouldn't trust anyway).
   - What's unclear: Does the founder's personal device meet the criterion?
   - Recommendation: Use a non-Pro iPhone (e.g., iPhone 14, 15, 16 — non-Pro variants are non-LiDAR). If the only available device is a Pro, force-skip `bodyHeight` regardless and document this in the report. Cross-device benchmarking is deferred per CONTEXT.md "Claude's Discretion" — a single device is enough to call the gate.

5. **Tape-measure ground-truth landmark definitions: ISO 8559-1 vs fitness-industry standard.**
   - What we know: ISO 8559-1:2017 is the canonical international standard for clothing-grade body measurement. Some fitness-industry tape protocols differ slightly (e.g., "natural waist" vs "belly button level").
   - What's unclear: Which exact landmark definitions to use.
   - Recommendation: Use ISO 8559-1 landmarks — natural waist (smallest horizontal circumference between bottom of ribs and top of hips), hip (largest horizontal circumference at the hips/buttocks), chest (largest horizontal circumference under the armpits at fullest part). Document the exact protocol with photos in the harness README. Pitfall 15 (landmark ambiguity) demands this explicit definition. `[CITED: ISO 8559-1:2017 Anthropometric definitions for body measurement]`

---

## Environment Availability

This is a self-contained native iOS spike. The "environment" is the Xcode developer machine + the iPhone test device + the Python analysis environment.

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Xcode 15.4+ (16.x preferred) | Spike harness build | TBD — installed on dev machine | Apple Silicon Mac required | none — must install before spike |
| iOS 17+ test iPhone | Spike harness execution; `VNDetectHumanBodyPose3DRequest` requires iOS 17 | TBD | preferably non-Pro (no LiDAR) | none — physical device required, simulator does not run ARKit world tracking |
| Apple Developer account | Provisioning profile for personal-team install on physical iPhone (free tier acceptable for throwaway harness) | TBD | n/a | none — required for any device install |
| Python 3.11+ + `pandas`, `numpy`, `scipy` | Off-device reproducibility analysis | likely available on dev machine | n/a | run analysis in spreadsheet (slower, harder to audit, but possible) |
| Tape measure (cm-marked, fitness/tailor grade) | ISO 8559-1 ground truth | TBD | ≤1cm increments | none — must purchase if absent (~$5) |
| Tripod or counter prop | Solo-capture condition (D-07) | TBD | adult chest-to-shoulder height | use a stack of books (acceptable, document in report) |
| 3 testers across BMI brackets <22 / 22-27 / >27 | D-05 requires this | TBD — recruitment is the documented schedule risk | n/a | NO ACCEPTABLE FALLBACK. Without bracket coverage the gate decision is invalid. Per D-11, time-box extends to 4 weeks if recruiting is the bottleneck. |

**Missing dependencies with no fallback (block execution):**
- iOS 17+ physical iPhone (mandatory).
- 3 testers spanning the 3 BMI brackets (mandatory; recruitment is the schedule-critical path).
- Apple Developer account (mandatory for device install).

**Missing dependencies with fallback:**
- Python (analysis can be done in spreadsheet — discouraged).
- Dedicated tripod (book stack is acceptable).

---

## Project Constraints (from CLAUDE.md)

CLAUDE.md is binding. Phase 1 directly intersects with these directives:

| Directive | How it constrains Phase 1 |
|-----------|---------------------------|
| "v1 scope summary: No parametric body-shape model in v1 (SMPL/SMPL-X are non-commercial-licensed by MPI-IS — sidestepped entirely for v1)." | The spike heuristic is keypoint+silhouette+ellipse, NOT mesh-fit. Any deviation (e.g., "let's just try SHAPY for the spike") violates CLAUDE.md and PROJECT.md Out of Scope. |
| "All data on-device. iOS only." | Spike harness writes to FileManager only, no cloud, no analytics, no network. Even though it's a throwaway tool, the discipline carries over. |
| "Don't bypass the spike (Phase 1) — its go/no-go decision gates everything downstream." | The report is mandatory and must be honest. A false PASS is worse than a HARD_REPLAN. |
| "pnpm workspace monorepo" / "Package manager: pnpm (enforced — npm and yarn are blocked)" | Does NOT apply to the spike harness because the harness is in a separate Xcode project outside the monorepo (D-09). The harness has no JavaScript at all. |
| "Mock-data seeding: ... v1 removes this from the default path (DATA-01) and exposes it only via opt-in demo mode (DEMO-01). Do not extend the mock data; replace it." | Phase 2 concern; spike does not touch `artifacts/sikai/context/AppContext.tsx`. |
| "Existing scan UI is a facade. ... v1 replaces the engine while keeping these visuals as polish on top of real capture (CAP-07)." | Phase 3 concern; spike does not touch any UI in `artifacts/sikai`. |

**No CLAUDE.md directive is violated by the spike scope as defined in CONTEXT.md.**

---

## Sources

### Primary (HIGH confidence)
- Apple Developer Documentation — `VNHumanBodyPose3DObservation` and `VNDetectHumanBodyPose3DRequest` (iOS 17+) — joint count, units, height estimation property, camera origin matrix. `[CITED: developer.apple.com/documentation/vision/vnhumanbodypose3dobservation]`
- WWDC 2023 Session 111241 — "Explore 3D body pose and person segmentation in Vision" — confirmed 17 joints in 6 groups (head, torso, leftArm, rightArm, leftLeg, rightLeg), metric meters with origin at root (hip center), `bodyHeight` reference fallback to 1.8m on non-LiDAR. `[VERIFIED: developer.apple.com/videos/play/wwdc2023/111241]`
- Apple Developer Documentation — `VNGeneratePersonSegmentationRequest`, `.accurate` quality level is stateful and temporally smoothed. `[CITED: developer.apple.com/documentation/vision/vngeneratepersonsegmentationrequest]`
- Apple Developer Documentation — ARKit `ARRaycastQuery`, `.estimatedPlane` target, `ARWorldTrackingConfiguration`. `[CITED: developer.apple.com/documentation/arkit/arraycastquery]`
- Apple Developer Documentation — `AVCaptureSession`, `AVCapturePhotoOutput`. `[CITED: developer.apple.com/documentation/avfoundation]`
- Project research — `.planning/research/SUMMARY.md`, `PITFALLS.md` (Pitfalls 1, 3, 4, 6, 7, 8, 11), `ARCHITECTURE.md` (8-stage pipeline), `STACK.md` (rationale).
- Project context — `.planning/PROJECT.md` (locked architecture, v1 scope), `.planning/REQUIREMENTS.md` (SPIKE-01..04), `.planning/ROADMAP.md` Phase 1, `.planning/STATE.md`, `.planning/codebase/CONCERNS.md` (facade vs. real today).
- ISO 8559-1:2017 — anthropometric definitions for body measurement (waist, hip, chest landmarks). `[CITED: iso.org/standard/61686.html]`

### Secondary (MEDIUM confidence — verified against multiple sources)
- `react-native-vision-camera` v5 GA status, v4 archived. `[VERIFIED via WebSearch 2026-04-30: react-native-vision-camera.com/docs/guides/vision-camera-v5; npmjs.com; blog.margelo.com/whats-new-in-visioncamera-v5]`
- 3DLOOK and Bodygee published capture protocols (front + side photos, tight clothing, voice-guided self-mode). `[CITED: 3dlook.ai/content-hub/how-to-take-your-body-measurements-at-home; support.bodygee.com]`
- Vaz et al., "The Case for Using the Repeatability Coefficient When Calculating Test–Retest Reliability" (PLoS ONE 2013) — `CR = SW × 2.77` formula. `[CITED: pmc.ncbi.nlm.nih.gov/articles/PMC3767825]`
- Anthropometry reproducibility methodology (ICC, repeatability coefficient, within-subject SD). `[CITED: real-statistics.com/reliability/interrater-reliability/intraclass-correlation/icc-for-test-retest-reliability]`

### Tertiary (LOW confidence — flagged for validation in spike or in discuss-phase)
- "Empirical Study of Monocular Human Body Measurement Under Weak Calibration" (arxiv 2601.01639) — surveyed three weakly-calibrated approaches (landmark-geometry / pose-driven / object-calibrated silhouette); confirms our heuristic family is published and not invented here, but does not provide locked constants for the iOS 17 / 17-joint output. `[CITED: arxiv.org/html/2601.01639]`
- Cylindrical body part approximation as a foundational modeling choice — well-known general principle but specific tunings (ellipse vs. true cylinder vs. superellipse) are application-specific and would themselves be tuning parameters. `[ASSUMED A1]` Spike design treats this as a hypothesis under test.

---

## Metadata

**Confidence breakdown:**
- Standard stack (Vision 3D / ARKit / AVFoundation / Person Segmentation): HIGH — Apple-documented, WWDC23-confirmed.
- Architecture (single-tier native, two-shot still capture): HIGH — straightforward composition of standard primitives.
- Heuristic-formula prior art (cylindrical-from-pose without SMPL): MEDIUM — published and recognized as a valid family; specific locked constants are first-principles educated guesses that the spike itself tests (per A1).
- Pitfall mitigations: HIGH — directly mapped from PITFALLS.md, defenses are in the protocol design.
- React-Native-Vision-Camera v5 fitness for Phase 2: MEDIUM — confirmed v5 is GA and v4 archived, but actual Expo SDK 54 plug-in stability for Phase 2 must be re-verified via the D-12.1 pre-spike checklist note.
- ISO-8559-1 ground-truth protocol applicability: HIGH — international clothing-industry standard, exactly the domain Sik AI operates in.

**Research date:** 2026-04-30
**Valid until:** 2026-07-30 (90 days — Apple Vision 3D / ARKit / AVFoundation are stable system APIs; iOS minor updates are unlikely to affect the spike. The react-native-vision-camera v5 line should be re-verified at Phase 2 plan-time regardless.)
