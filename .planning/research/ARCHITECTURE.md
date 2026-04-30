# Architecture Patterns: On-Device Body Measurement Engine

**Domain:** On-device body measurement from monocular camera (iOS)
**Researched:** 2026-04-30
**Confidence:** MEDIUM — core pipeline patterns are HIGH confidence from well-established ML/iOS literature; specific CoreML model performance numbers are MEDIUM; exact Expo/RN bridge API shapes are MEDIUM pending direct verification

---

## Recommended Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  React Native JS Layer                                              │
│                                                                     │
│  ScanScreen (scan.tsx)                                              │
│    → CaptureOrchestrator (hook: useScanCapture)                     │
│       → issues commands, receives progress events                   │
│    → LiDARScanner.tsx / ARScanAnimation.tsx (existing polish UI)    │
│    → ScanResultReview (shows measurements before saving)            │
│                                                                     │
│  AppContext.addScan(ScanRecord) → AsyncStorage                      │
└─────────────────────┬───────────────────────────────────────────────┘
                      │ JSI / Turbo Native Module (New Architecture)
                      │ Commands: startCapture, captureFrame, stopCapture
                      │ Events:   poseReady, progressUpdate, measurementReady, error
┌─────────────────────▼───────────────────────────────────────────────┐
│  Native iOS Module Layer  (Swift, Objective-C++)                    │
│                                                                     │
│  MeasurementEngineModule  (Turbo Native Module)                     │
│    → CaptureSessionManager  (AVFoundation: AVCaptureSession)        │
│    → FramePreprocessor      (vImage / Metal: resize, normalize)     │
│    → PoseEstimator          (Apple Vision: VNDetectHumanBodyPoseRequest
│                              + optional CoreML: ViTPose / HRNet)    │
│    → SegmentationProvider   (Apple Vision: VNGeneratePersonSegmentation
│                              + optional CoreML: SAM2-Mobile)        │
│    → ScaleEstimator         (ARKit: ARSession, ground plane +       │
│                              user height fallback)                  │
│    → BodyModelFitter        (CoreML: SHAPY / SMPL-X-based model)    │
│    → MeasurementExtractor   (Swift geometry from fitted mesh)       │
│    → SmoothingAggregator    (Kalman / exponential smoothing across  │
│                              N frames or shots)                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Boundaries

| Component | Layer | Technology | Responsibility |
|-----------|-------|-----------|----------------|
| `ScanScreen` | RN JS | Expo Router screen | Orchestrates UI state; shows capture guide overlays, loading states, results review |
| `useScanCapture` | RN JS | Custom hook | Calls Turbo Module, collects events, exposes `phase`, `progress`, `result` to screen |
| `MeasurementEngineModule` | Native (Swift) | Turbo Native Module | Single entry point for JS↔native boundary; serializes data for JSI |
| `CaptureSessionManager` | Native (Swift) | AVFoundation | Configures `AVCaptureSession`, picks resolution (1920×1080 @ 30fps), manages device orientation |
| `FramePreprocessor` | Native (Swift/Metal) | vImage, Metal shaders | Resize frame to model input size (e.g. 256×192 for ViTPose), pixel-format conversion (BGRA → RGB planar), exposure normalization via histogram equalization |
| `PoseEstimator` | Native (Swift) | Apple Vision `VNDetectHumanBodyPoseRequest` (19 keypoints) + optional CoreML `ViTPose-S` (133 keypoints) for finer joint coverage | Detects 2D skeleton keypoints with confidence scores; filters low-confidence frames |
| `SegmentationProvider` | Native (Swift) | Apple Vision `VNGeneratePersonSegmentationRequest` (iOS 15+) | Produces person mask for background removal; used to crop silhouette shape fed to body model fitter |
| `ScaleEstimator` | Native (Swift) | ARKit `ARSession` (world tracking) + user-supplied height fallback | Derives px-per-cm conversion; primary: ARKit ground-plane distance to foot keypoints; fallback: known height regression from head-to-foot pixel span |
| `BodyModelFitter` | Native (Swift) | CoreML: converted SHAPY or SMPL-X-Lite regressor | Maps 2D keypoints + silhouette constraints → SMPL shape parameters (β); shape parameters encode body size/proportions independent of pose |
| `MeasurementExtractor` | Native (Swift) | Swift geometry on SMPL mesh vertices | Extracts circumferences by slicing mesh at anatomical planes; outputs 11 body measurements in cm |
| `SmoothingAggregator` | Native (Swift) | Exponential moving average or Kalman filter | Takes N measurements from multiple frames (or shots); rejects outliers (IQR filter); outputs final smoothed estimate |
| `LiDARScanner.tsx` / `ARScanAnimation.tsx` | RN JS | Existing SVG/Reanimated 4 | Unchanged visual polish layer; driven by phase/progress state from `useScanCapture` |

