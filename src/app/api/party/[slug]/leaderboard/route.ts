import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api";
import { requireParty } from "@/lib/guard";
import { getCurrentGuest } from "@/lib/party";
import { getLeaderboard } from "@/server/leaderboard";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const party = await requireParty(slug);
    const guest = await getCurrentGuest(slug, party.id);
    const result = await getLeaderboard(party.id, guest?.id ?? null);
    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
