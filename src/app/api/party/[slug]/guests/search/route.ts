import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api";
import { requireGuest } from "@/lib/guard";
import { searchGuests } from "@/server/guests";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const { party, guest } = await requireGuest(slug);
    const query = request.nextUrl.searchParams.get("q") ?? "";
    const results = await searchGuests(party.id, query, guest.id);
    return NextResponse.json({ results });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
