import { NextResponse } from "next/server";

import type { GoalCheckIn } from "@/types";
import { submitCheckin } from "@/lib/workflows";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      goalId?: string;
      actualAchievement?: number;
      status?: GoalCheckIn["status"];
      comments?: string;
    };

    if (!body.goalId || typeof body.actualAchievement !== "number" || !body.status || !body.comments) {
      return NextResponse.json({ error: "Invalid check-in payload" }, { status: 400 });
    }

    const checkin = await submitCheckin({
      goalId: body.goalId,
      actualAchievement: body.actualAchievement,
      status: body.status,
      comments: body.comments,
    });

    return NextResponse.json({ checkin });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit check-in";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

