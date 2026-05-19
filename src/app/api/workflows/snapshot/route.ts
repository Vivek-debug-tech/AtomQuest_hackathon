import { NextResponse } from "next/server";

import { getWorkflowSnapshot } from "@/lib/workflows";

export async function GET() {
  try {
    const snapshot = await getWorkflowSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load workflow snapshot";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

