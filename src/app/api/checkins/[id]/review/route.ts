import { NextResponse } from "next/server";

import { reviewCheckin } from "@/lib/workflows";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = (await request.json()) as { managerComments?: string };
    if (!body.managerComments) {
      return NextResponse.json({ error: "`managerComments` is required" }, { status: 400 });
    }

    const checkin = await reviewCheckin({
      checkinId: id,
      managerComments: body.managerComments,
    });

    return NextResponse.json({ checkin });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to review check-in";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
