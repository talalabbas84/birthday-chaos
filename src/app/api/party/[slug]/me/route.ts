import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api";
import { requireParty } from "@/lib/guard";
import { getLevel } from "@/lib/levels";
import { getCurrentGuest } from "@/lib/party";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const party = await requireParty(slug);
    const guest = await getCurrentGuest(slug, party.id);

    if (!guest) {
      return NextResponse.json({ guest: null, party: { status: party.status } });
    }

    return NextResponse.json({
      guest: {
        id: guest.id,
        name: guest.name,
        danceLevel: guest.danceLevel,
        points: guest.points,
      },
      level: getLevel(guest.points),
      party: { status: party.status, votingOpen: party.votingOpen },
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
