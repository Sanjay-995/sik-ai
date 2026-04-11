import { describe, expect, it } from "vitest";
import { buildProfileBasedDemoScan, mulberry32 } from "./scanSimulation";

describe("mulberry32", () => {
  it("is deterministic for a fixed seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});

describe("buildProfileBasedDemoScan", () => {
  const profile = { height: 178, weight: 82, gender: "male" as const, age: 30 };

  it("returns stable numbers for the same ordinal", () => {
    const first = buildProfileBasedDemoScan(profile, 2);
    const second = buildProfileBasedDemoScan(profile, 2);
    expect(first).toEqual(second);
  });

  it("changes when ordinal changes", () => {
    const a = buildProfileBasedDemoScan(profile, 0);
    const b = buildProfileBasedDemoScan(profile, 1);
    expect(a.measurements.chest).not.toEqual(b.measurements.chest);
  });
});
