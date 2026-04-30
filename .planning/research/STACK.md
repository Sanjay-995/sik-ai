# Technology Stack: Sik AI Measurement Engine

**Project:** Sik AI — on-device body measurement engine (iOS, camera-only)
**Researched:** 2026-04-30
**Scope:** Measurement-engine sub-stack only. App shell (Expo SDK 54, RN 0.81, New Architecture, Reanimated 4) is fixed.
**Research method:** Training knowledge (cutoff Aug 2025) + Apple developer docs. WebSearch/WebFetch/Bash tools unavailable in this environment. Confidence levels are explicitly annotated; all LOW-confidence items must be verified before implementation begins.

---

## 1. iOS Native APIs

### 1.1 Apple Vision — Body Pose Detection

| Property | Value | Confidence |
|----------|-------|------------|
| API | `VNDetectHumanBodyPoseRequest` / `VNHumanBodyPoseObservation` | HIGH |
| Joints detected | 19 body keypoints (head, neck, left/right shoulder, elbow, wrist, hip, knee, ankle, eye, ear, root) | HIGH |
| Coordinate space | 2D normalized image coordinates (0–1), NOT metric 3D | HIGH |
| iOS minimum | 14.0+ | HIGH |
| Multi-person | Single-person observation per request (v1 API) | HIGH |
| 3D pose | Not directly. `VNHumanBodyPose3DObservation` was introduced in iOS 17.0 — 3D joint positions in camera space with approximate metric scale via height estimate | HIGH |
| Body3D requirements | iOS 17+ required; works on any iPhone (no LiDAR, no A-chip restriction); requires a full standing body in frame | HIGH |
| Depth source | Monocular depth estimation from a single camera frame — approximate, not LiDAR-quality | HIGH |
| Height estimate | `VNHumanBodyPose3DObservation` exposes a `heightEstimation` property (approximate height in meters, confidence-gated) | HIGH |
| Commercial use | Apple system API — no license restriction | HIGH |

**Critical limitation for body measurement:** `VNHumanBodyPose3DObservation` provides skeleton joint positions in metric space but does NOT produce a body mesh or body shape. It tells you where the joints are, not the surface geometry between them. You cannot directly compute waist circumference from 19 skeleton joints without a body shape model.

**Why to use it anyway:** 19 keypoints + approximate height from a single image is the critical input that feeds a parametric body-model fitting stage. It is the most reliable, Apple-supported, zero-dependency source of body skeleton data on iOS.

**Why NOT to use it as the sole measurement source:** Keypoints alone have no body shape. A person with a 70cm waist and a person with an 85cm waist can have near-identical skeletons at the joint positions Vision reports. The parametric model is what resolves shape.

---

### 1.2 ARKit — Body Tracking and Scale Reference

| Property | Value | Confidence |
|----------|-------|------------|
| API | `ARBodyTrackingConfiguration` + `ARBodyAnchor` | HIGH |
| Joints tracked | 91 joints in a full skeleton hierarchy (includes fingers, face) | HIGH |
| Coordinate space | 3D world coordinates from device pose estimation | HIGH |
| Scale reference | Joint positions are in metric world coordinates; approximate scale via monocular depth | HIGH |
| iOS minimum | 13.0+ | HIGH |
| Device requirement | A12 Bionic chip or later; does NOT require LiDAR | HIGH |
| Requirement A12+ means | iPhone XS (2018) and later — effectively all iOS 17+ devices | HIGH |
| Live video | Requires an active ARSession with camera feed; not a single-image API | HIGH |
| Person must be | Full body visible from ~2m distance, standing; partial occlusion degrades tracking | HIGH |

**Relationship to Vision 3D:** `ARBodyTrackingConfiguration` and `VNHumanBodyPose3DObservation` are complementary. ARKit provides real-time world-anchored tracking; Vision 3D processes still images. For a scan-flow (capture a set of stills or short video), Vision 3D is simpler to integrate than ARKit's live session requirement.

