import { NextResponse } from "next/server";

import { fetchCycleConfigs, upsertCycleConfig } from "@/lib/admin-config";

export async function GET() {
  try {
    const cycles = await fetchCycleConfigs();
    return NextResponse.json({ cycles });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load cycles";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      cycleKey: string;
      label: string;
      opensOn: string;
      closesOn?: string;
      action: string;
      isActive: boolean;
    };
    const cycle = await upsertCycleConfig(body);
    return NextResponse.json({ cycle });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save cycle";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