---

## Pipeline Stages (Named for Roadmap Use)

### Stage 1 — CAPTURE
**What:** Video frames from rear camera, captured via `AVCaptureSession`
**Input:** User standing 2–3m from phone, propped or held
**Output:** Raw `CVPixelBuffer` frames (BGRA, 1920×1080 @ 30fps)
**RN/Native boundary:** JS sends `startCapture` command with capture config; native buffers internally; JS never sees raw frame bytes

### Stage 2 — FRAME-PREPROCESS
**What:** Normalize each frame for model input
**Input:** Raw `CVPixelBuffer`
**Output:** Normalized float tensor (RGB, 256×192 or 512×384 depending on model), person mask applied
**Notes:** vImage accelerates pixel-format conversion; Metal shader handles histogram equalization for consistent lighting; person segmentation (`VNGeneratePersonSegmentationRequest`) runs here to blank background before pose model sees the frame

### Stage 3 — POSE-ESTIMATE
**What:** Detect 2D skeleton keypoints
**Input:** Normalized frame tensor
**Output:** Array of `(x, y, confidence)` per keypoint (19 keypoints via Apple Vision, or up to 133 via ViTPose-S CoreML)
**Decision point:** Apple Vision's built-in `VNDetectHumanBodyPoseRequest` is free and fast (~10ms on A15+) but gives only 19 joints, which is borderline for shape fitting. ViTPose-S (~25MB CoreML) gives 133 keypoints and significantly improves shape fitting quality. Use Apple Vision for the spike (faster to integrate); graduate to ViTPose-S if fitting quality is poor.
**Filter:** Frames where fewer than 15 of 19 keypoints exceed confidence 0.4 are discarded

### Stage 4 — SCALE-ESTIMATE
**What:** Compute px-per-cm conversion factor
**Input:** Pose keypoints (foot position), ARKit session state, user-provided height (cm) from onboarding profile
**Output:** `scaleFactor: Float` (cm per pixel)
**Primary path:** ARKit `ARSession` with world tracking — foot keypoints are ray-cast against detected ground plane to get real-world Y distance from camera; combined with pixel position of feet gives scale. Confidence HIGH on flat floors.
**Fallback path:** If ARKit world tracking confidence is `.notAvailable` or `.low`, fall back to height-based regression: `scaleFactor = userHeightCm / headToFootPixels`. This is reliable to ±3–5% which is sufficient for ±2cm measurements.
**Important:** Scale is per-session, not per-frame. Computed once at start of capture and locked. If ARKit tracking is lost mid-session, keep the last known scale.

### Stage 5 — BODY-MODEL-FIT
**What:** Map 2D keypoints + silhouette → SMPL shape parameters
**Input:** N×(keypoints + scale) tensors from best-quality frames selected by aggregator, person mask silhouette
**Output:** SMPL β vector (10–16 shape coefficients), SMPL pose θ (joint angles confirming standing T/A-pose)
**Model choice:** SHAPY (Shape from Poses and contours) is the most directly applicable open-source model for this task. It uses both pose keypoints and body silhouette contours — exactly what we have. Convert `.pt` weights → CoreML via `coremltools` `ct.convert()`. Expected model size: 30–80MB. Run on Neural Engine if available.
**Alternative:** A custom-trained regressor (smaller, faster) mapping keypoints → β directly, trading silhouette information for speed. Consider for v1.1.
**Spike goal:** Establish whether single-shot fitting with SHAPY-class model achieves ±3cm before investing in multi-shot averaging.