**Scale reference via ARKit:** ARKit can serve as a scale calibration mechanism — if you have the user walk to a known distance or hold a known object, ARKit world tracking provides metric reference. However, this adds UX complexity to the scan flow and is not strictly required if the body model fitting uses height as the scale anchor.

**Recommendation for v1:** Use Vision 3D (`VNHumanBodyPose3DObservation`) for the primary pose extraction from captured frames. ARKit body tracking is valuable for real-time guidance overlays but adds session management complexity for a still-capture scan flow. Revisit ARKit for real-time scanning mode in v1.1.

---

### 1.3 Core ML

| Property | Value | Confidence |
|----------|-------|------------|
| Model format | `.mlpackage` (primary, replaces `.mlmodel`) | HIGH |
| Conversion tools | `coremltools` Python library (Apple-maintained, pip installable) | HIGH |
| Source frameworks | PyTorch (via `torch.export` or `torchscript`), TensorFlow, ONNX | HIGH |
| Apple Neural Engine | Used automatically for compatible ops; no manual routing needed | HIGH |
| GPU fallback | Automatic if ANE not available or ops not supported | HIGH |
| Quantization | Float16, Int8, 4-bit (CoreML 8+ / iOS 17+) supported via `coremltools` | HIGH |
| Max model size practical | <100MB is comfortable; 50–80MB loads in ~200ms on A15+ | MEDIUM |
| Inference latency (A15) | Single-pass encoder networks: 50–200ms for ~10M parameters Float16 | MEDIUM |
| On-device training | `MLUpdateTask` for on-device fine-tuning (classification layers only) | HIGH |
| Stateful models | Supported in CoreML 8 (iOS 18) | MEDIUM |

**Verify before implementation:** Exact latency benchmarks for SMPL-class encoder models (~10–30M parameters) on A14/A15 should be measured during the spike. Training-data estimates have ±2x uncertainty.

---

### 1.4 RealityKit

**Not recommended for measurement engine v1.** RealityKit is a scene-graph 3D rendering framework. It is valuable for displaying an AR mesh overlay of the fitted body model on screen, but it contributes nothing to measurement computation. Adding it in the measurement path introduces complexity for no accuracy gain. It can be revisited for visualization only.

---

## 2. Parametric Body Models

### Decision Framework

For on-device CoreML deployment, the model must satisfy:
1. Commercial-use license (or a clear path to one)
2. Convertible to CoreML via `coremltools` (PyTorch or ONNX source)
3. On-device size < ~150MB (unquantized Float32) / < ~75MB (Float16)
4. Takes 2D keypoints (or image features) as input → outputs body shape parameters
5. Shape parameters map to a 3D mesh from which circumferences can be extracted

---

### 2.1 SMPL (Skinned Multi-Person Linear Model)

| Property | Value | Confidence |
|----------|-------|------------|
| Source | MPI-IS / Max Planck Institute | HIGH |
| Architecture | Linear blend skinning; shape space = 10 PCA coefficients (β), pose space = 72 parameters (θ) | HIGH |
| Vertices | 6,890 vertices, 13,776 faces | HIGH |
| Gender models | Male, female, neutral — separate `.pkl` files | HIGH |
| License | Research-only (academic, non-commercial) for the model weights | HIGH |
| Commercial license | Available via separate commercial agreement with MPI-IS — not free, contact required | HIGH |
| Model file size (weights) | ~50MB per gender variant (.pkl); after CoreML conversion + Float16 quantization ~15–25MB | MEDIUM |
| PyTorch implementation | Multiple: `smplx` library (official), `pytorch3d` compatible | HIGH |

**Commercial license blocker:** SMPL model weights are licensed for non-commercial research only. To use in a commercial app you must negotiate a commercial license with MPI-IS. This is a business deal, not a quick form submission. **Flag as a critical procurement item for the spike.** Without a license agreement, using SMPL in a commercial App Store app is a terms violation.

