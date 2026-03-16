import { NextRequest, NextResponse } from "next/server";
import { predictStaffNeeds } from "@/lib/ai/staffPrediction";

export async function GET(req: NextRequest) {
  try {
    const days = Number(req.nextUrl.searchParams.get("days")) || 7;
    const result = await predictStaffNeeds(days);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
