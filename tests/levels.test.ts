import { describe, expect, it } from "vitest";
import { getCrossedLevel, getLevel, LEVELS } from "@/lib/levels";

describe("getLevel", () => {
  it("returns the base level at 0 points", () => {
    expect(getLevel(0).label).toBe("Just Arrived");
  });

  it("returns the highest level at or below the given points", () => {
    expect(getLevel(99).label).toBe("Just Arrived");
    expect(getLevel(100).label).toBe("Getting Involved");
    expect(getLevel(249).label).toBe("Getting Involved");
    expect(getLevel(250).label).toBe("Social Butterfly");
    expect(getLevel(2500).label).toBe("Please Go Home");
  });

  it("never exceeds the highest defined threshold", () => {
    expect(getLevel(Number.MAX_SAFE_INTEGER).label).toBe(LEVELS[LEVELS.length - 1].label);
  });
});

describe("getCrossedLevel", () => {
  it("returns null when no threshold is crossed", () => {
    expect(getCrossedLevel(10, 50)).toBeNull();
  });

  it("returns null when points go down or stay flat", () => {
    expect(getCrossedLevel(150, 100)).toBeNull();
    expect(getCrossedLevel(100, 100)).toBeNull();
  });

  it("returns the crossed level when a single threshold is passed", () => {
    expect(getCrossedLevel(80, 120)?.label).toBe("Getting Involved");
  });

  it("returns the highest threshold when multiple are crossed in one jump", () => {
    expect(getCrossedLevel(0, 1200)?.label).toBe("Public Nuisance");
  });

  it("does not re-trigger when landing exactly on the current threshold", () => {
    expect(getCrossedLevel(100, 100)).toBeNull();
  });
});
