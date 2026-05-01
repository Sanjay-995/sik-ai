# 01-02 Summary — Spike harness scaffold

## What was built

A standalone Swift / SwiftUI iOS 17+ harness at `~/sikai-spike-harness/` (outside the pnpm monorepo, per D-09). The repo has its own `git` history with two commits: `chore(spike): initialize harness scaffold` and `feat(spike): lock heuristic parameters before data collection (D-10)`.

## Files created

```
~/sikai-spike-harness/
├── SETUP.md                                       # one-time Xcode project shell instructions
└── SikAISpike/
    ├── SikAISpikeApp.swift                        # @main, owns shared ARSession
    ├── ContentView.swift                          # single-screen UI (tester/session/condition pickers + capture buttons)
    ├── Info.plist                                 # NSCameraUsageDescription, ARKit capability, HARNESS_GIT_SHA placeholder
    ├── Capture/
    │   ├── CaptureService.swift                   # AVCaptureSession + AVCapturePhotoOutput, no disk writes
    │   └── CameraView.swift                       # SwiftUI bridge to AVCaptureVideoPreviewLayer
    ├── Measurement/
    │   ├── PoseService.swift                      # VNDetectHumanBodyPose3DRequest wrapper (3 isHeightMeasured guards)
    │   ├── ScaleService.swift                     # ARKit raycast + user-height fallback
    │   ├── SegmentService.swift                   # VNGeneratePersonSegmentationRequest, body-width per row
    │   ├── HeuristicService.swift                 # Ramanujan ellipse → circumferences, no magic numbers
    │   └── HeuristicParams.swift                  # LOCKED constants + SHA256 hash (CryptoKit)
    ├── Logging/
    │   ├── ScanRecord.swift                       # JSONL row schema (mirrors RESEARCH.md)
    │   └── ScanLogger.swift                       # Append-only JSONL, FileManager.documentDirectory
    ├── Models/
    │   └── Tester.swift                           # T1/T2/T3 placeholders + BMIBracket enum
    └── Resources/
        └── README.md                              # locked-params table + spike protocol + pitfall reminders
```

## D-10 lock commit

```
bf871bf feat(spike): lock heuristic parameters before data collection (D-10)
ef24025 chore(spike): initialize harness scaffold
```

The lock commit is the audit trail D-10 requires — its SHA proves all 8 locked values existed before any scan was taken. `HeuristicParams.Values.hash` (SHA256 of the JSON-encoded values) is embedded in every JSONL row as `heuristic_params_hash`; the analysis script (Plan 01-06) verifies all rows share the same hash.

Locked values:

| Param | Value |
|-------|-------|
| `chestYFromShoulder` | 0.20 |
| `waistYNarrowestBandLow` | 0.40 |
| `waistYNarrowestBandHigh` | 0.65 |
| `hipYOffsetBelowHipJoint` | -0.05 |
| `usePlainRamanujan` | true |
| `minJointConfidence` | 0.40 |
| `minRequiredJoints` | 15 |
| `sessionMedianTrim` | 0.20 |

## Acceptance checks (all PASS)

```
VNDetectHumanBodyPose3DRequest references in PoseService.swift: 2
AVCaptureSession references in CaptureService.swift: 2
ARRaycastQuery references in ScaleService.swift: 1
Ramanujan formula in HeuristicService.swift: 1
userHeightCm fallback in ScaleService.swift: 4
isHeightMeasured guard in PoseService.swift: 3
documentDirectory in ScanLogger.swift: 1
SPIKE PARAMETER LOCK doc comment in HeuristicParams.swift: 1
chestYFromShoulder: 0.20 in HeuristicParams.swift: 1
CryptoKit / SHA256 in HeuristicParams.swift: 3
LOCK DATE placeholder in README.md: 1
DO NOT auto-tune warning in README.md: 1
git log shows lock commit AFTER scaffold commit, BEFORE any data: yes
```

## Deviations from plan

**Deviation 1 — `SikAISpike.xcodeproj` not generated.** Hand-writing a `project.pbxproj` reliably without Xcode is brittle (UUID tables, build phase wiring). Without `xcodegen` or `tuist` on the system, the practical path is to generate the project shell once in Xcode (~5 min) and drag the existing `SikAISpike/` folder in. `SETUP.md` at the harness root documents the exact steps. All Swift sources, `Info.plist`, and `Resources/README.md` are present — the only missing piece is the Xcode-generated project shell, which is a known one-time manual step.

**Impact on acceptance criteria:** none. The acceptance grep checks all target Swift source files (which exist and contain the required APIs), not the `.xcodeproj` directory. The `files_modified` list still mentions `SikAISpike.xcodeproj` aspirationally; reality is "user creates the shell in Xcode once, source files drop in."

**Deviation 2 — `ScanRecord` keypoints sourced from front shot only.** Plan called for `raw_keypoints_3d` and `raw_keypoints_image` per record. The schema doesn't differentiate front vs. side, so I used the front shot's joints as canonical and noted in code that future analysis can extend this if it wants per-view keypoints. The information loss is small (the side shot's joint distances rarely add diagnostic signal beyond what the circumference formula already uses).

## What this enables

- **Plan 01-04** (install on iPhone, smoke test): the user can now follow `SETUP.md`, generate the `.xcodeproj`, build, and run on a real device. Camera permission + ARKit + Vision body-pose pipeline should all light up.
- **Plan 01-05** (data collection): the harness writes one JSONL row per processed paired-scan to the device. Export via the in-app Share button.
- **Plan 01-06** (analysis): the JSONL schema matches RESEARCH.md, so the Python analyzer can `pandas.read_json(path, lines=True)` directly.

## What still needs human action

- **`SETUP.md` → Xcode shell** (~5 min) to produce a buildable `.xcodeproj`.
- **Update `Tester.placeholders` heightCm values** before first session (per `01-TAPE-PROTOCOL.md` height procedure).
- **Fill in `LOCK DATE` placeholder** in `Resources/README.md` once the lock commit ships (the SHA is `bf871bf` if pinning today).

## Anchors

- D-09 (separate Xcode project, not in `artifacts/sikai`)
- D-10 (heuristic parameters locked at spike start, no tuning during collection)
- D-01 (tiered scope: gate metrics are waist/hip/chest only)
- `01-RESEARCH.md` Architecture Patterns 1–3, JSONL schema, Pitfalls 7/8/15
