import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  challengeCompletions,
  challenges,
  guests,
  parties,
  voteQuestions,
  votes,
} from "@/db/schema";
import { getCrossedLevel, getLevel } from "@/lib/levels";

const TOP_LIMIT = 10;
const RECENT_ACTIVITY_LIMIT = 15;
const CATEGORY_LEADERBOARD_LIMIT = 5;
const MILESTONE_WINDOW_MS = 5 * 60 * 1000;

const CATEGORY_EMOJI: Record<string, string> = {
  EASY: "🟢",
  SOCIAL: "🤝",
  DANCE: "💃",
  TRY_SOMETHING_NEW: "🪩",
  CHAOS: "🔥",
};

export type DisplayState = {
  party: { status: string; votingOpen: boolean; awardRevealActive: boolean };
  leaderboard: Array<{ id: string; name: string; points: number; level: string; levelEmoji: string }>;
  stats: PartyStats;
  recentActivity: Array<{
    id: string;
    guestName: string;
    challengeTitle: string;
    points: number;
    categoryEmoji: string;
    createdAt: string;
  }>;
  recentMilestones: Array<{
    guestId: string;
    name: string;
    threshold: number;
    label: string;
    emoji: string;
    at: string;
  }>;
  categoryLeaderboards: {
    social: Array<{ name: string; count: number }>;
    dance: Array<{ name: string; count: number }>;
    chaos: Array<{ name: string; count: number }>;
  };
};

export type PartyStats = {
  players: number;
  totalChallenges: number;
  danceChallenges: number;
  socialChallenges: number;
  trySomethingNewChallenges: number;
  chaosChallenges: number;
  easyChallenges: number;
  totalPoints: number;
};

export async function getFinalStats(partyId: string): Promise<PartyStats> {
  const [{ players }] = await db
    .select({ players: sql<number>`count(*)::int` })
    .from(guests)
    .where(and(eq(guests.partyId, partyId), eq(guests.active, true)));

  const byCategory = await db
    .select({ category: challenges.category, count: sql<number>`count(*)::int` })
    .from(challengeCompletions)
    .innerJoin(challenges, eq(challengeCompletions.challengeId, challenges.id))
    .where(eq(challengeCompletions.partyId, partyId))
    .groupBy(challenges.category);

  const [{ totalPoints }] = await db
    .select({ totalPoints: sql<number>`coalesce(sum(${guests.points}), 0)::int` })
    .from(guests)
    .where(and(eq(guests.partyId, partyId), eq(guests.active, true)));

  const counts = Object.fromEntries(byCategory.map((row) => [row.category, row.count]));
  const totalChallenges = byCategory.reduce((sum, row) => sum + row.count, 0);

  return {
    players,
    totalChallenges,
    danceChallenges: counts.DANCE ?? 0,
    socialChallenges: counts.SOCIAL ?? 0,
    trySomethingNewChallenges: counts.TRY_SOMETHING_NEW ?? 0,
    chaosChallenges: counts.CHAOS ?? 0,
    easyChallenges: counts.EASY ?? 0,
    totalPoints,
  };
}

type Category = "EASY" | "SOCIAL" | "DANCE" | "TRY_SOMETHING_NEW" | "CHAOS";

async function getCategoryLeaderboard(partyId: string, category: Category) {
  const rows = await db
    .select({ name: guests.name, count: sql<number>`count(*)::int` })
    .from(challengeCompletions)
    .innerJoin(challenges, eq(challengeCompletions.challengeId, challenges.id))
    .innerJoin(guests, eq(challengeCompletions.guestId, guests.id))
    .where(and(eq(challengeCompletions.partyId, partyId), eq(challenges.category, category)))
    .groupBy(guests.id, guests.name)
    .orderBy(desc(sql`count(*)`))
    .limit(CATEGORY_LEADERBOARD_LIMIT);
  return rows;
}

