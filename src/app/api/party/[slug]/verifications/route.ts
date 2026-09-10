import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api";
import { requireGuest } from "@/lib/guard";
import { listPendingVerifications } from "@/server/verification";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const { guest } = await requireGuest(slug);
    const pending = await listPendingVerifications(guest.id);
    return NextResponse.json({ pending });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
