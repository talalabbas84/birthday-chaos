import { cookies } from "next/headers";

export { generateSessionToken, hashSessionToken } from "@/lib/session-token";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, plenty for a birthday party

export function guestCookieName(slug: string): string {
  return `bc_g_${slug}`;
}

export async function readGuestSessionToken(slug: string): Promise<string | null> {
  const store = await cookies();
  return store.get(guestCookieName(slug))?.value ?? null;
}

export async function setGuestSessionCookie(slug: string, token: string) {
  const store = await cookies();
  store.set(guestCookieName(slug), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearGuestSessionCookie(slug: string) {
  const store = await cookies();
  store.delete(guestCookieName(slug));
}
