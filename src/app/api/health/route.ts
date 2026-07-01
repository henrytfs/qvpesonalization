import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "quaviet-personalization",
    timestamp: new Date().toISOString(),
  });
}
