"use client";

import { useMemo, useState } from "react";
import { Share2 } from "lucide-react";

import type { Goal, TeamMemberSummary } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SharedGoalDialog({
  open,
  onOpenChange,
  goals,
  team,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goals: Goal[];
  team: TeamMemberSummary[];
  onSubmit: (payload: { sourceGoalId: string; recipients: Array<{ userId: string; ownerName: string; department?: string }> }) => Promise<void> | void;
}) {
  const [sourceGoalId, setSourceGoalId] = useState(goals[0]?.id ?? "");
  const [recipientIds, setRecipientIds] = useState("");

  const selectedGoal = useMemo(() => goals.find((goal) => goal.id === sourceGoalId), [goals, sourceGoalId]);

  const handleSubmit = async () => {
    const recipients = team
      .filter((member) => recipientIds.split(",").map((value) => value.trim()).includes(member.id))
      .map((member) => ({ userId: member.id, ownerName: member.name, department: member.department }));

    if (!sourceGoalId || recipients.length === 0) return;
    await onSubmit({ sourceGoalId, recipients });
    setRecipientIds("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Push Shared Goal</DialogTitle>
          <DialogDescription>
            Create linked goal sheets for multiple employees. Recipients can adjust weightage only; title and target remain read-only.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Source Goal ID</Label>
            <Input value={sourceGoalId} onChange={(event) => setSourceGoalId(event.target.value)} placeholder="Enter the goal ID to share" />
            {selectedGoal ? (
              <p className="text-xs text-slate-500">
                {selectedGoal.title} • Target: {selectedGoal.target}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Recipient IDs</Label>
            <Input
              value={recipientIds}
              onChange={(event) => setRecipientIds(event.target.value)}
              placeholder="Comma-separated employee ids, e.g. user-002,user-003"
            />
            <p className="text-xs text-slate-500">Available recipients: {team.map((member) => `${member.id} (${member.name})`).join(", ")}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void handleSubmit()}>
            <Share2 className="mr-2 h-4 w-4" />
            Push Shared Goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
