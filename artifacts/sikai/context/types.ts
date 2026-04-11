export interface BodyMeasurement {
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

export interface ScanRecord {
  id: string;
  date: string;
  measurements: BodyMeasurement;
  weight: number;
  bmi: number;
  score: number;
  notes?: string;
}

export interface UserProfile {
  name: string;
  age: number;
  height: number;
  weight: number;
  goal: "lose_weight" | "build_muscle" | "maintain" | "improve_fitness";
  gender: "male" | "female";
  isPro: boolean;
  onboardingComplete: boolean;
}

export type ScanDataSource = "empty" | "demo" | "live" | "legacy_demo";