---

### 2.2 SMPL-X (SMPL with Expression)

| Property | Value | Confidence |
|----------|-------|------------|
| Source | MPI-IS (same group as SMPL) | HIGH |
| Architecture | Extends SMPL with face/hands; shape space = 10 β, body pose = 63 params, face + hands separate | HIGH |
| Vertices | 10,475 vertices (hands + face included) | HIGH |
| License | Same as SMPL — research-only; commercial license negotiation required | HIGH |
| Advantage over SMPL | Richer mesh (hands, face) — not needed for body circumference measurement | HIGH |
| On-device recommendation | SMPL is sufficient for circumference measurement; SMPL-X adds 50% more vertices with no benefit for this use case | HIGH |

**Recommendation:** If you go the SMPL family route, use plain SMPL (not SMPL-X) for on-device inference. Lower vertex count, same torso accuracy.

---

### 2.3 STAR (Sparse Trained Articulated Human Body Regressor)

| Property | Value | Confidence |
|----------|-------|------------|
| Source | MPI-IS (same group) | HIGH |
| Architecture | Sparse pose correctives; fewer parameters than SMPL; 6,890 vertices same mesh topology | HIGH |
| License | Non-commercial research; same restriction as SMPL | HIGH |
| Advantage | Better pose correctives → slightly more accurate deformation at extreme poses | MEDIUM |
| On-device difference | Similar size to SMPL; same commercial license issue | HIGH |

**Not recommended over SMPL for v1.** Same license problem. Marginal accuracy improvement in extreme poses is irrelevant for a standing-only scan flow.

---

### 2.4 SHAPY (Shape and Pose Estimation)

| Property | Value | Confidence |
|----------|-------|------------|
| Source | MPI-IS (Choutas et al., 2022) | HIGH |
| What it does | Predicts SMPL-X body shape + pose from a single image; specifically targets body measurements (circumferences) | HIGH |
| Architecture | ResNet50/HRNet encoder → SMPL-X parameter regressor | HIGH |
| License | Non-commercial research (code: CC BY-NC-SA 4.0) | HIGH |
| Commercial use | Explicitly non-commercial | HIGH |
| Model size | Full model (encoder + regressor) ~100–200MB unquantized | MEDIUM |
| Key advantage | Directly trained on body measurement data (Caesar dataset circumferences) — purpose-built for what we need | HIGH |
| Key disadvantage | Non-commercial license + depends on SMPL-X (also non-commercial) — **double license blocker** | HIGH |

**Hard no for commercial use.** SHAPY is academically the best match but CC BY-NC-SA code + non-commercial SMPL-X weights mean it cannot be used in a commercial app without dual license negotiations. High research value; zero commercial viability without expensive agreements.

---

### 2.5 PIXIE (Expressive Body Estimation)

| Property | Value | Confidence |
|----------|-------|------------|
| Source | Feng et al., 2021 (Carnegie Mellon) | HIGH |
| What it does | Whole-body (face, hands, body) estimation from single image → SMPL-X params | HIGH |
| License | Non-commercial research (code on GitHub is research-grade) | HIGH |
| On-device viability | Large model; PyTorch inference requires multi-stage pipeline — challenging CoreML conversion | MEDIUM |
| Recommendation | Avoid — non-commercial, complex pipeline, no clear CoreML path | HIGH |

---

### 2.6 4D-Humans (HMR2.0 / ProHMR)

| Property | Value | Confidence |
|----------|-------|------------|
| Source | Shubham Goel et al., 2023 (UC Berkeley / CMU) | HIGH |
| Architecture | ViT-H backbone (Vision Transformer) + SMPL parameter head | HIGH |
| License | Code: Apache 2.0 (commercial-friendly) | HIGH |
| Model weights | Dependent on SMPL model weights for the decoder — SMPL weights retain non-commercial license even if wrapper code is Apache 2.0 | HIGH |
| On-device viability | ViT-H encoder: ~600M parameters — extremely large for mobile inference even quantized | HIGH |
| Recommendation | The ViT-H backbone is impractical on-device. Smaller backbones (ViT-B) have been explored but are not official 4D-Humans releases | HIGH |

