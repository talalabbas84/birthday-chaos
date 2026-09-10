import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api";
import { reseedPartyFromScratch } from "@/server/admin";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const slug = await reseedPartyFromScratch(id);
    return NextResponse.json({ ok: true, slug });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
