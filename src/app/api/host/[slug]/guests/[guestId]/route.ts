import { NextRequest, NextResponse } from "next/server";
import { ApiError, apiErrorResponse } from "@/lib/api";
import { requireHost } from "@/lib/guard";
import { adjustGuestPoints, setGuestActive } from "@/server/host";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; guestId: string }> },
) {
  try {
    const { slug, guestId } = await params;
    const party = await requireHost(slug);
    const body = await request.json().catch(() => null);

    if (typeof body?.active === "boolean") {
      await setGuestActive(party.id, guestId, body.active);
    }
    if (typeof body?.pointsDelta === "number" && Number.isFinite(body.pointsDelta)) {
      await adjustGuestPoints(party.id, guestId, Math.trunc(body.pointsDelta));
    }
    if (typeof body?.active !== "boolean" && typeof body?.pointsDelta !== "number") {
      throw new ApiError(400, "Nothing to update", "Provide active or pointsDelta.");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