**Mixed verdict.** The Apache 2.0 code license is attractive, but the SMPL weights dependency re-introduces the non-commercial restriction, and the ViT-H backbone is too large for on-device inference (1–5s latency even on A17 Pro). Not recommended for v1.

---

### 2.7 CLIFF / SPEC / PyMAF-X

| Property | Value | Confidence |
|----------|-------|------------|
| Category | SMPL-based single-image regressors | HIGH |
| License | Typically non-commercial (dependent on SMPL weights) | HIGH |
| On-device | Same weight-size and SMPL-dependency issues as above | HIGH |
| Recommendation | Avoid — same commercial blocker | HIGH |

---

### 2.8 Recommended Approach: MobileHMR / Lightweight SMPL Regressor

Given the commercial-license constraint and on-device inference requirement, the recommended path is:

**Build or adapt a lightweight custom regressor that uses SMPL-compatible mesh topology but is trained on data you own or data with permissive licenses, without using SMPL model weights directly.**

Alternatively, evaluate the **SMPLer-X lightweight variants** or investigate whether the SMPL commercial license cost is viable.

The cleanest viable paths in priority order:

1. **Negotiate the SMPL commercial license with MPI-IS early in the spike.** MPI-IS does issue commercial licenses; cost is typically a one-time fee or revenue share for small companies. If the cost is manageable, SMPL + a lightweight MobileNet-based regressor is the most proven path.

2. **Use an open-mesh approach with a custom regressor.** The SMPL mesh topology itself is not patented — what's licensed is the specific linear blend skinning weights. You can create a simplified parametric model with fewer shape dimensions trained on open datasets (e.g., Caesar dataset, which has a research license).

3. **Investigate `body-models` by `nghorbani` (GitHub: `nghorbani/body_visualizer`).** Some PyTorch implementations of SMPL-compatible models are published under MIT or Apache licenses by community authors. These may use the same mesh topology with independently trained parameters. **LOW confidence — verify license before use.**

**For the spike phase:** Use SMPL under research license (acceptable for internal testing/development), validate the accuracy approach works, then secure the commercial license before App Store submission.

---

### Body Model Summary Table

| Model | License (Commercial?) | On-Device Size | Accuracy Fit | Recommendation |
|-------|-----------------------|----------------|--------------|----------------|
| SMPL | Non-commercial (license available) | ~20MB Float16 | Good for torso circumferences | Use in spike; negotiate commercial license |
| SMPL-X | Non-commercial (license available) | ~30MB Float16 | Overkill for this use case | Skip — use SMPL instead |
| STAR | Non-commercial (license available) | ~20MB Float16 | Marginally better poses | Skip — same license cost as SMPL for no benefit |
| SHAPY | CC BY-NC-SA (non-commercial, hard no) | ~150MB Float16 | Purpose-built for measurement | Cannot use commercially |
| PIXIE | Non-commercial | ~200MB+ Float16 | Whole-body but complex | Cannot use commercially |
| 4D-Humans / HMR2.0 | Apache 2.0 code / SMPL weights non-commercial | 600M+ params — impractical | High quality but too large | Not viable on-device |
| Custom lightweight regressor | Own — commercial ok | 10–40MB | Requires training investment | Spike-gate: attempt if SMPL license costly |

---

## 3. Body Mesh Measurement Extraction

### 3.1 Circumference from SMPL Mesh

Once a fitted SMPL mesh is available (6,890 vertices in 3D metric space), circumferences are extracted by:

