import { NextResponse } from "next/server";

import { updateApproval } from "@/lib/workflows";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = (await request.json()) as {
      action?: "approve" | "reject" | "return";
      comments?: string;
      target?: string;
      weightage?: number;
    };

    if (!body.action) {
      return NextResponse.json({ error: "`action` is required" }, { status: 400 });
    }

    const result = await updateApproval({
      approvalId: id,
      action: body.action,
      comments: body.comments,
      target: body.target,
      weightage: body.weightage,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update approval";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

