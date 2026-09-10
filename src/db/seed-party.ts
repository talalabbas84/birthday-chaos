import { eq } from "drizzle-orm";
import { db } from "./client";
import { challenges, parties, voteQuestions } from "./schema";
import { SEED_CHALLENGES, SEED_VOTE_QUESTIONS } from "./seed-data";
import type { Party } from "./schema";

/**
 * Deletes any existing party with this slug (cascades everything) and
 * recreates it from the spec's seed data. Shared by the CLI seed script and
 * the /admin "full reseed" button so both stay in sync.
 */
export async function seedParty(slug: string, name: string): Promise<Party> {
  const [existing] = await db.select().from(parties).where(eq(parties.slug, slug)).limit(1);
  if (existing) {
    await db.delete(parties).where(eq(parties.id, existing.id));
  }

  const [party] = await db.insert(parties).values({ name, slug, status: "LIVE" }).returning();

  await db.insert(challenges).values(
    SEED_CHALLENGES.map((c, index) => ({
      partyId: party.id,
      title: c.title,
      description: c.description,
      category: c.category,
      points: c.points,
      maxCompletions: c.maxCompletions,
      requiresPerson: c.requiresPerson,
      minimumPeople: c.minimumPeople ?? 1,
      uniquePersonRequired: c.uniquePersonRequired ?? false,
      sortOrder: index,
    })),
  );

  await db.insert(voteQuestions).values(
    SEED_VOTE_QUESTIONS.map((q, index) => ({
      partyId: party.id,
      title: q.title,
      description: q.description,
      sortOrder: index,
    })),
  );

  return party;
}