1. **Landmark-based plane slicing:** Define anatomical planes (e.g., waist = horizontal plane at L4/L5 level, hip = plane at greater trochanter, chest = plane at nipple level). Slice the mesh with the plane to get a cross-sectional polygon.
2. **Perimeter calculation:** Sum the edge lengths of the cross-sectional polygon.
3. **Scaling:** If SMPL shape parameters are fit with correct height normalization, the mesh is already in metric space (meters). Multiply perimeter by 100 for cm.

**Open-source reference implementations:**
- `body_measurements` function in `smplx` Python library (official MPI-IS repo) — reference implementation for research
- `caesar-fitting` and related tools in the body measurement research community
- The SHAPY codebase contains the most complete measurement extraction pipeline (despite non-commercial license for the full model)

**Vertex index mapping (SMPL):** The body measurement research community has established vertex index lists that correspond to anatomical landmarks. These are widely published in SMPL-related papers and can be extracted from the SMPL documentation without using the model weights. This is high-value reference material for the spike.

**Confidence:** HIGH for the method. MEDIUM for specific vertex indices (verify against SMPL joint regressor documentation).

---

### 3.2 CoreML Inference Pipeline

The on-device pipeline has two stages:

**Stage 1 — Pose estimation (input: camera frame):**
```
CameraFrame → VNDetectHumanBodyPoseRequest → VNHumanBodyPose3DObservation
→ 19 joint positions (3D, metric) + height estimate
```

**Stage 2 — Shape fitting (input: keypoints + user height):**
```
[19 joint positions, height scalar, optional: silhouette features]
→ CoreML SMPL Regressor (MobileNet/ResNet encoder → shape β vector [10 dims])
→ SMPL decoder (analytical, runs in Swift/C++) → 6,890 vertex mesh
→ Plane slicing → circumference values
```

The SMPL decoder itself is analytical (matrix multiply + linear blend skinning) and can be implemented in Swift or Accelerate framework without CoreML — only the encoder (image/keypoint → shape params) needs CoreML.

---

## 4. RN/Expo Bridge Options

### 4.1 Expo Modules API (Recommended)

| Property | Value | Confidence |
|----------|-------|------------|
| Package | `expo-modules-core` (already a transitive dep in this project via Expo) | HIGH |
| Language | Swift + Kotlin (iOS + Android, though iOS-only here) | HIGH |
| New Architecture | Native support; no JSI bridge boilerplate required | HIGH |
| Setup | `npx create-expo-module` scaffolds the Swift/TypeScript module structure | HIGH |
| Async calls | Swift async functions → JS Promises, built-in | HIGH |
| Data transfer | Typed records (structs), Uint8Array for binary data, native arrays | HIGH |
| Recommendation | **Primary bridge for all CoreML / Vision calls** | HIGH |

**Why Expo Modules over a raw RN native module:** The project already uses Expo SDK 54 with New Architecture. Expo Modules API is the canonical "New Architecture native module" approach endorsed by both Expo and Meta. It generates type-safe Swift-to-TypeScript bindings, eliminates JSI boilerplate, and integrates cleanly into the Expo managed/bare workflow. Raw TurboModule/JSI modules are lower-level and require more boilerplate without meaningful performance gain for an inference use case where latency is dominated by CoreML, not bridge overhead.

**Performance note:** CoreML inference (50–200ms) dominates. Bridge overhead for a single async call returning a float array is <1ms. Optimize the CoreML model, not the bridge.

---

### 4.2 VisionCamera Frame Processors (Alternative for real-time path)

| Property | Value | Confidence |
|----------|-------|------------|
| Package | `react-native-vision-camera` | HIGH |
| Version (at training cutoff Aug 2025) | v4.x (v4.5+ series) | MEDIUM — verify current version |
| RN New Architecture | v4+ supports New Architecture; v3 does not | HIGH |
| Frame processors | JSI-native worklets that run on a dedicated frame thread; can call CoreML via Swift plugin | HIGH |
| Use case here | Real-time body-skeleton overlay during the "hold still" capture guidance phase | HIGH |
| Integration complexity | Higher than Expo Modules — requires VisionCamera plugin pattern for native inference | MEDIUM |
| Expo compatibility | Works with Expo bare workflow; not compatible with Expo Go | HIGH |

