import { describe, expect, it } from "vitest";
import { isDanceLevel } from "@/lib/dance-level";

describe("isDanceLevel", () => {
  it("accepts the three valid values", () => {
    expect(isDanceLevel("SALSA_DANCER")).toBe(true);
    expect(isDanceLevel("DANCES_A_LITTLE")).toBe(true);
    expect(isDanceLevel("DOES_NOT_REALLY_DANCE")).toBe(true);
  });

  it("rejects anything else, including near-misses", () => {
    expect(isDanceLevel("salsa_dancer")).toBe(false);
    expect(isDanceLevel("DANCER")).toBe(false);
    expect(isDanceLevel(undefined)).toBe(false);
    expect(isDanceLevel(null)).toBe(false);
    expect(isDanceLevel(42)).toBe(false);
  });
});