### Stage 6 — MEASUREMENT-EXTRACT
**What:** Derive circumferences from fitted 3D mesh
**Input:** SMPL β parameters → instantiated SMPL mesh (~6890 vertices)
**Output:** 11 measurements in cm: chest, waist, hips, left/right bicep, left/right thigh, neck, shoulder width + derived body fat % / muscle mass % via SMPL-derived volume formulas
**Method:** For each circumference, identify the horizontal slice plane at the anatomical landmark (e.g., waist = narrowest point between lowest rib and iliac crest on the mesh). Compute the perimeter of the cross-section polygon at that plane. All geometry runs in Swift using SMPL mesh vertex coordinates — no GPU needed at this stage.
**Derived fields:** Body fat % and muscle mass % from SMPL shape parameters use published regression equations (Gu et al., 2022 style) — LOW confidence on accuracy; treat as relative indicators, not clinical values.

### Stage 7 — SMOOTH-AGGREGATE
**What:** Combine measurements across frames/shots for final result
**Input:** Array of `MeasurementSet` from M accepted frames
**Output:** Single `MeasurementSet` with per-measurement uncertainty estimate
**Method:** IQR outlier rejection (drop top/bottom 10%), then mean of remaining. For single-shot, this runs on the best 5–10 frames selected during a ~3-second hold. For multi-shot, run independently per shot then average.
**Output to JS:** `MeasurementReady` event with final values + confidence flags (e.g., "waist measurement had high variance — consider retaking")

### Stage 8 — SCAN-RECORD-PERSIST
**What:** Store final measurement as `ScanRecord` in AsyncStorage
**Input:** `MeasurementSet` from Stage 7
**Output:** `ScanRecord` appended to `AppContext.scanHistory`
**Location:** Entirely in RN JS layer — `AppContext.addScan()` is unchanged from existing code. No native involvement.

---

## Data Flow

```
AVCaptureSession
    │  CVPixelBuffer (raw frames, never crosses bridge)
    ▼
FramePreprocessor
    │  Float tensor (normalized, segmented) — stays native
    ▼
PoseEstimator  ◄──── VNDetectHumanBodyPoseRequest / CoreML ViTPose
    │  [(x,y,confidence)] per keypoint — stays native
    ▼
ScaleEstimator  ◄──── ARKit ARSession (ground plane) / userHeight
    │  scaleFactor (Float) — stays native
    ▼
BodyModelFitter  ◄──── CoreML SHAPY/SMPL-X-Lite
    │  β: [Float] (SMPL shape params) — stays native
    ▼
MeasurementExtractor
    │  MeasurementSet {chest, waist, hips, ...} in cm — stays native
    ▼
SmoothingAggregator
    │  Final MeasurementSet + confidence flags
    │
    │  ←— JSI event: measurementReady({...measurements, confidence})
    ▼
useScanCapture (RN hook)
    │  Typed MeasurementResult object
    ▼
ScanResultReview screen (user sees + confirms)
    ▼
AppContext.addScan(ScanRecord)
    ▼
AsyncStorage (persisted)
```

**What crosses the bridge and when:**

| Crossing | Direction | Payload | Timing |
|----------|-----------|---------|--------|
| `startCapture(config)` | JS → Native | `{ durationSecs, captureMode, userHeightCm }` | On tap "Start Scan" |
| `progressUpdate` event | Native → JS | `{ phase: string, frameCount: int, poseQuality: float }` | ~2Hz during capture |
| `poseReady` event | Native → JS | `{ keypointCount: int, confidence: float }` | Once stable pose detected |
| `measurementReady` event | Native → JS | Full `MeasurementSet` + `{ confidence, warnings: string[] }` | Once per scan session |
| `captureError` event | Native → JS | `{ code: string, message: string }` | On any stage failure |

Raw pixel data, pose keypoint arrays, shape parameters, and intermediate tensors **never cross the bridge**. Only scalar measurements and progress signals cross.

---

## Multi-Shot vs. Single-Shot Decision

**Recommendation: Two-Shot Protocol (Front + Side), with optional third shot**

**Rationale:**

Single-shot (one photo): Achieves body shape fitting but has fundamental ambiguity — a front-facing image cannot distinguish a wide flat chest from a narrow deep chest. Waist and hip circumferences require depth information. Realistically achieves ±3–5cm for circumferences, which is below the target of ±0.5cm for gym users.

