import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api";
import { requireParty } from "@/lib/guard";
import { getAwardRevealData } from "@/server/display";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const party = await requireParty(slug);
    if (!party.awardRevealActive) {
      return NextResponse.json({ active: false });
    }
    const data = await getAwardRevealData(party.id);
    return NextResponse.json({ active: true, ...data });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
