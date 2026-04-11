import type { BodyMeasurement, ScanRecord } from "@/context/types";
import { mulberry32 } from "@/lib/scanSimulation";

/** Explicitly synthetic multi-week history for UI / QA — never auto-loaded on install */
export function generateLabeledDemoScanHistory(profile: {
  height: number;
  weight: number;
  gender: "male" | "female";
}): ScanRecord[] {
  const records: ScanRecord[] = [];
  const now = new Date();

  const baseMetrics: BodyMeasurement = {
    chest: 0.52 * profile.height,
    waist: 0.42 * profile.height,
    hips: 0.54 * profile.height,
    leftArm: 0.195 * profile.height,
    rightArm: 0.195 * profile.height + 0.3,
    leftThigh: 0.32 * profile.height,
    rightThigh: 0.32 * profile.height - 0.2,
    neck: 0.21 * profile.height,
    shoulders: 0.68 * profile.height,
    bodyFat: 18,
    muscleMass: profile.weight * 0.48,
  };

  for (let i = 7; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7);
    const progress = (7 - i) / 7;
    const rng = mulberry32(0x514b41 + i * 9973);
    const jitter = () => (rng() - 0.5) * 0.4;

    const measurements: BodyMeasurement = {
      chest: baseMetrics.chest - progress * 0.5 + jitter(),
      waist: baseMetrics.waist - progress * 2.5 + jitter(),
      hips: baseMetrics.hips - progress * 1.2 + jitter(),
      leftArm: baseMetrics.leftArm + progress * 1.5 + jitter(),
      rightArm: baseMetrics.rightArm + progress * 1.5 + jitter(),
      leftThigh: baseMetrics.leftThigh + progress * 1 + jitter(),
      rightThigh: baseMetrics.rightThigh + progress * 1 + jitter(),
      neck: baseMetrics.neck + progress * 0.3 + jitter(),
      shoulders: baseMetrics.shoulders + progress * 1.5 + jitter(),
      bodyFat: baseMetrics.bodyFat - progress * 2.5 + jitter(),
      muscleMass: baseMetrics.muscleMass + progress * 2 + jitter(),
    };

    const weight = profile.weight - progress * 3 + jitter();
    const height = profile.height;
    const bmi = Math.round((weight / Math.pow(height / 100, 2)) * 10) / 10;
    const score = Math.round(65 + progress * 20 + rng() * 5);

    records.push({
      id: `demo_scan_${i}`,
      date: date.toISOString(),
      measurements,
      weight: Math.round(weight * 10) / 10,
      bmi,
      score,
      notes: i === 0 ? "Demo sample — not a real scan" : "Demo sample",
    });
  }

  return records;
}
