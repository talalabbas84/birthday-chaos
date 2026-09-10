import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { challengeCompletions, guests, parties } from "@/db/schema";
import { seedParty } from "@/db/seed-party";
import { ApiError } from "@/lib/api";

export type AdminPartySummary = {
  id: string;
  slug: string;
  name: string;
  status: string;
  votingOpen: boolean;
  awardRevealActive: boolean;
  guestCount: number;
  completionCount: number;
  totalPoints: number;
};

export async function listPartiesForAdmin(): Promise<AdminPartySummary[]> {
  const partyRows = await db.select().from(parties).orderBy(parties.createdAt);

  const summaries: AdminPartySummary[] = [];
  for (const party of partyRows) {
    const [guestAgg] = await db
      .select({
        guestCount: sql<number>`count(*)::int`,
        totalPoints: sql<number>`coalesce(sum(${guests.points}), 0)::int`,
      })
      .from(guests)
      .where(eq(guests.partyId, party.id));

    const [{ completionCount }] = await db
      .select({ completionCount: sql<number>`count(*)::int` })
      .from(challengeCompletions)
      .where(eq(challengeCompletions.partyId, party.id));

    summaries.push({
      id: party.id,
      slug: party.slug,
      name: party.name,
      status: party.status,
      votingOpen: party.votingOpen,
      awardRevealActive: party.awardRevealActive,
      guestCount: guestAgg.guestCount,
      totalPoints: guestAgg.totalPoints,
      completionCount,
    });
  }

  return summaries;
}

/**
 * Wipes everyone who has joined (guests, their completions, and their
 * votes all cascade off the guest row) but leaves the challenge catalog and
 * vote questions untouched, then puts the party back to a fresh LIVE state.
 * This is the "clean up my test data before real guests arrive" button.
 */
export async function resetPartyTestData(partyId: string): Promise<void> {
  const [party] = await db.select().from(parties).where(eq(parties.id, partyId)).limit(1);
  if (!party) throw new ApiError(404, "Party not found", "Couldn't find that party.");

  await db.delete(guests).where(eq(guests.partyId, partyId));
  await db
    .update(parties)
    .set({ status: "LIVE", votingOpen: false, awardRevealActive: false })
    .where(eq(parties.id, partyId));
}

/**
 * Nuclear option: deletes the party entirely (guests, challenges, vote
 * questions, everything cascades) and recreates it fresh from the seed
 * data, in case the challenge catalog itself got edited during testing.
 */
export async function reseedPartyFromScratch(partyId: string): Promise<string> {
  const [party] = await db.select().from(parties).where(eq(parties.id, partyId)).limit(1);
  if (!party) throw new ApiError(404, "Party not found", "Couldn't find that party.");

  const recreated = await seedParty(party.slug, party.name);
  return recreated.slug;
}
