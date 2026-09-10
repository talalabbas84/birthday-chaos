import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ApiError, apiErrorResponse } from "@/lib/api";
import { requireGuest } from "@/lib/guard";
import { castVote } from "@/server/voting";

const bodySchema = z.object({
  questionId: z.string().uuid(),
  selectedGuestId: z.string().uuid(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const { party, guest } = await requireGuest(slug);
    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      throw new ApiError(400, "Invalid vote", "Pick someone from the list.");
    }

    await castVote({
      partyId: party.id,
      questionId: parsed.data.questionId,
      voterGuestId: guest.id,
      selectedGuestId: parsed.data.selectedGuestId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
