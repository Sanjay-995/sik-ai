# 01-01 Summary — Pre-spike checklist artifacts

## What was built

Two markdown artifacts in `.planning/phases/01-feasibility-spike/` that gate harness build (Plan 01-02) and data collection (Plan 01-05):

- **`01-VISIONCAMERA-COMPAT-NOTE.md`** (D-12.1) — locks `react-native-vision-camera` v5 as the Phase 2 target, marks v4 as archived, resolves the ROADMAP SC#1 vs. D-09 textual contradiction, and documents the Expo SDK 54 + Nitro Modules + `npx expo prebuild` requirements that Phase 2 will inherit.
- **`01-TAPE-PROTOCOL.md`** (D-12.2) — ISO 8559-1 sourced anatomical landmark definitions for waist (natural waist via side-bend), hip (greater trochanter level), and chest (axilla / fullest chest); 3-take averaging procedure; partner-assisted preference; height measurement procedure (wall + tape, no shoes); same-session 5-rapid-paired-scan sub-test; JSONL provenance fields (`_taken_by`, `_takes_averaged`, `clothing_label`, `_delay_minutes`); and the per-session checklist.

## Acceptance checks (all PASS)

```
01-VISIONCAMERA-COMPAT-NOTE.md
  v5 references: 12
  D-09 referenced: ok
  SC#1 contradiction documented: ok
  Expo SDK 54 referenced: ok
  Nitro Modules referenced: ok
  expo prebuild referenced: ok

01-TAPE-PROTOCOL.md
  ISO 8559: ok
  3 consecutive: ok
  greater trochanters: ok
  _taken_by JSONL field: ok
  _takes_averaged JSONL field: ok
  total lines: 112
```

## Why these matter

- **VisionCamera note:** without it, Phase 2 plans referencing "v4" stay stale and the SC#1 wording remains ambiguous. The note lets Phase 2 planning kick off the moment Phase 1's gate decision lands, with no compat homework left.
- **Tape protocol:** landmark drift between testers (RESEARCH.md Pitfall #15) produces phantom variance that looks like model error. Locking landmark definitions and the 3-take procedure before the dataset starts means inter-tester comparisons are valid.

## Anchors

- D-09 (native AVFoundation only in spike)
- D-12.1, D-12.2 (pre-spike checklist)
- ROADMAP SC#1 (amended to reference this note)
- `01-RESEARCH.md` Pitfalls #1, #7, #15; Open Question #5