360° rotation video: SOTA commercial systems (3DLOOK, MeThreeSixty) use this and achieve ±1–2cm. However, it requires hands-free phone placement (tripod or propped against wall), significantly more capture complexity, larger temporal alignment problem, and is overkill for the spike phase. ZOZOFIT achieves ±1cm but with a patterned suit as extra shape information.

Two-shot (front + side): Best tradeoff for v1. Front view constrains shoulder width, waist width, hip width. Side view constrains chest depth, waist depth, hip depth, belly protrusion. Together they overdetermine the SMPL shape parameters and disambiguate the depth ambiguity. This is the approach used by academic systems like Caesar/CAESAR-Net and several app-based pipelines.

| Approach | Expected Accuracy | UX Complexity | Spike Complexity |
|----------|------------------|---------------|-----------------|
| Single-shot | ±3–5 cm | Low | Low |
| Two-shot (front + side) | ±1–2 cm | Medium | Medium |
| 360° rotation video | ±1–2 cm | High | High |
| 3+ discrete views | ±1–2 cm | Medium | High |

**Recommended protocol:**
1. Front: user stands facing camera, feet shoulder-width apart, arms slightly away from body (A-pose). 3-second hold while system captures N frames.
2. Side: user turns 90° (left side to camera). 3-second hold.
3. System independently fits shape on each view, then fuses β estimates.
4. Optional: if confidence is low, prompt for a third "back" shot.

**Phase approach:** Spike uses single-shot to minimize integration complexity and establish baseline accuracy. Graduate to two-shot if single-shot accuracy is insufficient.

---

## Scale / Calibration Approach

**Recommendation: ARKit World Tracking as primary, user-height as fallback**

### Primary — ARKit Ground Plane + Foot Keypoints (HIGH confidence)
ARKit `ARSession` in `.worldTracking` mode detects the horizontal ground plane within 1–3 seconds on any flat floor. When foot keypoints (from pose estimator) are ray-cast to the ground plane, we get the real-world distance from the camera to the feet in meters. Combined with the pixel-space position of the feet, this yields a precise px-per-cm ratio.

**Reliability:** ARKit world tracking works on all iPhones with A9+ (all iOS 17+ devices). Flat, textured floors converge quickly. Carpets and very plain floors may take longer. On failure or low confidence, drop to fallback.

**ARKit session lifecycle:** Run a lightweight `ARSession` only during active capture — do not hold it open while the app is in background or while user is navigating elsewhere. This avoids battery drain.

### Fallback — User Height Regression
When `ARWorldTrackingConfiguration.isSupported` is false (simulator) or tracking quality is `.notAvailable`:
- `scaleFactor = userHeightCm / headToAnklePixels`
- User height is collected during onboarding; already stored in `UserProfile.height`
- Accuracy: ±3–5% on scale, which translates to ±2–3cm on circumferences at typical body proportions
- Sufficient for the weight-loss audience; borderline for gym-user grade

### Not Recommended — Known Reference Object
Requiring the user to hold up a piece of paper, a credit card, or wear a specific garment is a UX friction point that creates a support burden and reduces conversion. ARKit + height fallback is sufficient without adding a physical prop.

---

## Suggested Build Order

Dependencies flow top-to-bottom. Items at the same level can be built in parallel.

```
Level 0 (Parallel, no dependencies)
├── A: Turbo Native Module scaffold (MeasurementEngineModule — empty shell with JSI bindings)
├── B: Capture protocol UX (pose guidance overlay, framing checks, in existing scan.tsx)
└── C: CoreML model conversion pipeline (SHAPY/SMPL-X .pt → .mlpackage offline tooling)

Level 1 (depends on A)
├── D: CaptureSessionManager + FramePreprocessor (AVFoundation + vImage)
└── E: ScaleEstimator (ARKit integration, height fallback)

Level 2 (depends on D)
└── F: PoseEstimator (Apple Vision VNDetectHumanBodyPoseRequest — fast start)

Level 3 (depends on C, D, F, E)
└── G: BodyModelFitter (CoreML inference, SMPL shape parameters)

Level 4 (depends on G)
└── H: MeasurementExtractor (SMPL mesh geometry, circumference extraction)

Level 5 (depends on H)
└── I: SmoothingAggregator (multi-frame + multi-shot fusion)

Level 6 (depends on I, A)
└── J: End-to-end integration: wire I → JSI events → useScanCapture hook → ScanResultReview → AppContext.addScan

Level 7 (depends on J)
├── K: Capture quality gates (low-light detection, distance check, pose check — block bad inputs)
└── L: Replace mock data seeding with real-scan empty state
```