**Recommendation:** Use VisionCamera for the live camera preview + real-time guidance overlay (pose bounding box, "move closer", "turn sideways" indicators). Use Expo Modules for the discrete measurement inference call on captured frames. Do not run full SMPL inference per-frame — run it once per scan on a selected high-quality frame.

---

### 4.3 What NOT to Use for the Bridge

| Option | Why Not |
|--------|---------|
| Raw TurboModule / JSI | More boilerplate than Expo Modules; no benefit for this use case |
| Legacy Bridge (NativeModules) | Old architecture, deprecated path; project has New Architecture enabled |
| expo-camera frame callbacks | `expo-camera` does not support frame-level pixel access for ML inference — it is a capture-only API |
| JavaScript-only CoreML wrapper | No JavaScript runtime has access to CoreML directly; native code is required |

---

## 5. Camera + ARKit Access from Expo

### 5.1 react-native-vision-camera (Recommended for camera)

| Property | Value | Confidence |
|----------|-------|------------|
| Package | `react-native-vision-camera` | HIGH |
| Current version | v4.x (verify exact version before installing; v4.5+ as of Aug 2025) | MEDIUM |
| License | MIT | HIGH |
| iOS access | Full AVFoundation access, configurable exposure/focus/zoom | HIGH |
| Frame processors | JSI worklets on frame thread, plugin API for native inference | HIGH |
| Photo capture | `camera.takePhoto()` returns full-res HEIF/JPEG with metadata | HIGH |
| Expo compatibility | Expo bare workflow only (not Expo Go; requires prebuild) | HIGH |
| New Architecture | v4+ supports New Architecture with JSI | HIGH |
| ARKit integration | Does NOT integrate ARKit session; VisionCamera is AVFoundation-only | HIGH |
| Recommendation | Use for camera preview and frame-level access during scan flow | HIGH |

---

### 5.2 expo-camera

| Property | Value | Confidence |
|----------|-------|------------|
| Package | `expo-camera` | HIGH |
| What it provides | CameraView React component; photo/video capture; barcode scanning | HIGH |
| Frame-level access | None (no pixel buffer / frame processor support) | HIGH |
| ML integration | Not possible at frame level — capture-only | HIGH |
| Use case here | Insufficient for real-time pose guidance or frame analysis | HIGH |
| Recommendation | Do NOT use expo-camera for the measurement engine. Use VisionCamera. | HIGH |

---

### 5.3 ARKit-specific RN packages

| Package | Status | Recommendation |
|---------|--------|----------------|
| `react-native-arkit` | Unmaintained (last commit 2019) | Avoid |
| `expo-three` + `react-three-fiber` | Web GL rendering (not ARKit); complex port | Avoid for measurement |
| `viro-react` | AR/VR framework; iOS ARKit wrapper; active but large | Only if 3D AR overlay is a hard requirement |
| Custom Expo Module + ARKit | Write your own Swift ARKit session → Expo Module bridge | Recommended approach if ARKit needed |

**Recommendation:** For the spike, ARKit is not required. Use `VNHumanBodyPose3DObservation` from Vision framework (no ARKit session needed, simpler). If live AR overlay of the fitted mesh is wanted for marketing/UX, build a minimal Expo Module wrapping `ARBodyTrackingConfiguration` in v1.1.

---

### 5.4 Expo Prebuild Requirement

**Critical:** Using `react-native-vision-camera` requires `npx expo prebuild` (generates the native iOS/Xcode project). The current `app.json` does not include VisionCamera's plugin entry. This means:
- Development: use `expo run:ios` (not Expo Go)
- CI/distribution: EAS Build (not Expo Snack or Expo Go)
- `app.json` must add `react-native-vision-camera` plugin configuration and camera permission descriptions

