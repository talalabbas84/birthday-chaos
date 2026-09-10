import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { challengeCompletionPeople, challengeCompletions, challenges, guests, parties } from "@/db/schema";
import { ApiError } from "@/lib/api";
import { getCrossedLevel, type Level } from "@/lib/levels";
import { cleanDisplayName, normalizeExternalName } from "@/lib/normalize";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type PersonInput = { guestId?: string; externalName?: string };

export type CompleteChallengeInput = {
  partyId: string;
  guestId: string;
  challengeId: string;
  requestId: string;
  people: PersonInput[];
};

export type CompleteChallengeResult = {
  pointsAwarded: number;
  totalPoints: number;
  levelUp: Level | null;
  challengeTitle: string;
  alreadySubmitted: boolean;
};

const UNIQUE_VIOLATION = "23505";

export async function completeChallenge(input: CompleteChallengeInput): Promise<CompleteChallengeResult> {
  const requestId = input.requestId?.trim();
  if (!requestId) {
    throw new ApiError(400, "Missing request id", "That request looked malformed. Try again.");
  }

  try {
    return await runCompletion(input, requestId);
  } catch (error) {
    if (isUniqueViolation(error, "completions_request_id_idx")) {
      // Same request landed twice (retry / double network send) — return the
      // original result instead of awarding points again.
      const existing = await loadExistingByRequestId(requestId);
      if (existing) return existing;
    }
    throw error;
  }
}

async function runCompletion(
  input: CompleteChallengeInput,
  requestId: string,
): Promise<CompleteChallengeResult> {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: challengeCompletions.id })
      .from(challengeCompletions)
      .where(eq(challengeCompletions.requestId, requestId))
      .limit(1);
    if (existing) {
      const result = await loadExistingByRequestId(requestId, tx);
      if (result) return result;
    }

    const [party] = await tx.select().from(parties).where(eq(parties.id, input.partyId)).limit(1);
    if (!party) throw new ApiError(404, "Party not found", "This party doesn't exist.");
    if (party.status !== "LIVE") {
      throw new ApiError(409, "Not right now", "Hang tight — the party isn't live right now.");
    }

    const [guest] = await tx.select().from(guests).where(eq(guests.id, input.guestId)).limit(1);
    if (!guest || guest.partyId !== input.partyId || !guest.active) {
      throw new ApiError(403, "Guest not found", "We couldn't find your profile for this party.");
    }

    const [challenge] = await tx.select().from(challenges).where(eq(challenges.id, input.challengeId)).limit(1);
    if (!challenge || challenge.partyId !== input.partyId || !challenge.active) {
      throw new ApiError(404, "Challenge not found", "That challenge isn't available anymore.");
    }

    const [{ count: existingCount }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(challengeCompletions)
      .where(
        and(
          eq(challengeCompletions.guestId, guest.id),
          eq(challengeCompletions.challengeId, challenge.id),
        ),
      );
    if (existingCount >= challenge.maxCompletions) {
      throw new ApiError(
        409,
        "ENOUGH 😂",
        `You've already done this one ${challenge.maxCompletions} time${challenge.maxCompletions === 1 ? "" : "s"}.`,
      );
    }

    const candidates = await resolvePeople(tx, party.id, guest.id, input.people);

    if (challenge.requiresPerson && candidates.length === 0) {
      throw new ApiError(400, "Who was it with?", "This one needs at least one other person.");
    }

    if (challenge.uniquePersonRequired && candidates.length > 0) {
      const priorPeople = await tx
        .select({
          guestId: challengeCompletionPeople.guestId,
          normalizedExternalName: challengeCompletionPeople.normalizedExternalName,
        })
        .from(challengeCompletionPeople)
        .innerJoin(
          challengeCompletions,
          eq(challengeCompletionPeople.completionId, challengeCompletions.id),
        )
        .where(
          and(
            eq(challengeCompletions.guestId, guest.id),
            eq(challengeCompletions.challengeId, challenge.id),
          ),
        );

      for (const candidate of candidates) {
        const reused = priorPeople.some((prior) =>
          candidate.guestId
            ? prior.guestId === candidate.guestId
            : prior.normalizedExternalName === candidate.normalizedExternalName,
        );
        if (reused) {
          throw new ApiError(
            409,
            "Nice try 👀",
            `You've already counted ${candidate.displayName} for this one. Pick somebody new.`,
          );
        }
      }
    }

    const [completion] = await tx
      .insert(challengeCompletions)
      .values({
        partyId: party.id,
        guestId: guest.id,
        challengeId: challenge.id,
        requestId,
        pointsAwarded: challenge.points,
        verificationStatus: candidates.some((c) => c.guestId) ? "UNVERIFIED" : "NOT_REQUIRED",
      })
      .returning();

    if (candidates.length > 0) {
      await tx.insert(challengeCompletionPeople).values(
        candidates.map((c) => ({
          completionId: completion.id,
          guestId: c.guestId ?? null,
          externalPersonName: c.externalName ?? null,
          normalizedExternalName: c.normalizedExternalName ?? null,
          confirmationStatus: c.guestId ? ("UNVERIFIED" as const) : ("NOT_REQUIRED" as const),
        })),
      );
    }

    const [updatedGuest] = await tx
      .update(guests)
      .set({ points: sql`${guests.points} + ${challenge.points}` })
      .where(eq(guests.id, guest.id))
      .returning({ points: guests.points });

    const levelUp = getCrossedLevel(guest.points, updatedGuest.points);

    return {
      pointsAwarded: challenge.points,
      totalPoints: updatedGuest.points,
      levelUp,
      challengeTitle: challenge.title,
      alreadySubmitted: false,
    };
  });
}

