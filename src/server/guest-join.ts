import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { guests } from "@/db/schema";
import type { Guest } from "@/db/schema";
import { ApiError } from "@/lib/api";
import { generateSessionToken, hashSessionToken } from "@/lib/session";
import { cleanDisplayName } from "@/lib/normalize";
import type { DanceLevel } from "@/lib/dance-level";

export { isDanceLevel } from "@/lib/dance-level";
export type { DanceLevel } from "@/lib/dance-level";

export async function joinParty(
  partyId: string,
  rawName: string,
  danceLevel: DanceLevel,
): Promise<{ guest: Guest; token: string }> {
  const name = cleanDisplayName(rawName).slice(0, 40);
  if (!name) {
    throw new ApiError(400, "Name required", "What's your name?");
  }

  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);

  const [guest] = await db
    .insert(guests)
    .values({ partyId, name, danceLevel, sessionTokenHash: tokenHash })
    .returning();

  return { guest, token };
}

export async function switchGuestSession(guestId: string): Promise<void> {
  // Clears the stored token hash so the old cookie (if it leaks/persists
  // anywhere) can no longer resolve to this guest.
  await db.update(guests).set({ sessionTokenHash: null }).where(eq(guests.id, guestId));
}