**Critical path:** A → D → F → G → H → I → J. Everything else is parallelizable.

**Spike scope:** Levels 0–6 with a single-shot flow, measuring 5 volunteers against tape-measure ground truth. Levels 7+ are product hardening after go/no-go decision.

---

## Background Processing and UX

**Recommendation: Asynchronous post-capture processing with live feedback during capture**

### During Capture (synchronous-feeling, actually streaming)

The user sees the existing `LiDARScanner.tsx` / `ARScanAnimation.tsx` visual. The native module streams progress events at ~2Hz. The JS layer drives the animation:
- `poseReady` event → AR brackets snap to body (existing `ARScanAnimation.tsx` behavior, now triggered by real pose)
- `progressUpdate.poseQuality` → animate scan beam speed / point density to reflect real detection quality
- Pose quality gate: if quality drops below threshold (user moved, bad lighting), show "Hold still" overlay; native module discards those frames automatically

This makes the ~3-second capture feel instantaneous and continuous.

### Body Model Fitting (asynchronous, after capture)

SHAPY/SMPL-X fitting on CoreML Neural Engine takes ~0.5–2 seconds on iPhone. **Do not block the UI thread.** Structure:
1. Capture phase ends (user has held pose for 3 seconds)
2. Native module queues fitting work on a background `DispatchQueue`
3. JS layer transitions scan screen to "Analyzing..." state (existing scan animation continues)
4. `measurementReady` event fires → JS transitions to result review screen

The "thinking moment" should be 1–3 seconds maximum. If Neural Engine is busy (e.g., phone is warm from a previous scan), it may extend to 5 seconds — show a progress indicator, not a spinner with no feedback.

### Multi-Shot Sequencing

For the two-shot protocol:
1. Front shot: 3 seconds hold → "Great! Now turn to your left side"
2. Side shot: 3 seconds hold → "Analyzing..."
3. Fitting runs on both shots combined → result

Each shot's capture + preprocessing runs in 3 seconds real time. Fitting of the combined views takes an additional 1–3 seconds. Total session: ~10–15 seconds plus user instruction time.

**Do not process the front shot while the user is rotating for the side shot** — start processing only after both shots are captured to enable joint fitting. (Exception: run pose quality checks asynchronously during each shot to flag bad frames before proceeding.)

---

## Expo / React Native New Architecture Integration

### Turbo Native Module (not Legacy NativeModules)

With New Architecture enabled (`"newArchEnabled": true` already in the project), use a **Turbo Native Module** (Codegen-driven). This avoids the async bridge and enables synchronous-capable JSI calls.

Module spec (TypeScript, drives Codegen):
```typescript
// native_modules/NativeMeasurementEngine.ts
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  startCapture(config: CaptureConfig): void;
  stopCapture(): void;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('MeasurementEngine');
```

Events use `RCTEventEmitter` (Swift side) → NativeEventEmitter (JS side). The existing React Native New Architecture's Fabric does not change event handling for Turbo Modules — standard EventEmitter pattern still applies.

### Not a Fabric Component

The measurement engine is not a UI component — it emits no views. Use a Turbo Native Module (non-UI), not a Fabric Native Component. This is simpler and avoids Fabric's view reconciliation.

### React Compiler Compatibility

The `useScanCapture` hook will be compiled by React Compiler. Ensure:
- No mutation of captured values from effects
- Event listener setup/teardown in `useEffect` with proper cleanup
- `NativeEventEmitter` subscriptions removed in cleanup

---

## Caching Strategy

