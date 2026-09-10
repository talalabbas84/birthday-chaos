import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// These exercise the real database-backed business rules (max completions,
// unique-person dedupe, idempotent completions, self-vote prevention,
// editable one-vote-per-question, quick-check authorization). They need a
// disposable Postgres to run against — point TEST_DATABASE_URL at a scratch
// Neon branch (or any throwaway Postgres) to enable them; otherwise this
// whole suite is skipped rather than failing the run.
const TEST_DB_URL = process.env.TEST_DATABASE_URL;

describe.skipIf(!TEST_DB_URL)("business rules (integration)", () => {
  let db: typeof import("@/db/client").db;
  let schema: typeof import("@/db/schema");
  let completeChallenge: typeof import("@/server/challenges").completeChallenge;
  let castVote: typeof import("@/server/voting").castVote;
  let respondToVerification: typeof import("@/server/verification").respondToVerification;

  let partyId: string;
  let guestA: string;
  let guestB: string;
  let guestC: string;
  let soloChallengeId: string;
  let maxTwoChallengeId: string;
  let uniquePersonChallengeId: string;
  let personChallengeId: string;
  let questionId: string;

  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DB_URL;
    ({ db } = await import("@/db/client"));
    schema = await import("@/db/schema");
    ({ completeChallenge } = await import("@/server/challenges"));
    ({ castVote } = await import("@/server/voting"));
    ({ respondToVerification } = await import("@/server/verification"));

    const [party] = await db
      .insert(schema.parties)
      .values({
        name: "Test Party",
        slug: `test-party-${Math.random().toString(36).slice(2)}`,
        status: "LIVE",
        votingOpen: true,
      })
      .returning();
    partyId = party.id;

    const guestRows = await db
      .insert(schema.guests)
      .values([
        { partyId, name: "Guest A", danceLevel: "SALSA_DANCER" },
        { partyId, name: "Guest B", danceLevel: "DANCES_A_LITTLE" },
        { partyId, name: "Guest C", danceLevel: "DOES_NOT_REALLY_DANCE" },
      ])
      .returning();
    [guestA, guestB, guestC] = guestRows.map((g) => g.id);

    const challengeRows = await db
      .insert(schema.challenges)
      .values([
        { partyId, title: "Solo", description: "d", category: "EASY", points: 10, maxCompletions: 1, requiresPerson: false },
        { partyId, title: "Max two", description: "d", category: "EASY", points: 20, maxCompletions: 2, requiresPerson: false },
        {
          partyId,
          title: "Unique person",
          description: "d",
          category: "EASY",
          points: 25,
          maxCompletions: 5,
          requiresPerson: true,
          uniquePersonRequired: true,
        },
        { partyId, title: "With person", description: "d", category: "DANCE", points: 50, maxCompletions: 5, requiresPerson: true },
      ])
      .returning();
    soloChallengeId = challengeRows[0].id;
    maxTwoChallengeId = challengeRows[1].id;
    uniquePersonChallengeId = challengeRows[2].id;
    personChallengeId = challengeRows[3].id;

    const [question] = await db
      .insert(schema.voteQuestions)
      .values({ partyId, title: "Test Question", description: "d", sortOrder: 0 })
      .returning();
    questionId = question.id;
  });

  afterAll(async () => {
    if (partyId) await db.delete(schema.parties).where(eq(schema.parties.id, partyId));
  });

  it("awards exactly the challenge's own point value, never a client-supplied one", async () => {
    const result = await completeChallenge({
      partyId,
      guestId: guestA,
      challengeId: soloChallengeId,
      requestId: "req-points",
      people: [],
    });
    expect(result.pointsAwarded).toBe(10);
    expect(result.totalPoints).toBe(10);
  });

  it("enforces maxCompletions server-side", async () => {
    await completeChallenge({ partyId, guestId: guestB, challengeId: maxTwoChallengeId, requestId: "req-max-1", people: [] });
    await completeChallenge({ partyId, guestId: guestB, challengeId: maxTwoChallengeId, requestId: "req-max-2", people: [] });
    await expect(
      completeChallenge({ partyId, guestId: guestB, challengeId: maxTwoChallengeId, requestId: "req-max-3", people: [] }),
    ).rejects.toThrow();
  });

  it("is idempotent on a repeated request id — no duplicate points", async () => {
    const first = await completeChallenge({
      partyId,
      guestId: guestC,
      challengeId: soloChallengeId,
      requestId: "req-idempotent",
      people: [],
    });
    const second = await completeChallenge({
      partyId,
      guestId: guestC,
      challengeId: soloChallengeId,
      requestId: "req-idempotent",
      people: [],
    });
    expect(second.alreadySubmitted).toBe(true);
    expect(second.totalPoints).toBe(first.totalPoints);
  });

  it("blocks reusing the same registered person for a uniquePersonRequired challenge", async () => {
    await completeChallenge({
      partyId,
      guestId: guestA,
      challengeId: uniquePersonChallengeId,
      requestId: "req-unique-1",
      people: [{ guestId: guestB }],
    });
    await expect(
      completeChallenge({
        partyId,
        guestId: guestA,
        challengeId: uniquePersonChallengeId,
        requestId: "req-unique-2",
        people: [{ guestId: guestB }],
      }),
    ).rejects.toThrow();
  });

  it("normalizes external names for the uniquePersonRequired dedupe check", async () => {
    await completeChallenge({
      partyId,
      guestId: guestB,
      challengeId: uniquePersonChallengeId,
      requestId: "req-unique-ext-1",
      people: [{ externalName: "Chris" }],
    });
    await expect(
      completeChallenge({
        partyId,
        guestId: guestB,
        challengeId: uniquePersonChallengeId,
        requestId: "req-unique-ext-2",
        people: [{ externalName: " CHRIS " }],
      }),
    ).rejects.toThrow();
  });

  it("marks a person-linked completion UNVERIFIED, and only the named person can respond", async () => {
    const result = await completeChallenge({
      partyId,
      guestId: guestA,
      challengeId: personChallengeId,
      requestId: "req-verify-1",
      people: [{ guestId: guestC }],
    });
    expect(result.pointsAwarded).toBe(50);

    const [personRow] = await db
      .select()
      .from(schema.challengeCompletionPeople)
      .where(eq(schema.challengeCompletionPeople.guestId, guestC));
    expect(personRow.confirmationStatus).toBe("UNVERIFIED");

    await expect(respondToVerification(personRow.id, guestA, "confirm")).rejects.toThrow();
    await respondToVerification(personRow.id, guestC, "confirm");

    const [completion] = await db
      .select()
      .from(schema.challengeCompletions)
      .where(eq(schema.challengeCompletions.id, personRow.completionId));
    expect(completion.verificationStatus).toBe("CONFIRMED");
  });

  it("prevents voting for yourself", async () => {
    await expect(castVote({ partyId, questionId, voterGuestId: guestA, selectedGuestId: guestA })).rejects.toThrow();
  });

  it("allows exactly one vote per question per guest, editable via upsert", async () => {
    await castVote({ partyId, questionId, voterGuestId: guestA, selectedGuestId: guestB });
    await castVote({ partyId, questionId, voterGuestId: guestA, selectedGuestId: guestC });

    const rows = await db.select().from(schema.votes).where(eq(schema.votes.voterGuestId, guestA));
    expect(rows).toHaveLength(1);
    expect(rows[0].selectedGuestId).toBe(guestC);
  });
});
