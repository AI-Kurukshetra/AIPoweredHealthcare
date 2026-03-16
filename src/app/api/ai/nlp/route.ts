import { NextRequest, NextResponse } from "next/server";
import { extractClinicalDataFromNote } from "@/lib/ai/noteNLP";

export async function POST(req: NextRequest) {
  try {
    const { note } = await req.json();
    if (!note) return NextResponse.json({ error: "Note is required" }, { status: 400 });

    const result = await extractClinicalDataFromNote(note);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

