"use client";

import { useState } from "react";

import type { CycleConfig } from "@/lib/admin-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toastNotifications } from "@/lib/toast-notifications";

export function CycleManagementPanel({
  cycles,
  onSaved,
}: {
  cycles: CycleConfig[];
  onSaved: () => Promise<void> | void;
}) {
  const [draft, setDraft] = useState<CycleConfig | null>(cycles[0] ?? null);

  const save = async () => {
    if (!draft) return;
    const response = await fetch("/api/admin/cycles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      toastNotifications.error("Cycle save failed", body?.error);
      return;
    }
    toastNotifications.success("Cycle configuration saved.");
    await onSaved();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Cycle Windows</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {cycles.map((cycle) => (
            <button
              key={cycle.id}
              type="button"
              onClick={() => setDraft(cycle)}
              className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                draft?.id === cycle.id ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50 text-slate-900"
              }`}
            >
              <p className="font-medium">{cycle.label}</p>
              <p className={`mt-1 text-xs ${draft?.id === cycle.id ? "text-slate-200" : "text-slate-500"}`}>{cycle.opensOn}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Edit Selected Cycle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {draft ? (
            <>
              <div className="space-y-2">
                <Label>Label</Label>
                <Input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Open Date</Label>
                <Input type="date" value={draft.opensOn} onChange={(e) => setDraft({ ...draft, opensOn: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Action</Label>
                <Input value={draft.action} onChange={(e) => setDraft({ ...draft, action: e.target.value })} />
              </div>
              <Button onClick={() => void save()}>Save Cycle</Button>
            </>
          ) : (
            <p className="text-sm text-slate-500">No cycle selected.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
