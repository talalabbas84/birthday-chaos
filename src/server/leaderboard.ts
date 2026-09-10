import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { guests } from "@/db/schema";
import { getLevel } from "@/lib/levels";

export type LeaderboardEntry = {
  id: string;
  name: string;
  points: number;
  level: string;
  levelEmoji: string;
  rank: number;
};

export type LeaderboardResult = {
  top: LeaderboardEntry[];
  me: LeaderboardEntry | null;
};

const TOP_LIMIT = 10;

export async function getLeaderboard(partyId: string, currentGuestId: string | null): Promise<LeaderboardResult> {
  const rows = await db
    .select({ id: guests.id, name: guests.name, points: guests.points })
    .from(guests)
    .where(and(eq(guests.partyId, partyId), eq(guests.active, true)))
    .orderBy(desc(guests.points));

  const withRank = rows.map((row, index) => {
    const level = getLevel(row.points);
    return {
      id: row.id,
      name: row.name,
      points: row.points,
      level: level.label,
      levelEmoji: level.emoji,
      rank: index + 1,
    };
  });

  const top = withRank.filter((row) => row.points > 0).slice(0, TOP_LIMIT);
  const me = currentGuestId ? withRank.find((row) => row.id === currentGuestId) ?? null : null;

  return { top, me };
}
