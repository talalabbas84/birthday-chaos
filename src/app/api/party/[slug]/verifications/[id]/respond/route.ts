import { NextRequest, NextResponse } from "next/server";
import { ApiError, apiErrorResponse } from "@/lib/api";
import { requireGuest } from "@/lib/guard";
import { respondToVerification, type VerificationAction } from "@/server/verification";

const VALID_ACTIONS: VerificationAction[] = ["confirm", "dispute", "skip"];

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
  try {
    const { slug, id } = await params;
    const { guest } = await requireGuest(slug);
    const body = await request.json().catch(() => null);
    const action = body?.action;

    if (!VALID_ACTIONS.includes(action)) {
      throw new ApiError(400, "Invalid action", "That quick check response isn't valid.");
    }

    await respondToVerification(id, guest.id, action);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
