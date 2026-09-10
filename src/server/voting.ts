import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { guests, parties, voteQuestions, votes } from "@/db/schema";
import { ApiError } from "@/lib/api";

export type VoteQuestionWithSelection = {
  id: string;
  title: string;
  description: string;
  selectedGuestId: string | null;
  selectedGuestName: string | null;
};

export async function getVoteQuestionsForGuest(
  partyId: string,
  guestId: string,
): Promise<VoteQuestionWithSelection[]> {
  const questions = await db
    .select()
    .from(voteQuestions)
    .where(eq(voteQuestions.partyId, partyId))
    .orderBy(voteQuestions.sortOrder);

  const myVotes = await db
    .select({
      questionId: votes.questionId,
      selectedGuestId: votes.selectedGuestId,
      selectedGuestName: guests.name,
    })
    .from(votes)
    .innerJoin(guests, eq(votes.selectedGuestId, guests.id))
    .where(and(eq(votes.partyId, partyId), eq(votes.voterGuestId, guestId)));

  const byQuestion = new Map(myVotes.map((v) => [v.questionId, v]));

  return questions.map((q) => {
    const mine = byQuestion.get(q.id);
    return {
      id: q.id,
      title: q.title,
      description: q.description,
      selectedGuestId: mine?.selectedGuestId ?? null,
      selectedGuestName: mine?.selectedGuestName ?? null,
    };
  });
}

export async function castVote(input: {
  partyId: string;
  questionId: string;
  voterGuestId: string;
  selectedGuestId: string;
}): Promise<void> {
  const [party] = await db.select().from(parties).where(eq(parties.id, input.partyId)).limit(1);
  if (!party) throw new ApiError(404, "Party not found", "This party doesn't exist.");
  if (!party.votingOpen) {
    throw new ApiError(409, "Democracy has ended.", "Results coming soon.");
  }

  if (input.voterGuestId === input.selectedGuestId) {
    throw new ApiError(400, "Absolutely not. 💀", "You cannot vote for yourself.");
  }

  const [question] = await db
    .select()
    .from(voteQuestions)
    .where(eq(voteQuestions.id, input.questionId))
    .limit(1);
  if (!question || question.partyId !== input.partyId) {
    throw new ApiError(404, "Question not found", "That question doesn't exist.");
  }

  const [selected] = await db.select().from(guests).where(eq(guests.id, input.selectedGuestId)).limit(1);
  if (!selected || selected.partyId !== input.partyId || !selected.active) {
    throw new ApiError(400, "Person unavailable", "That guest isn't in this party.");
  }

  await db
    .insert(votes)
    .values({
      partyId: input.partyId,
      questionId: input.questionId,
      voterGuestId: input.voterGuestId,
      selectedGuestId: input.selectedGuestId,
    })
    .onConflictDoUpdate({
      target: [votes.questionId, votes.voterGuestId],
      set: { selectedGuestId: input.selectedGuestId, updatedAt: new Date() },
    });
}
