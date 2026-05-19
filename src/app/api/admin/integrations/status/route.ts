import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/auth/session-server";
import { getIntegrationAdapterStatus } from "@/lib/integration-adapters";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || session.role !== "Admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    return NextResponse.json({ adapters: getIntegrationAdapterStatus() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load integration status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