| Data | Cache location | TTL | Why |
|------|---------------|-----|-----|
| Fitted β parameters | In-memory (native) during session only | Session-scoped | Privacy; no persistent body model needed |
| ARKit scale factor | In-memory (native) during session | Session-scoped | Re-derives each scan; environmental conditions change |
| SMPL mesh vertex positions | In-memory (native) during fitting | Fitting-scoped | ~6890 × 3 floats = ~82KB; not worth caching |
| CoreML model handles | Native module property | App lifetime | Model loading is expensive (~200–800ms); load once on module init |
| Final MeasurementSet | JS: AppContext + AsyncStorage | Permanent | User's scan history |
| Raw frames (CVPixelBuffer) | Native circular buffer (5–10 frames) | Capture-scoped | Never persisted; discarded after fitting |

**Privacy note:** Raw camera frames and body model parameters are never written to disk. Only the final scalar measurements and the ISO date are persisted in AsyncStorage.

---

## Determinism and Repeatability

The target is ±0.5cm test-retest reproducibility. Sources of non-determinism and mitigations:

| Source of Variance | Mitigation |
|-------------------|-----------|
| Capture pose variation (user moves slightly) | Pose quality gate: accept only frames where all major joints > 0.4 confidence; reject if torso angle changes > 5° between frames |
| Lighting changes between sessions | Histogram equalization in FramePreprocessor; explicit lighting quality check (reject if mean luminance < 40 or > 220) |
| Camera-to-subject distance | Distance check: reject if foot-to-head pixel span implies < 1.5m or > 4m distance; show warning prompt |
| CoreML floating-point nondeterminism | Neural Engine output is deterministic for the same input; ensure inputs are bit-for-bit identical by fixing preprocessing pipeline. Log input tensor statistics for debugging. |
| SMPL fitting optimization convergence | Fitting uses a feedforward regressor (not iterative optimization) in SHAPY — output is deterministic given identical inputs. If iterative refinement is added later, fix random seed. |
| Scale factor drift (ARKit) | Lock scale at first stable reading; do not update during capture to prevent measurement drift mid-session |
| Clothing | Capture protocol guidance: "wear form-fitting clothing or minimal clothing"; do not build clothing correction in v1 |

---

## Scalability Considerations

This is a single-user, single-device, offline-only system. "Scalability" means computational performance on-device, not horizontal server scaling.

| Concern | On A15 (iPhone 13) | On A18 (iPhone 16) | Mitigation if slow |
|---------|-------------------|-------------------|-------------------|
| Pose estimation latency | ~10ms/frame (Vision) | ~5ms/frame | Throttle to 10fps; Vision is not the bottleneck |
| SHAPY CoreML inference | ~800ms–1.5s | ~400–700ms | Neural Engine; accept longer wait with progress indicator |
| SMPL mesh circumference extraction | ~5ms (Swift geometry) | ~2ms | Not a concern |
| Memory: SMPL model weights | ~50–80MB RAM | same | Load once; release on app backgrounding if memory pressure |
| Thermal throttling on repeated scans | May increase inference time 2× after 3–4 scans in quick succession | same | Warn user if device is warm; add minimum 30s between scans |

---

## Sources

- Apple Developer Documentation: `VNDetectHumanBodyPoseRequest` (Vision framework, iOS 14+) — HIGH confidence
- Apple Developer Documentation: `VNGeneratePersonSegmentationRequest` (Vision framework, iOS 15+) — HIGH confidence
- Apple Developer Documentation: ARKit `ARWorldTrackingConfiguration`, ground plane detection — HIGH confidence
- SHAPY: "Accurate 3D Body Shape Regression using Metric and Semantic Attributes" (Choutas et al., CVPR 2022) — HIGH confidence, well-cited paper
- SMPL-X: "Expressive Body Capture: 3D Hands, Face, and Body from a Single Image" (Pavlakos et al., CVPR 2019) — HIGH confidence, widely used
- ViTPose: "ViTPose: Simple Vision Transformer Baselines for Human Pose Estimation" (Xu et al., NeurIPS 2022) — HIGH confidence
- React Native New Architecture Turbo Modules documentation — MEDIUM confidence (API shapes require direct verification against RN 0.81 docs)
- CoreML Tools (`coremltools`) for model conversion: Apple OSS, well-documented — HIGH confidence
- Multi-view body shape from 2 images (front + side): standard approach in academic systems (CAESAR, SMPLify-X) — HIGH confidence in principle; specific accuracy numbers for iPhone cameras are MEDIUM confidence and require spike validation
