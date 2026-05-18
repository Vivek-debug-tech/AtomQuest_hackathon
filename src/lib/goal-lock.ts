import { logGoalLock, logUnlockAction } from "@/lib/audit";
import { updateGoal } from "@/lib/supabase";
import type { Goal } from "@/types";

export type GoalLockAction = "lock" | "unlock";

export interface GoalLockMutationInput {
  goalId: string;
  action: GoalLockAction;
  performedById?: string;
  performedByName?: string;
  reason?: string;
  server?: boolean;
}

export async function setGoalLockState({
  goalId,
  action,
  performedById,
  performedByName,
  reason,
  server = true,
}: GoalLockMutationInput): Promise<Goal> {
  const isLocked = action === "lock";
  const now = new Date().toISOString().slice(0, 10);
  const updates: Record<string, unknown> = {
    is_locked: isLocked,
    approval_status: "Approved",
    last_updated: now,
  };

  if (isLocked) {
    updates.status = "On Track";
  }

  const updatedGoal = await updateGoal(
    goalId,
    updates,
    { server },
  );

  if (isLocked) {
    await logGoalLock({
      goalId,
      userId: performedById,
      userName: performedByName,
      reason,
    });
  } else {
    await logUnlockAction({
      goalId,
      userId: performedById,
      userName: performedByName,
      reason,
    });
  }

  return updatedGoal;
}

const goalLockApi = {
  setGoalLockState,
};

export default goalLockApi;
