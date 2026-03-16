import { NextRequest, NextResponse } from "next/server";
import { predictPatientRisk } from "@/lib/ai/patientRiskPrediction";

export async function POST(req: NextRequest) {
  try {
    const { vitals, age } = await req.json();
    if (!vitals) return NextResponse.json({ error: "Vitals required" }, { status: 400 });

    const result = await predictPatientRisk(vitals, age);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
