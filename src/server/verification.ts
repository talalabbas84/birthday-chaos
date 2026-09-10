import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { challengeCompletionPeople, challengeCompletions, challenges, guests } from "@/db/schema";
import { ApiError } from "@/lib/api";

export type PendingVerification = {
  id: string;
  claimantName: string;
  challengeTitle: string;
  createdAt: string;
};

const MAX_PENDING_SHOWN = 3;

export async function listPendingVerifications(guestId: string): Promise<PendingVerification[]> {
  const rows = await db
    .select({
      id: challengeCompletionPeople.id,
      claimantName: guests.name,
      challengeTitle: challenges.title,
      createdAt: challengeCompletionPeople.createdAt,
    })
    .from(challengeCompletionPeople)
    .innerJoin(challengeCompletions, eq(challengeCompletionPeople.completionId, challengeCompletions.id))
    .innerJoin(challenges, eq(challengeCompletions.challengeId, challenges.id))
    .innerJoin(guests, eq(challengeCompletions.guestId, guests.id))
    .where(
      and(
        eq(challengeCompletionPeople.guestId, guestId),
        eq(challengeCompletionPeople.confirmationStatus, "UNVERIFIED"),
      ),
    )
    .orderBy(asc(challengeCompletionPeople.createdAt))
    .limit(MAX_PENDING_SHOWN);

  return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }));
}

export type VerificationAction = "confirm" | "dispute" | "skip";

export async function respondToVerification(
  personRowId: string,
  respondingGuestId: string,
  action: VerificationAction,
): Promise<void> {
  const [row] = await db
    .select({
      id: challengeCompletionPeople.id,
      guestId: challengeCompletionPeople.guestId,
      completionId: challengeCompletionPeople.completionId,
    })
    .from(challengeCompletionPeople)
    .where(eq(challengeCompletionPeople.id, personRowId))
    .limit(1);

  if (!row) throw new ApiError(404, "Not found", "That check has already been handled.");
  if (row.guestId !== respondingGuestId) {
    throw new ApiError(403, "Not yours", "That quick check isn't for you.");
  }

  const personStatus = action === "confirm" ? "CONFIRMED" : action === "dispute" ? "DISPUTED" : "SKIPPED";
  await db
    .update(challengeCompletionPeople)
    .set({ confirmationStatus: personStatus })
    .where(eq(challengeCompletionPeople.id, personRowId));

  if (action !== "skip") {
    await db
      .update(challengeCompletions)
      .set({ verificationStatus: action === "confirm" ? "CONFIRMED" : "DISPUTED" })
      .where(eq(challengeCompletions.id, row.completionId));
  }
}
