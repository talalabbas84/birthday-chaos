import { describe, expect, it } from "vitest";
import { cleanDisplayName, normalizeExternalName } from "@/lib/normalize";

describe("normalizeExternalName", () => {
  it("treats different casing as the same person", () => {
    expect(normalizeExternalName("Chris")).toBe(normalizeExternalName("CHRIS"));
  });

  it("treats surrounding whitespace as the same person", () => {
    expect(normalizeExternalName(" chris ")).toBe(normalizeExternalName("chris"));
  });

  it("matches the exact scenario from the spec", () => {
    const variants = ["Chris", "CHRIS", " chris "].map(normalizeExternalName);
    expect(new Set(variants).size).toBe(1);
    expect(variants[0]).toBe("chris");
  });

  it("collapses repeated internal spaces", () => {
    expect(normalizeExternalName("Mary   Jane")).toBe("mary jane");
  });
});

describe("cleanDisplayName", () => {
  it("trims and collapses whitespace but preserves casing", () => {
    expect(cleanDisplayName("  Chris   Lee  ")).toBe("Chris Lee");
  });
});
