import { NextResponse } from "next/server";

import { pushSharedGoal } from "@/lib/workflows";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      sourceGoalId?: string;
      recipients?: Array<{ userId: string; ownerName: string; department?: string }>;
    };

    if (!body.sourceGoalId || !body.recipients || body.recipients.length === 0) {
      return NextResponse.json({ error: "Source goal and recipients are required" }, { status: 400 });
    }

    const result = await pushSharedGoal({
      sourceGoalId: body.sourceGoalId,
      recipients: body.recipients,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create shared goals";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
