import { NextRequest, NextResponse } from "next/server";
import { ApiError, apiErrorResponse } from "@/lib/api";
import { requireParty } from "@/lib/guard";
import { getLevel } from "@/lib/levels";
import { setGuestSessionCookie } from "@/lib/session";
import { isDanceLevel, joinParty } from "@/server/guest-join";

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const party = await requireParty(slug);
    if (party.status === "ENDED") {
      throw new ApiError(409, "Party's over", "This party has already ended.");
    }

    const body = await request.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name : "";
    const danceLevel = body?.danceLevel;

    if (!name.trim()) {
      throw new ApiError(400, "What's your name?", "Type your name to join.");
    }
    if (!isDanceLevel(danceLevel)) {
      throw new ApiError(400, "Missing dance level", "Pick how dancey you are.");
    }

    const { guest, token } = await joinParty(party.id, name, danceLevel);
    await setGuestSessionCookie(slug, token);

    const level = getLevel(guest.points);
    return NextResponse.json({
      guest: {
        id: guest.id,
        name: guest.name,
        danceLevel: guest.danceLevel,
        points: guest.points,
      },
      level,
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
