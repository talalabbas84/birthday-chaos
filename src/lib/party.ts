import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { parties, guests } from "@/db/schema";
import type { Party, Guest } from "@/db/schema";
import { hashSessionToken, readGuestSessionToken } from "@/lib/session";

export async function getPartyBySlug(slug: string): Promise<Party | null> {
  const [party] = await db.select().from(parties).where(eq(parties.slug, slug)).limit(1);
  return party ?? null;
}

/**
 * Resolves the current guest from the request's session cookie, scoped to
 * this party. Returns null if there's no cookie, no matching guest, or the
 * guest has been deactivated by the host.
 */
export async function getCurrentGuest(slug: string, partyId: string): Promise<Guest | null> {
  const token = await readGuestSessionToken(slug);
  if (!token) return null;

  const tokenHash = hashSessionToken(token);
  const [guest] = await db
    .select()
    .from(guests)
    .where(eq(guests.sessionTokenHash, tokenHash))
    .limit(1);

  if (!guest || guest.partyId !== partyId || !guest.active) return null;
  return guest;
}