export async function getDisplayState(partyId: string): Promise<DisplayState> {
  const [party] = await db.select().from(parties).where(eq(parties.id, partyId)).limit(1);
  if (!party) throw new Error("Party not found");

  const leaderboardRows = await db
    .select({ id: guests.id, name: guests.name, points: guests.points })
    .from(guests)
    .where(and(eq(guests.partyId, partyId), eq(guests.active, true)))
    .orderBy(desc(guests.points))
    .limit(TOP_LIMIT * 2);

  const leaderboard = leaderboardRows
    .filter((g) => g.points > 0)
    .slice(0, TOP_LIMIT)
    .map((g) => {
      const level = getLevel(g.points);
      return { id: g.id, name: g.name, points: g.points, level: level.label, levelEmoji: level.emoji };
    });

  const recentRows = await db
    .select({
      id: challengeCompletions.id,
      guestId: guests.id,
      guestName: guests.name,
      guestPoints: guests.points,
      challengeTitle: challenges.title,
      category: challenges.category,
      points: challengeCompletions.pointsAwarded,
      createdAt: challengeCompletions.createdAt,
    })
    .from(challengeCompletions)
    .innerJoin(challenges, eq(challengeCompletions.challengeId, challenges.id))
    .innerJoin(guests, eq(challengeCompletions.guestId, guests.id))
    .where(eq(challengeCompletions.partyId, partyId))
    .orderBy(desc(challengeCompletions.createdAt))
    .limit(RECENT_ACTIVITY_LIMIT);

  const recentActivity = recentRows.map((row) => ({
    id: row.id,
    guestName: row.guestName,
    challengeTitle: row.challengeTitle,
    points: row.points,
    categoryEmoji: CATEGORY_EMOJI[row.category] ?? "✨",
    createdAt: row.createdAt.toISOString(),
  }));

  const now = Date.now();
  const seenGuests = new Set<string>();
  const recentMilestones: DisplayState["recentMilestones"] = [];
  for (const row of recentRows) {
    if (seenGuests.has(row.guestId)) continue;
    seenGuests.add(row.guestId);
    if (now - row.createdAt.getTime() > MILESTONE_WINDOW_MS) continue;

    const oldPoints = row.guestPoints - row.points;
    const crossed = getCrossedLevel(oldPoints, row.guestPoints);
    if (crossed) {
      recentMilestones.push({
        guestId: row.guestId,
        name: row.guestName,
        threshold: crossed.threshold,
        label: crossed.label,
        emoji: crossed.emoji,
        at: row.createdAt.toISOString(),
      });
    }
  }

  const [social, dance, chaos] = await Promise.all([
    getCategoryLeaderboard(partyId, "SOCIAL"),
    getCategoryLeaderboard(partyId, "DANCE"),
    getCategoryLeaderboard(partyId, "CHAOS"),
  ]);

  const stats = await getFinalStats(partyId);

  return {
    party: {
      status: party.status,
      votingOpen: party.votingOpen,
      awardRevealActive: party.awardRevealActive,
    },
    leaderboard,
    stats,
    recentActivity,
    recentMilestones,
    categoryLeaderboards: { social, dance, chaos },
  };
}

const REVEAL_SUBTITLES: Record<string, string> = {
  "biggest flirt": "Democracy has spoken.",
  "best styling": "The people have taste ✨",
  "smells the best": "Apparently you smell fantastic.",
  "talks too much while dancing": "Apparently silence isn't part of the technique.",
  "most chaotic energy": "This surprises absolutely nobody.",
};

function subtitleFor(title: string): string {
  return REVEAL_SUBTITLES[title.trim().toLowerCase()] ?? "The people have voted 👀";
}

export type AwardRevealData = {
  voteResults: Array<{ id: string; title: string; description: string; winnerName: string | null; subtitle: string }>;
  finalAwards: Array<{ key: string; title: string; emoji: string; winnerName: string | null; subtitle: string }>;
  stats: PartyStats;
};

export async function getAwardRevealData(partyId: string): Promise<AwardRevealData> {
  const questions = await db
    .select()
    .from(voteQuestions)
    .where(eq(voteQuestions.partyId, partyId))
    .orderBy(voteQuestions.sortOrder);

  const voteResults = [];
  for (const question of questions) {
    const [winner] = await db
      .select({ name: guests.name, count: sql<number>`count(*)::int` })
      .from(votes)
      .innerJoin(guests, eq(votes.selectedGuestId, guests.id))
      .where(eq(votes.questionId, question.id))
      .groupBy(guests.id, guests.name)
      .orderBy(desc(sql`count(*)`))
      .limit(1);

    voteResults.push({
      id: question.id,
      title: question.title,
      description: question.description,
      winnerName: winner?.name ?? null,
      subtitle: subtitleFor(question.title),
    });
  }

  const [champion] = await db
    .select({ name: guests.name, points: guests.points })
    .from(guests)
    .where(and(eq(guests.partyId, partyId), eq(guests.active, true)))
    .orderBy(desc(guests.points))
    .limit(1);

  const [social] = await getCategoryLeaderboard(partyId, "SOCIAL");
  const [dance] = await getCategoryLeaderboard(partyId, "DANCE");
  const [chaos] = await getCategoryLeaderboard(partyId, "CHAOS");

  const finalAwards = [
    {
      key: "champion",
      title: "Overall Champion",
      emoji: "🏆",
      winnerName: champion?.name ?? null,
      subtitle: "Highest score in the room.",
    },
    {
      key: "socialButterfly",
      title: "Social Butterfly",
      emoji: "🦋",
      winnerName: social?.name ?? null,
      subtitle: "Talked to literally everyone.",
    },
    {
      key: "danceFloorMenace",
      title: "Dance Floor Menace",
      emoji: "💃",
      winnerName: dance?.name ?? null,
      subtitle: "Never once left the floor.",
    },
    {
      key: "chaosAgent",
      title: "Chaos Agent",
      emoji: "🔥",
      winnerName: chaos?.name ?? null,
      subtitle: "Caused the most beautiful chaos.",
    },
  ];

  const stats = await getFinalStats(partyId);

  return { voteResults, finalAwards, stats };
}
