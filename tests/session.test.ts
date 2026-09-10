import { describe, expect, it } from "vitest";
import { generateSessionToken, hashSessionToken } from "@/lib/session-token";

describe("session tokens", () => {
  it("generates sufficiently random, unique tokens", () => {
    const a = generateSessionToken();
    const b = generateSessionToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(20);
  });

  it("hashes deterministically so a returning cookie still resolves", () => {
    const token = generateSessionToken();
    expect(hashSessionToken(token)).toBe(hashSessionToken(token));
  });

  it("produces different hashes for different tokens", () => {
    expect(hashSessionToken("token-a")).not.toBe(hashSessionToken("token-b"));
  });

  it("never stores the raw token as its own hash", () => {
    const token = generateSessionToken();
    expect(hashSessionToken(token)).not.toBe(token);
  });
});
