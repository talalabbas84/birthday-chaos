import { NextResponse } from "next/server";

export class ApiError extends Error {
  status: number;
  title: string;

  constructor(status: number, title: string, message: string) {
    super(message);
    this.status = status;
    this.title = title;
  }
}

export function apiErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ title: error.title, message: error.message }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json(
    { title: "Something glitched", message: "Try that again in a second." },
    { status: 500 },
  );
}
