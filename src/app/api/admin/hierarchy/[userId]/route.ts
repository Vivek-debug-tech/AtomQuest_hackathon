import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/auth/session-server";
import { removeOrgMember, upsertOrgMember } from "@/lib/org-admin";
import type { UserRole } from "@/types";

function ensureAdmin(session: Awaited<ReturnType<typeof getServerSession>>) {
  if (!session || session.role !== "Admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  return null;
}

export async function PATCH(request: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const session = await getServerSession();
    const denied = ensureAdmin(session);
    if (denied) return denied;

    const { userId } = await context.params;
    const body = (await request.json()) as {
      userName?: string;
      role?: UserRole;
      department?: string;
      managerId?: string;
      skipLevelManagerId?: string;
      isActive?: boolean;
    };

    if (!body.userName || !body.role || !body.department) {
      return NextResponse.json({ error: "userName, role, and department are required" }, { status: 400 });
    }

    const member = await upsertOrgMember(userId, {
      userName: body.userName,
      role: body.role,
      department: body.department,
      managerId: body.managerId,
      skipLevelManagerId: body.skipLevelManagerId,
      isActive: body.isActive,
    });

    return NextResponse.json(member);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update org member";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const session = await getServerSession();
    const denied = ensureAdmin(session);
    if (denied) return denied;

    const { userId } = await context.params;
    await removeOrgMember(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete org member";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
