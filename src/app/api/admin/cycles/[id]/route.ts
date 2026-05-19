import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/auth/session-server";
import { deleteAdminCycle, updateAdminCycle } from "@/lib/org-admin";

function ensureAdmin(session: Awaited<ReturnType<typeof getServerSession>>) {
  if (!session || session.role !== "Admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  return null;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    const denied = ensureAdmin(session);
    if (denied) return denied;

    const { id } = await context.params;
    const body = (await request.json()) as {
      key?: string;
      label?: string;
      opensOn?: string;
      closesOn?: string;
      action?: string;
      isActive?: boolean;
    };

    const updated = await updateAdminCycle(id, body);
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update cycle window";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    const denied = ensureAdmin(session);
    if (denied) return denied;

    const { id } = await context.params;
    await deleteAdminCycle(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete cycle window";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
