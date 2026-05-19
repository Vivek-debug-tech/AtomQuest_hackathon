import { NextResponse } from "next/server";

import { fetchHierarchy, upsertHierarchyNode } from "@/lib/admin-config";

export async function GET() {
  try {
    const hierarchy = await fetchHierarchy();
    return NextResponse.json({ hierarchy });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load hierarchy";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      userId: string;
      userName: string;
      role: "Employee" | "Manager" | "Admin";
      department: string;
      managerId?: string;
      managerName?: string;
      skipLevelId?: string;
      skipLevelName?: string;
      source: "manual" | "entra-sync";
    };
    const node = await upsertHierarchyNode(body);
    return NextResponse.json({ node });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save hierarchy node";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
