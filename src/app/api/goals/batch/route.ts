import { NextResponse } from "next/server";

import type { Goal } from "@/types";
import { createGoalsBatch } from "@/lib/workflows";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { goals?: Goal[] };
    if (!body.goals || body.goals.length === 0) {
      return NextResponse.json({ error: "At least one goal is required" }, { status: 400 });
    }

    const goals = await createGoalsBatch({ goals: body.goals });
    return NextResponse.json({ goals });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create goals";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

