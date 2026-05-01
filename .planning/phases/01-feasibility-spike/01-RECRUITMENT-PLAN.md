# Tester Recruitment Plan (D-05, D-12.3)

> **Status field convention:** `pending` = no contact yet · `outreach` = message sent, no reply · `warm` = verbal interest, no commit · `confirmed` = committed to ≥4 sessions · `completed` = data collection done · `dropped` = withdrew.
>
> **Real names are NOT recorded in this file.** The mapping of T1/T2/T3 → real names lives on a single **sealed paper note** kept by the founder, off the dev machine and out of the repo.

---

## Purpose and constraints

- **3 testers required (D-05).** One per BMI bracket — non-negotiable. Per RESEARCH.md "Environment Availability" the spike has **NO acceptable fallback** for missing brackets; running on lean+normal only invalidates the gate.
- **High-BMI bracket is schedule-critical.** Per CONTEXT.md "specifics" the >27 (ideally >32) slot is the make-or-break demographic per D-05 and the single hardest recruitment problem. **Outreach for T3 starts before any code is written** — recruiting can take weeks; engineering takes days.
- **Time per tester.** ≥4 sessions (D-06) across ≥2 different days. Each session ≈ 45–60 min: 2 paired front+side scans + tape measurements + brief Q&A.
- **Physical conditions tester must accept:** scanned in tight athletic wear or undergarments; access to a plain wall and ~3 m of standing room; willing to be tape-measured at waist/hip/chest by a partner (or self per `01-TAPE-PROTOCOL.md`).
- **Hard cap.** Per D-11, the data-collection window is 2 weeks (preferred) to 4 weeks (hard cap). If at week 4 not all 3 testers have ≥4 sessions, the go/no-go report is written with whatever exists and the shortfall is documented.

---

## Privacy commitment to testers (use this language verbatim in outreach)

> *"I'm doing personal research on whether an iPhone can accurately measure body circumferences using its built-in body-pose AI. I'd love your help.*
>
> *Here's what's involved:*
>
> *- About 4 sessions over 2 weeks, 45–60 minutes each. We can split it across visits or do two on the same day.*
> *- I'd ask you to wear tight athletic wear or undergarments so the scan picks up your body shape, not the clothes.*
> *- I'd take 2 phone scans (front + side) per session, plus tape-measure your waist, hip, and chest as ground truth.*
> *- The phone DOES NOT save photos. Only the numerical measurements are stored.*
> *- Your name is never recorded digitally — you'd just be 'T1', 'T2', or 'T3' in my notes.*
> *- You can withdraw at any point and I'll delete your data.*
> *- This is unpaid volunteer research. I'm happy to buy you coffee / dinner / a thank-you gift if you want.*"

---

## Candidate slots

Real names go **only on the sealed paper note**. Fill in the columns below before the first session for each tester.

| Slot | ID | BMI Bracket | Approx Height (cm) | Approx Weight (kg) | Est. BMI | Source / Relationship | Status | Notes |
|------|----|-------------|--------------------|--------------------|----------|------------------------|--------|-------|
| 1 | **T1** | lean (<22) | _to fill_ | _to fill_ | _calc_ | _close circle_ | `pending` | Typically easiest — fitness-active friend |
| 2 | **T2** | normal (22–27) | _to fill_ | _to fill_ | _calc_ | _close circle_ | `pending` | Typically easiest — most adults sit here |
| 3 | **T3** | overweight (>27, ideally >32 obese) | _to fill_ | _to fill_ | _calc_ | _close circle / community_ | `pending` | **HIGH PRIORITY — schedule-critical path. Recruit FIRST.** |

> BMI estimate formula: `BMI = weight_kg / (height_m)²`. Use this only for bracket assignment — actual height is physically measured at intake per `01-TAPE-PROTOCOL.md`.

---

## Outreach priority order (run sequentially in time, not concurrently)

Treat this as a 4-step funnel; do not advance to the next step until the current one is exhausted.

