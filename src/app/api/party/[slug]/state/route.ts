import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api";
import { requireParty } from "@/lib/guard";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const party = await requireParty(slug);
    return NextResponse.json({
      status: party.status,
      votingOpen: party.votingOpen,
      awardRevealActive: party.awardRevealActive,
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
