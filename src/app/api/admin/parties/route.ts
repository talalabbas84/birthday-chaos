import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api";
import { listPartiesForAdmin } from "@/server/admin";

export async function GET() {
  try {
    const parties = await listPartiesForAdmin();
    return NextResponse.json({ parties });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
