import { eq, sql } from "drizzle-orm";
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

export type SyncResult = { addedChallenges: number; addedQuestions: number };

/**
 * Adds any challenges/vote questions from seed-data.ts that this party
 * doesn't already have (matched by title) and leaves everything else —
 * guests, scores, completions, votes, existing challenges — untouched.
 * This is how new content gets added to a party that's already being
 * tested/played, without the destructive delete-and-recreate of seedParty().
 */
export async function syncChallengeCatalog(slug: string): Promise<SyncResult> {
  const [party] = await db.select().from(parties).where(eq(parties.slug, slug)).limit(1);
  if (!party) {
    throw new Error(`Party "${slug}" not found — seed it first with seedParty().`);
  }

  const existingChallenges = await db
    .select({ title: challenges.title })
    .from(challenges)
    .where(eq(challenges.partyId, party.id));
  const existingTitles = new Set(existingChallenges.map((c) => c.title));
  const missingChallenges = SEED_CHALLENGES.filter((c) => !existingTitles.has(c.title));

  if (missingChallenges.length > 0) {
    const [{ maxSort }] = await db
      .select({ maxSort: sql<number>`coalesce(max(${challenges.sortOrder}), -1)::int` })
      .from(challenges)
      .where(eq(challenges.partyId, party.id));

    await db.insert(challenges).values(
      missingChallenges.map((c, index) => ({
        partyId: party.id,
        title: c.title,
        description: c.description,
        category: c.category,
        points: c.points,
        maxCompletions: c.maxCompletions,
        requiresPerson: c.requiresPerson,
        minimumPeople: c.minimumPeople ?? 1,
        uniquePersonRequired: c.uniquePersonRequired ?? false,
        sortOrder: maxSort + 1 + index,
      })),
    );
  }

  const existingQuestions = await db
    .select({ title: voteQuestions.title })
    .from(voteQuestions)
    .where(eq(voteQuestions.partyId, party.id));
  const existingQuestionTitles = new Set(existingQuestions.map((q) => q.title));
  const missingQuestions = SEED_VOTE_QUESTIONS.filter((q) => !existingQuestionTitles.has(q.title));

  if (missingQuestions.length > 0) {
    const [{ maxQuestionSort }] = await db
      .select({ maxQuestionSort: sql<number>`coalesce(max(${voteQuestions.sortOrder}), -1)::int` })
      .from(voteQuestions)
      .where(eq(voteQuestions.partyId, party.id));

    await db.insert(voteQuestions).values(
      missingQuestions.map((q, index) => ({
        partyId: party.id,
        title: q.title,
        description: q.description,
        sortOrder: maxQuestionSort + 1 + index,
      })),
    );
  }

  return { addedChallenges: missingChallenges.length, addedQuestions: missingQuestions.length };
}