type ResolvedPerson = {
  guestId?: string;
  externalName?: string;
  normalizedExternalName?: string;
  displayName: string;
};

async function resolvePeople(
  tx: Tx,
  partyId: string,
  actingGuestId: string,
  people: PersonInput[],
): Promise<ResolvedPerson[]> {
  const registeredIds = Array.from(
    new Set(people.map((p) => p.guestId).filter((id): id is string => Boolean(id))),
  );

  const nameById = new Map<string, string>();
  if (registeredIds.length > 0) {
    const rows = await tx
      .select({ id: guests.id, name: guests.name, partyId: guests.partyId, active: guests.active })
      .from(guests)
      .where(inArray(guests.id, registeredIds));

    for (const row of rows) {
      if (row.partyId !== partyId || !row.active) {
        throw new ApiError(400, "Person unavailable", "One of the people you picked isn't in this party.");
      }
      nameById.set(row.id, row.name);
    }
    for (const id of registeredIds) {
      if (!nameById.has(id)) {
        throw new ApiError(400, "Person not found", "One of the people you picked couldn't be found.");
      }
      if (id === actingGuestId) {
        throw new ApiError(400, "Absolutely not 💀", "You can't pick yourself for this one.");
      }
    }
  }

  const resolved: ResolvedPerson[] = [];
  const seenGuestIds = new Set<string>();
  const seenExternal = new Set<string>();

  for (const person of people) {
    if (person.guestId) {
      if (seenGuestIds.has(person.guestId)) continue;
      seenGuestIds.add(person.guestId);
      resolved.push({ guestId: person.guestId, displayName: nameById.get(person.guestId) ?? "them" });
    } else if (person.externalName?.trim()) {
      const displayName = cleanDisplayName(person.externalName);
      const normalized = normalizeExternalName(person.externalName);
      if (!normalized) continue;
      if (seenExternal.has(normalized)) continue;
      seenExternal.add(normalized);
      resolved.push({ externalName: displayName, normalizedExternalName: normalized, displayName });
    }
  }

  return resolved;
}

async function loadExistingByRequestId(
  requestId: string,
  tx?: Tx,
): Promise<CompleteChallengeResult | null> {
  const client = tx ?? db;
  const [row] = await client
    .select({
      pointsAwarded: challengeCompletions.pointsAwarded,
      challengeTitle: challenges.title,
      totalPoints: guests.points,
    })
    .from(challengeCompletions)
    .innerJoin(challenges, eq(challengeCompletions.challengeId, challenges.id))
    .innerJoin(guests, eq(challengeCompletions.guestId, guests.id))
    .where(eq(challengeCompletions.requestId, requestId))
    .limit(1);

  if (!row) return null;
  return {
    pointsAwarded: row.pointsAwarded,
    totalPoints: row.totalPoints,
    levelUp: null,
    challengeTitle: row.challengeTitle,
    alreadySubmitted: true,
  };
}

function isUniqueViolation(error: unknown, constraintHint: string): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; constraint?: string; message?: string };
  if (err.code !== UNIQUE_VIOLATION) return false;
  return err.constraint === constraintHint || err.message?.includes(constraintHint) === true;
}
