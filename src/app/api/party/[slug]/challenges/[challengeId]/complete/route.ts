import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ApiError, apiErrorResponse } from "@/lib/api";
import { requireGuest } from "@/lib/guard";
import { completeChallenge } from "@/server/challenges";

const personSchema = z
  .object({
    guestId: z.string().uuid().optional(),
    externalName: z.string().max(40).optional(),
  })
  .refine((p) => Boolean(p.guestId) !== Boolean(p.externalName?.trim()), {
    message: "Provide either a registered guest or an external name, not both.",
  });

const bodySchema = z.object({
  requestId: z.string().min(1).max(100),
  people: z.array(personSchema).max(6).default([]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; challengeId: string }> },
) {
  try {
    const { slug, challengeId } = await params;
    const { party, guest } = await requireGuest(slug);

    const rawBody = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(rawBody);
    if (!parsed.success) {
      throw new ApiError(400, "That didn't quite work", "Double-check what you selected and try again.");
    }

    const result = await completeChallenge({
      partyId: party.id,
      guestId: guest.id,
      challengeId,
      requestId: parsed.data.requestId,
      people: parsed.data.people,
    });

    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
