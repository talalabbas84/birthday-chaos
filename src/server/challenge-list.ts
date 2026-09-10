import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { challengeCompletions, challenges } from "@/db/schema";

export type ChallengeWithProgress = {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  maxCompletions: number;
  requiresPerson: boolean;
  uniquePersonRequired: boolean;
  completedCount: number;
  isMaxed: boolean;
};

export async function getChallengesForGuest(
  partyId: string,
  guestId: string,
): Promise<ChallengeWithProgress[]> {
  const [challengeRows, completionCounts] = await Promise.all([
    db
      .select()
      .from(challenges)
      .where(and(eq(challenges.partyId, partyId), eq(challenges.active, true)))
      .orderBy(asc(challenges.sortOrder)),
    db
      .select({ challengeId: challengeCompletions.challengeId, count: sql<number>`count(*)::int` })
      .from(challengeCompletions)
      .where(and(eq(challengeCompletions.partyId, partyId), eq(challengeCompletions.guestId, guestId)))
      .groupBy(challengeCompletions.challengeId),
  ]);

  const countByChallenge = new Map(completionCounts.map((row) => [row.challengeId, row.count]));

  return challengeRows.map((challenge) => {
    const completedCount = countByChallenge.get(challenge.id) ?? 0;
    return {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      category: challenge.category,
      points: challenge.points,
      maxCompletions: challenge.maxCompletions,
      requiresPerson: challenge.requiresPerson,
      uniquePersonRequired: challenge.uniquePersonRequired,
      completedCount,
      isMaxed: completedCount >= challenge.maxCompletions,
    };
  });
}
