/**
 * Deterministic "demo scan" numbers derived from profile + scan ordinal.
 * This is not body measurement — it replaces Math.random() so the app is honest
 * about being illustrative until real sensing exists.
 */

export interface ProfileForSimulation {
  height: number;
  weight: number;
  gender: "male" | "female";
  age: number;
}

export interface SimulatedBodyMeasurement {
  chest: number;
  waist: number;
  hips: number;
  leftArm: number;
  rightArm: number;
  leftThigh: number;
  rightThigh: number;
  neck: number;
  shoulders: number;
  bodyFat: number;
  muscleMass: number;
}

export interface SimulatedScanResult {
  measurements: SimulatedBodyMeasurement;
  weight: number;
  bmi: number;
  score: number;
}

/** Mulberry32 PRNG — same seed ⇒ same sequence (testable, no Math.random). */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Produces repeatable demo measurements from self-reported height/weight only.
 * Spread is small so re-running a scan feels stable; it is still not a real device.
 */
export function buildProfileBasedDemoScan(
  profile: ProfileForSimulation,
  scanOrdinal: number,
): SimulatedScanResult {
  const hM = profile.height / 100;
  const bmiProxy = profile.weight / (hM * hM);

  const seed =
    (scanOrdinal + 1) * 1_000_003 +
    profile.height * 17 +
    profile.weight * 31 +
    profile.age * 13 +
    (profile.gender === "female" ? 5 : 0);

  const rng = mulberry32(seed);
  const wobble = (mag: number) => (rng() - 0.5) * 2 * mag;

  const chest = 0.52 * profile.height + wobble(1.2);
  const waist = 0.42 * profile.height + wobble(1.8);
  const hips = 0.54 * profile.height + wobble(1.4);
  const neck = 0.21 * profile.height + wobble(0.6);
  const shoulders = 0.68 * profile.height + wobble(1.5);
  const leftArm = 0.195 * profile.height + wobble(0.9);
  const rightArm = leftArm + 0.3 + wobble(0.25);
  const leftThigh = 0.32 * profile.height + wobble(1.1);
  const rightThigh = leftThigh - 0.2 + wobble(0.2);

  const bodyFat = Math.min(
    42,
    Math.max(8, bmiProxy * 1.05 + (profile.gender === "female" ? 4 : 0) + wobble(1.2)),
  );
  const muscleMass = Math.max(
    28,
    profile.weight * (1 - bodyFat / 120) + wobble(1.5),
  );

  const weight = round1(profile.weight + wobble(0.8));
  const bmi = round1(weight / (hM * hM));

  const score = Math.min(
    98,
    Math.max(
      52,
      Math.round(62 + (100 - bodyFat) * 0.35 + wobble(4)),
    ),
  );

  return {
    measurements: {
      chest: round1(chest),
      waist: round1(waist),
      hips: round1(hips),
      leftArm: round1(leftArm),
      rightArm: round1(rightArm),
      leftThigh: round1(leftThigh),
      rightThigh: round1(rightThigh),
      neck: round1(neck),
      shoulders: round1(shoulders),
      bodyFat: round1(bodyFat),
      muscleMass: round1(muscleMass),
    },
    weight,
    bmi,
    score,
  };
}