1. **STEP 1 — T3 (high-BMI), close circle.** Begin **before any code is written.** Identify 2–3 candidates in the >27 BMI range from family, friends, gym contacts, work network. Send the privacy-commitment message above to all of them. Wait 2–3 days for responses.
2. **STEP 2 — T2 (normal 22–27), close circle.** Generally the easiest slot. Most adult acquaintances fall here. Send to 2–3 candidates.
3. **STEP 3 — T1 (lean <22), close circle.** Fitness-active friends, runners, climbers, etc.
4. **STEP 4 — Community outreach (only if STEP 1 has not produced a confirmed T3 within 3 days).**
   - Local Reddit community (e.g., `r/[localcity]`) — informal post.
   - Community Slack/Discord (e.g., gym, neighborhood, hobby).
   - Word-of-mouth referral from confirmed T1 or T2.
   - **Do NOT use paid recruitment platforms** (Prolific, MTurk, etc.). The privacy commitment is incompatible with platform-mediated consent flows, and the friction isn't worth it for N=1.
   - **No Craigslist.** Too noisy, attracts wrong audience for an unpaid research ask.
   - Compensation at founder's discretion: gift card, dinner, or fitness-relevant thank-you. Make it clear in the post that there's no paid component up front, only goodwill.

---

## Session scheduling template

For each tester, plan **4 sessions across ≥2 different days**. Day A and Day B should be **≥2 calendar days apart** (e.g., Mon + Thu) so morning/evening + cross-day variation both show up.

| # | Day | Time of day | Condition (per D-07) | Setting | Notes |
|---|-----|-------------|----------------------|---------|-------|
| S1 | A | morning | `assisted_studio` or `assisted_apartment` | researcher present, plain wall, good light | tape measurements first |
| S2 | A | evening | same controlled condition | same | catches morning↔evening body variation |
| S3 | B | morning | `solo_apartment` | tester alone, phone propped on tripod / books / shelf | tester self-measures (flag `_taken_by: self`) or partner-measures if available |
| S4 | B | evening | `solo_apartment` | same | natural variation in posture/lighting |

**Optional 5th session for failure-mode samples (per D-08):** one of `solo_apartment_lighting_fail` (low light, backlit) or `solo_apartment_clothing_fail` (loose top) — keep these rows in the dataset, do not exclude.

All 4 sessions per tester should land within 2 weeks of session 1.

---

## Equipment checklist (per session)

- [ ] Tape measure (cm-marked, non-elastic) — see `01-TAPE-PROTOCOL.md`
- [ ] iPhone with the spike harness installed and on iOS 17+
- [ ] Plain wall or low-clutter background (controlled sessions)
- [ ] Tripod **or** counter / shelf / stack of books at chest-to-shoulder height (for solo sessions; tester improvises if no tripod)
- [ ] Sufficient lighting — overhead room light minimum; **no severe backlight** (window directly behind tester)
- [ ] Pen + the printed per-session checklist from `01-TAPE-PROTOCOL.md`

---

## Schedule tracking (founder fills in as sessions complete)

| Tester | Session | Date | Day-of-week | Condition | Status | Notes |
|--------|---------|------|-------------|-----------|--------|-------|
| T1 | S1 |  |  |  |  |  |
| T1 | S2 |  |  |  |  |  |
| T1 | S3 |  |  |  |  |  |
| T1 | S4 |  |  |  |  |  |
| T2 | S1 |  |  |  |  |  |
| T2 | S2 |  |  |  |  |  |
| T2 | S3 |  |  |  |  |  |
| T2 | S4 |  |  |  |  |  |
| T3 | S1 |  |  |  |  |  |
| T3 | S2 |  |  |  |  |  |
| T3 | S3 |  |  |  |  |  |
| T3 | S4 |  |  |  |  |  |

---

## Volume gate for the go/no-go decision

**Minimum dataset before calling the gate:** 3 testers × ≥4 sessions × 2 paired scans = **≥24 paired observations**.

| Status at week N | Action |
|------------------|--------|
| Week 2: all 3 testers ≥4 sessions complete | Proceed to analysis (Plan 01-06) |
| Week 4 (D-11 hard cap): not all 3 complete | Write the go/no-go report with whatever exists and document the shortfall as a **protocol-failure** finding, not a measurement failure |
| Any week: T3 not recruited | The gate decision is **invalid** — do not run analysis on lean+normal only. Re-plan recruitment or escalate to a re-plan of the phase. |

---

## Anchors

- **D-05** — 3 testers across BMI brackets, no fallback.
- **D-06** — ≥4 sessions per tester across ≥2 days.
- **D-07** — ~50/50 controlled / solo split.
- **D-08** — Document failures, don't drop samples.
- **D-11** — 2-week target / 4-week hard cap.
- **D-12.3** — Recruitment plan with named candidates exists before harness code begins.
- `01-RESEARCH.md` Pitfall 3 (demographic bias), Pitfall 4 (capture protocol conditions), Environment Availability table.
- `01-TAPE-PROTOCOL.md` — measurement protocol that all sessions follow.
