# Tape-Measure Ground-Truth Protocol (D-12.2)

> **Purpose.** Tape measurements are the external truth that the spike harness output is compared against. They must be taken with **exact anatomical landmark reproducibility** across all testers and all sessions. Landmark ambiguity (RESEARCH.md Pitfall #15) — for example, "natural waist" vs. "belly button" — produces phantom variance that **looks like model error but is actually measurement error**. This protocol standardizes the method so inter-tester and inter-session results can be trusted.
>
> Source standard: **ISO 8559-1:2017** (anthropometric definitions for garment construction). Where ISO 8559-1 is silent, the fitness-industry convention is used and noted.

---

## Equipment

- **Tape measure:** cm-marked, **non-elastic** (cloth or fiberglass tailor tape; not a metal/spring tape that compresses tissue), fitness/tailor grade, ≤1 cm graduation.
- **Measurer:** Same person across all of a tester's sessions where possible. **Partner-assisted measurement is preferred.** Self-measurement is allowed only when no partner is available, but it MUST be flagged in the JSONL row as `_taken_by: self`.
- **Wall + pencil + ruler** (height measurement only — first session per tester).

---

## Landmark definitions (ISO 8559-1 sourced)

The three gate measurements for the spike are **waist**, **hip**, and **chest**. Each must be located the same way every time.

### Waist (Natural Waist)

- **Anatomical landmark.** The smallest horizontal circumference between the lower margin of the last rib and the top of the iliac crest — the "natural waist." Typically 2–4 cm above the navel, but the navel is **not** the landmark.
- **How to find it.** The tester bends sideways at the torso; the natural fold at the side is the natural waist level. Confirm by feeling for the narrowest point while the tester stands upright, arms relaxed.
- **Tape position.** Horizontal (parallel to the floor), snug against the skin or thin athletic wear, **not compressing tissue**.
- **Breathing instruction.** Tester breathes out gently and **does not hold breath** during the measurement. The tape is read at natural rest, not at full exhale and not at full inhale.

### Hip (Maximum Hip / Buttock Circumference)

- **Anatomical landmark.** Maximum horizontal circumference around the hips and buttocks — approximately at the level of the **greater trochanters** (the bony protrusions on the outer sides of the hips). For most adults this is also the level of the fullest part of the buttocks.
- **How to find it.** Run the tape around the hips while the tester stands upright with feet together; slide it up and down to find the **largest** circumference. Take the reading at that level.
- **Tape position.** Horizontal, snug, without indenting tissue.

### Chest (Bust / Chest Circumference)

- **Anatomical landmark.** Maximum horizontal circumference at the **fullest part of the chest, under the arms**. For male testers this is typically at axilla (armpit) level. For female testers this is at bust-point level (the fullest point of the breasts).
- **How to find it.** The tape passes under the arms across the upper back and across the fullest part of the chest. Arms are relaxed at the sides during the reading (not raised).
- **Tape position.** Horizontal, snug, not binding.

---

## Measurement procedure

1. **Clothing.** The tester wears **the same clothing as during the scan** — tight athletic wear, or underwear / sports bra. Loose clothing invalidates the measurement.
2. **Posture.** Stand upright, feet together, arms slightly away from body (not clamped against the sides), breathing relaxed.
3. **Three takes.** Take **3 consecutive measurements** per landmark **without looking at the previous reading** between takes. Looking at the previous reading biases the next one toward agreement.
4. **Recording.** Record all 3 values; compute the average; record the average as `tape_measurements_cm.{site}` in the JSONL row.
5. **Provenance fields** in the JSONL row:
   - `_takes_averaged: 3`
   - `_taken_by: partner_assisted` **or** `_taken_by: self`
6. **Timing.** Tape measurements are taken **at the start of each session**, before any scans. This prevents the scan output from biasing the tape reading.

---

## Height measurement (one-time per tester, per RESEARCH.md Pitfall 7)

Self-reported height carries a known bias (people round up). Height feeds the `userHeight` fallback in `ScaleService` when ARKit world tracking fails, so a 2 cm self-report bias propagates directly into circumference scaling error.

- **When.** At cohort intake (once per tester, before any scan sessions). Re-use the same value for all subsequent sessions.
- **How.**
  1. Tester stands against a flat wall, **without shoes**, heels touching the wall.
  2. Mark the top of the head with a pencil on the wall.
  3. Measure from the floor to the mark with a ruler or non-elastic tape.
- **Where it's stored.** `Tester.swift` field `heightCm: Double`. Comment in source: `// physically measured per 01-TAPE-PROTOCOL.md — NOT self-reported`.

---

## Same-session sub-test procedure (5 rapid paired scans + tape)

At the start of each session, before the main paired scans:

1. Take the 3-take tape measurements for waist, hip, and chest as defined above. Record the averages.
2. Run **5 rapid paired scans in immediate succession** (front + side, repeat 5 times, no break between pairs).
3. The 5 paired scans + the tape readings together form the same-session reproducibility sample for that session.

This sub-test isolates **same-session** test-retest variance from **inter-session** variance — both are reported in the go/no-go analysis (Plan 01-06) but they answer different questions.

---

## Failure modes and protocol violations (document, do NOT exclude)

Per D-08 ("document failures, don't drop samples"):

- **Self-measure** instead of partner-assisted: flag `_taken_by: self` in JSONL.
- **Loose / baggy clothing** during a tape measurement: flag `clothing_label: loose_baggy` in that JSONL row.
- **Tape taken more than 30 minutes after the scan session**: flag `_delay_minutes: N`.
- **Fewer than 3 takes** (e.g., tester time-constrained): flag `_takes_averaged: 1` or `_takes_averaged: 2`. The row stays in the dataset.

These rows are kept in the dataset and analyzed as documented failure-mode samples; they are **not** silently excluded.

---

## Per-session checklist (print or keep in phone notes)

- [ ] Tape measure cm-marked and non-elastic (verified before session start)
- [ ] Tester in tight athletic wear / underwear (no loose layers)
- [ ] Waist: natural-waist landmark located by side-bend, breathing relaxed
- [ ] Hip: maximum circumference at greater-trochanter level
- [ ] Chest: fullest circumference under arms, arms relaxed
- [ ] **3 takes per landmark, recorded without looking back**
- [ ] Averages recorded as `tape_measurements_cm` in the JSONL row
- [ ] `_taken_by` and `_takes_averaged` fields filled in
- [ ] **Height** recorded (first session only; carry forward for subsequent sessions)
- [ ] Tape measurements taken **before** the paired scans
- [ ] Any deviation flagged in JSONL provenance fields, not dropped

---

## Anchors

- **D-04, D-06, D-07, D-08, D-12.2** (`01-CONTEXT.md`) — sealed identity, BMI brackets, condition split, document-failures rule, pre-spike checklist.
- **`01-RESEARCH.md`** — Open Question #5 (ISO 8559-1 landmarks); Pitfall #1 (reproducibility protocol); Pitfall #7 (self-reported height); Pitfall #15 (landmark drift); Don't Hand-Roll (tape measure); JSONL schema (`tape_measurements`).
