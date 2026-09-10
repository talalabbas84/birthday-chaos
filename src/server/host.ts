import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { guests, parties } from "@/db/schema";
import { ApiError } from "@/lib/api";

export type PartyStatusInput = "UPCOMING" | "LIVE" | "PAUSED" | "ENDED";

export async function setPartyStatus(partyId: string, status: PartyStatusInput): Promise<void> {
  await db.update(parties).set({ status }).where(eq(parties.id, partyId));
}

export async function setVotingOpen(partyId: string, open: boolean): Promise<void> {
  await db.update(parties).set({ votingOpen: open }).where(eq(parties.id, partyId));
}

export async function startAwardReveal(partyId: string): Promise<void> {
  await db.update(parties).set({ awardRevealActive: true, votingOpen: false }).where(eq(parties.id, partyId));
}

export async function stopAwardReveal(partyId: string): Promise<void> {
  await db.update(parties).set({ awardRevealActive: false }).where(eq(parties.id, partyId));
}

export async function adjustGuestPoints(partyId: string, guestId: string, delta: number): Promise<void> {
  const [guest] = await db.select().from(guests).where(eq(guests.id, guestId)).limit(1);
  if (!guest || guest.partyId !== partyId) {
    throw new ApiError(404, "Guest not found", "Couldn't find that guest.");
  }
  const nextPoints = Math.max(0, guest.points + delta);
  await db.update(guests).set({ points: nextPoints }).where(eq(guests.id, guestId));
}

export async function setGuestActive(partyId: string, guestId: string, active: boolean): Promise<void> {
  const [guest] = await db.select().from(guests).where(eq(guests.id, guestId)).limit(1);
  if (!guest || guest.partyId !== partyId) {
    throw new ApiError(404, "Guest not found", "Couldn't find that guest.");
  }
  await db.update(guests).set({ active }).where(eq(guests.id, guestId));
}

/**
 * Clears the guest's session so their next request needs to rejoin. Used
 * when someone's phone session is stuck and they need a clean restart
 * without losing their point history (the Guest row itself stays intact).
 */
export async function resetGuestSession(partyId: string, guestId: string): Promise<void> {
  const [guest] = await db.select().from(guests).where(eq(guests.id, guestId)).limit(1);
  if (!guest || guest.partyId !== partyId) {
    throw new ApiError(404, "Guest not found", "Couldn't find that guest.");
  }
  await db.update(guests).set({ sessionTokenHash: null }).where(eq(guests.id, guestId));
}

export async function listGuestsForHost(partyId: string) {
  return db
    .select({
      id: guests.id,
      name: guests.name,
      points: guests.points,
      active: guests.active,
      danceLevel: guests.danceLevel,
    })
    .from(guests)
    .where(eq(guests.partyId, partyId))
    .orderBy(guests.name);
}
