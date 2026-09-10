import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api";
import { requireHost } from "@/lib/guard";
import { resetGuestSession } from "@/server/host";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; guestId: string }> },
) {
  try {
    const { slug, guestId } = await params;
    const party = await requireHost(slug);
    await resetGuestSession(party.id, guestId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
