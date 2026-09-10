import { NextRequest, NextResponse } from "next/server";
import { ApiError, apiErrorResponse } from "@/lib/api";
import { requireHost } from "@/lib/guard";
import { startAwardReveal, stopAwardReveal } from "@/server/host";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const party = await requireHost(slug);
    const body = await request.json().catch(() => null);
    if (typeof body?.active !== "boolean") {
      throw new ApiError(400, "Invalid input", "Expected an active flag.");
    }

    if (body.active) {
      await startAwardReveal(party.id);
    } else {
      await stopAwardReveal(party.id);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
