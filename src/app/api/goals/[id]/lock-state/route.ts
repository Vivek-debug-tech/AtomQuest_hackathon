import { NextResponse } from "next/server";

import { setGoalLockState } from "@/lib/goal-lock";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = (await request.json()) as {
      action?: "lock" | "unlock";
      performedById?: string;
      performedByName?: string;
      reason?: string;
    };

    if (!body.action) {
      return NextResponse.json({ error: "`action` is required" }, { status: 400 });
    }

    const goal = await setGoalLockState({
      goalId: id,
      action: body.action,
      performedById: body.performedById,
      performedByName: body.performedByName,
      reason: body.reason,
      server: true,
    });

    return NextResponse.json({ goal });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update goal lock state";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
