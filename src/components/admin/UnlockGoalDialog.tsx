"use client";

import { useState } from "react";
import { Unlock, AlertCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Goal } from "@/types";

export function UnlockGoalDialog({
  open,
  onOpenChange,
  goal,
  onUnlock,
  isLoading = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  onUnlock: (goalId: string, reason: string) => void;
  isLoading?: boolean;
}) {
  const [reason, setReason] = useState("");

  if (!goal) return null;

  const handleUnlock = () => {
    if (!reason.trim()) return;
    onUnlock(goal.id, reason);
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Unlock Goal</DialogTitle>
          <DialogDescription>
            Unlock this approved goal to allow the employee to make further edits.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              This will allow edits to an approved goal. Lock status will be removed.
            </AlertDescription>
          </Alert>

          <div className="rounded-lg bg-slate-50 p-4 space-y-2">
            <p className="text-xs font-medium text-slate-600">GOAL DETAILS</p>
            <div>
              <p className="font-semibold text-slate-950">{goal.title}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-slate-100">
                  {goal.thrustArea}
                </Badge>
                <Badge variant="outline" className="bg-slate-100">
                  Target: {goal.target}
                </Badge>
                <Badge variant={goal.isLocked ? "destructive" : "secondary"}>
                  {goal.isLocked ? "Locked" : "Unlocked"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Unlock Reason (Required)</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this goal needs to be unlocked for audit purposes..."
              className="min-h-24 resize-none border-slate-200"
            />
            <p className="text-xs text-slate-500">{reason.length} / 500 characters</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleUnlock}
            disabled={!reason.trim() || isLoading}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Unlock className="mr-2 h-4 w-4" />
            {isLoading ? "Unlocking..." : "Unlock Goal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
