"use client";

import { useState } from "react";

import type { HierarchyNode } from "@/lib/admin-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toastNotifications } from "@/lib/toast-notifications";

export function HierarchyManagementPanel({
  hierarchy,
  onSaved,
}: {
  hierarchy: HierarchyNode[];
  onSaved: () => Promise<void> | void;
}) {
  const [draft, setDraft] = useState<HierarchyNode | null>(hierarchy[0] ?? null);

  const save = async () => {
    if (!draft) return;
    const response = await fetch("/api/admin/hierarchy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      toastNotifications.error("Hierarchy save failed", body?.error);
      return;
    }
    toastNotifications.success("Hierarchy mapping saved.");
    await onSaved();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Hierarchy Nodes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {hierarchy.map((node) => (
            <button
              key={node.id}
              type="button"
              onClick={() => setDraft(node)}
              className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                draft?.id === node.id ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50 text-slate-900"
              }`}
            >
              <p className="font-medium">{node.userName}</p>
              <p className={`mt-1 text-xs ${draft?.id === node.id ? "text-slate-200" : "text-slate-500"}`}>{node.role} • {node.department}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Edit Hierarchy Mapping</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {draft ? (
            <>
              <div className="space-y-2">
                <Label>User Name</Label>
                <Input value={draft.userName} onChange={(e) => setDraft({ ...draft, userName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input value={draft.department} onChange={(e) => setDraft({ ...draft, department: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Manager ID</Label>
                <Input value={draft.managerId ?? ""} onChange={(e) => setDraft({ ...draft, managerId: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Skip Level ID</Label>
                <Input value={draft.skipLevelId ?? ""} onChange={(e) => setDraft({ ...draft, skipLevelId: e.target.value })} />
              </div>
              <Button onClick={() => void save()}>Save Hierarchy</Button>
            </>
          ) : (
            <p className="text-sm text-slate-500">No hierarchy node selected.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