---

## 6. Complete Recommended Stack (Measurement Engine)

### Core Measurement Path

| Layer | Choice | Version | License | Confidence |
|-------|--------|---------|---------|------------|
| Pose extraction | Apple Vision `VNHumanBodyPose3DObservation` | iOS 17+ SDK | Apple System (free) | HIGH |
| Camera frames | `react-native-vision-camera` | v4.x (verify) | MIT | HIGH |
| Body shape model | SMPL (research license for spike; negotiate commercial) | 2023 release | Non-commercial / commercial (negotiate) | HIGH |
| Shape regressor | Custom lightweight encoder (MobileNetV3 / EfficientNet-Lite) trained to map keypoints → SMPL β | train from scratch | Own / commercial | MEDIUM |
| CoreML conversion | `coremltools` 8.x | pip installable | BSD-3-Clause | HIGH |
| Native bridge | Expo Modules API | expo-modules-core (in project already) | MIT | HIGH |
| SMPL decoder | Swift implementation of LBS (write yourself ~300 lines) | n/a | Own | HIGH |
| Measurement extraction | Swift plane-slice + perimeter calculation | n/a | Own | HIGH |
| Real-time guidance | VisionCamera frame processor + `VNDetectHumanBodyPoseRequest` | same | MIT + Apple System | HIGH |

### Supporting Tools (Spike / Development)

| Tool | Purpose | License |
|------|---------|---------|
| `coremltools` (Python) | Convert PyTorch model to `.mlpackage` | BSD-3-Clause |
| `smplx` (Python) | Reference SMPL model; generate training data; verify vertex indices | MIT code; SMPL weights non-commercial |
| `pytorch3d` (Python) | Mesh differentiable rendering for training | BSD-3-Clause |
| `numpy`, `scipy` | Data processing during spike | BSD |
| Xcode 16 + Instruments | Profile CoreML inference; find latency | Apple (free with Apple Developer account) |

---

## 7. What NOT to Use

### Body Models to Avoid

| Model / Tool | Reason to Avoid |
|-------------|-----------------|
| SHAPY | CC BY-NC-SA non-commercial license; cannot ship in App Store commercially |
| PIXIE | Non-commercial; PyTorch pipeline too large for CoreML conversion at inference speed |
| 4D-Humans / HMR2.0 | ViT-H backbone is 600M+ params — 2-5s latency even on A17 Pro; SMPL weights still non-commercial |
| SMPL-X for measurement | Adds 3,585 unnecessary vertices (hands/face) vs SMPL — more inference cost, same torso accuracy |
| Any model requiring internet access | Privacy stance is on-device only; any model that calls an API is disqualifying |

### iOS APIs to Avoid

| API | Reason |
|-----|--------|
| `ARBodyTrackingConfiguration` in v1 | Requires active ARSession live feed; overkill for a still-capture scan flow; adds complexity without accuracy benefit |
| LiDAR (`ARMeshAnchor`, `ARWorldMap`) | Out of scope per PROJECT.md — cuts addressable market to ~30% of iPhones |
| `VNHumanBodyPose3DObservation` as sole measurement source | Skeleton joints alone cannot determine circumferences — must feed a shape model |

### RN Libraries to Avoid

| Library | Reason |
|---------|--------|
| `expo-camera` | No frame-level pixel access; ML inference impossible |
| `react-native-arkit` | Unmaintained since 2019 |
| `expo-three` / `react-three-fiber` for measurement | WebGL renderer, not a measurement tool |
| Any pre-built "body measurement SDK" (3DLOOK, Bodygee, Sizer) | Rejected in PROJECT.md — pre-revenue economics make per-scan fees nonviable |

---

## 8. Installation Reference

```bash
# Camera (requires expo prebuild after adding)
pnpm add react-native-vision-camera

# Expo Modules scaffolding (for custom native module)
pnpm exec create-expo-module@latest measurement-engine --local

# CoreML conversion tools (Python, development machine only)
pip install coremltools==8.x torch torchvision smplx

# No additional npm packages needed for Vision/CoreML — these are iOS system frameworks
```

