import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api";
import { syncNewChallenges } from "@/server/admin";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await syncNewChallenges(id);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
