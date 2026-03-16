import { NextRequest, NextResponse } from "next/server";
import { optimizeRoute } from "@/lib/ai/routeOptimization";

export async function POST(req: NextRequest) {
  try {
    const { visits, startLocation } = await req.json();
    if (!visits || !Array.isArray(visits)) return NextResponse.json({ error: "Visits array required" }, { status: 400 });

    const result = await optimizeRoute(visits, startLocation);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
