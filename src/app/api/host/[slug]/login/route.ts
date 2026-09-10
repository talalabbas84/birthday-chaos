import { NextRequest, NextResponse } from "next/server";
import { ApiError, apiErrorResponse } from "@/lib/api";
import { requireParty } from "@/lib/guard";
import { checkHostPasscode, setHostSessionCookie } from "@/lib/host-auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    await requireParty(slug);
    const body = await request.json().catch(() => null);
    const passcode = typeof body?.passcode === "string" ? body.passcode : "";

    if (!passcode || !checkHostPasscode(passcode)) {
      throw new ApiError(401, "Wrong passcode", "That passcode isn't right.");
    }

    await setHostSessionCookie(slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
