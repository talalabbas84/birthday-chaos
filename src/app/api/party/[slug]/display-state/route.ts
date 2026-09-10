import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api";
import { requireParty } from "@/lib/guard";
import { getDisplayState } from "@/server/display";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const party = await requireParty(slug);
    const state = await getDisplayState(party.id);
    return NextResponse.json(state);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
