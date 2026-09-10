import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api";
import { requireGuest } from "@/lib/guard";
import { getChallengesForGuest } from "@/server/challenge-list";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const { party, guest } = await requireGuest(slug);
    const challenges = await getChallengesForGuest(party.id, guest.id);
    return NextResponse.json({ challenges });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