**app.json additions required:**
```json
{
  "plugins": [
    ["react-native-vision-camera", {
      "cameraPermissionText": "Sik AI needs camera access to measure your body.",
      "enableFrameProcessors": true
    }]
  ],
  "ios": {
    "infoPlist": {
      "NSCameraUsageDescription": "Sik AI needs camera access to measure your body."
    }
  }
}
```

---

## 9. Confidence Summary

| Area | Confidence | Basis | Verify Before |
|------|-----------|-------|---------------|
| Apple Vision 3D body pose API | HIGH | Apple SDK docs (iOS 17 release notes) | Implementation |
| ARKit capabilities | HIGH | Apple ARKit docs | Implementation |
| CoreML conversion pipeline | HIGH | coremltools official docs + WWDC sessions | Implementation |
| SMPL / SMPL-X model architecture | HIGH | Published papers + official MPI-IS site | — |
| SMPL commercial license process | MEDIUM | Known from academic ecosystem; terms may have changed | Before spike begins |
| SMPL on-device size/latency after quantization | MEDIUM | Derived from paper benchmarks + CoreML general experience | During spike (measure) |
| VisionCamera v4 New Architecture compatibility | MEDIUM | Training data cutoff Aug 2025; check current npm version | Before installing |
| 4D-Humans / SMPL weight license interaction | HIGH | Confirmed: Apache 2.0 code does not override SMPL weights license | — |
| SHAPY commercial viability | HIGH | CC BY-NC-SA is unambiguous | — |
| Circumference extraction from SMPL mesh | HIGH | Established method in body measurement literature | — |
| Custom encoder training feasibility | LOW | Depends on available training data with body measurements + expertise | Spike feasibility gate |

---

## 10. Open Procurement / Legal Items

These must be resolved before v1 App Store submission (not before the spike):

1. **SMPL commercial license:** Contact MPI-IS (mpii-smpl@tue.mpg.de or via the SMPL website). Expect several weeks for negotiation. Begin outreach at spike start, not after.

2. **Training data for shape regressor:** The shape regressor needs training examples of (image or keypoints) → SMPL shape parameters. Options:
   - **Synthetic data** from a SMPL body renderer (generates legally owned data, no real humans)
   - **Caesar dataset** (3D body scans, research license, contact required)
   - **AGORA dataset** (synthetic + real; research license from MPI-IS)
   - **Self-collected ground truth** (scan team members with a tape measure; small but legally clean)
   The spike should clarify which combination is sufficient.

3. **App Store camera permission review:** Apple requires clear UI disclosure for camera use in body scanning apps. Health-adjacent apps may receive elevated review scrutiny. Not a blocker but worth noting for the review prep phase.

---

## Sources

- Apple Vision framework documentation (https://developer.apple.com/documentation/vision) — accessed via WebFetch; page content not returned; knowledge from training data (Aug 2025 cutoff)
- Apple ARKit documentation (https://developer.apple.com/documentation/arkit) — same note
- CoreML documentation (https://developer.apple.com/documentation/coreml) — same note
- SMPL paper: Loper et al., "SMPL: A Skinned Multi-Person Linear Model" (SIGGRAPH Asia 2015)
- SMPL-X paper: Pavlakos et al., "Expressive Body Capture" (CVPR 2019)
- SHAPY paper: Choutas et al., "Accurate 3D Body Shape Regression..." (CVPR 2022)
- 4D-Humans / HMR2.0 paper: Goel et al., "Humans in 4D" (ICCV 2023)
- react-native-vision-camera: mrousavy/react-native-vision-camera (GitHub) — version current to Aug 2025
- Expo Modules API: docs.expo.dev/modules — version current to Aug 2025
- All version numbers should be verified against npm/GitHub at time of implementation
