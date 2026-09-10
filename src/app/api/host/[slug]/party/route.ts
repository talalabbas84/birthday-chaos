import { NextRequest, NextResponse } from "next/server";
import { ApiError, apiErrorResponse } from "@/lib/api";
import { requireHost } from "@/lib/guard";
import { setPartyStatus, type PartyStatusInput } from "@/server/host";

const VALID_STATUSES: PartyStatusInput[] = ["UPCOMING", "LIVE", "PAUSED", "ENDED"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const party = await requireHost(slug);
    const body = await request.json().catch(() => null);
    const status = body?.status;

    if (!VALID_STATUSES.includes(status)) {
      throw new ApiError(400, "Invalid status", "That's not a valid party status.");
    }

    await setPartyStatus(party.id, status);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
