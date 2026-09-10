import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api";
import { requireHost } from "@/lib/guard";
import { listGuestsForHost } from "@/server/host";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const party = await requireHost(slug);
    const guestList = await listGuestsForHost(party.id);
    return NextResponse.json({
      party: {
        name: party.name,
        status: party.status,
        votingOpen: party.votingOpen,
        awardRevealActive: party.awardRevealActive,
      },
      guests: guestList,
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
