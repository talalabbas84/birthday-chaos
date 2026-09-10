import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api";
import { requireParty } from "@/lib/guard";
import { getCurrentGuest } from "@/lib/party";
import { clearGuestSessionCookie } from "@/lib/session";
import { switchGuestSession } from "@/server/guest-join";

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const party = await requireParty(slug);
    const guest = await getCurrentGuest(slug, party.id);
    if (guest) {
      await switchGuestSession(guest.id);
    }
    await clearGuestSessionCookie(slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
