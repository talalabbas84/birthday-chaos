import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api";
import { requireGuest } from "@/lib/guard";
import { getVoteQuestionsForGuest } from "@/server/voting";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const { party, guest } = await requireGuest(slug);
    const questions = await getVoteQuestionsForGuest(party.id, guest.id);
    return NextResponse.json({ questions, votingOpen: party.votingOpen });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
