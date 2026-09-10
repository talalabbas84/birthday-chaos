import { and, asc, eq, ilike, ne } from "drizzle-orm";
import { db } from "@/db/client";
import { guests } from "@/db/schema";

export type GuestSummary = { id: string; name: string };

const SEARCH_LIMIT = 25;

export async function searchGuests(
  partyId: string,
  query: string,
  excludeGuestId: string,
): Promise<GuestSummary[]> {
  const trimmed = query.trim();

  const conditions = [eq(guests.partyId, partyId), eq(guests.active, true), ne(guests.id, excludeGuestId)];
  if (trimmed) {
    conditions.push(ilike(guests.name, `%${trimmed}%`));
  }

  const rows = await db
    .select({ id: guests.id, name: guests.name })
    .from(guests)
    .where(and(...conditions))
    .orderBy(asc(guests.name))
    .limit(SEARCH_LIMIT);

  return rows;
}
