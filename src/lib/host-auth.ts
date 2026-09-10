import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const HOST_SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 14; // 14 hours, covers the whole party

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET is not set");
  return value;
}

function sign(slug: string, expiresAt: number): string {
  return createHmac("sha256", secret()).update(`${slug}:${expiresAt}`).digest("hex");
}

export function hostCookieName(slug: string): string {
  return `bc_host_${slug}`;
}

export function createHostSessionValue(slug: string): string {
  const expiresAt = Date.now() + HOST_SESSION_MAX_AGE_MS;
  return `${expiresAt}.${sign(slug, expiresAt)}`;
}

export function verifyHostSessionValue(slug: string, value: string | undefined | null): boolean {
  if (!value) return false;
  const [expiresAtRaw, signature] = value.split(".");
  if (!expiresAtRaw || !signature) return false;
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  const expected = sign(slug, expiresAt);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function setHostSessionCookie(slug: string) {
  const store = await cookies();
  store.set(hostCookieName(slug), createHostSessionValue(slug), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: HOST_SESSION_MAX_AGE_MS / 1000,
  });
}

export async function clearHostSessionCookie(slug: string) {
  const store = await cookies();
  store.delete(hostCookieName(slug));
}

export async function isHostAuthenticated(slug: string): Promise<boolean> {
  const store = await cookies();
  const value = store.get(hostCookieName(slug))?.value;
  return verifyHostSessionValue(slug, value);
}

export function checkHostPasscode(passcode: string): boolean {
  const expected = process.env.HOST_PASSCODE;
  if (!expected) throw new Error("HOST_PASSCODE is not set");
  if (passcode.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(passcode), Buffer.from(expected));
}
