import type { Goal } from "@/types";
import type { GoalLockAction } from "@/lib/goal-lock";

export interface GoalLockClientPayload {
  action: GoalLockAction;
  performedById?: string;
  performedByName?: string;
  reason?: string;
}

export interface GoalLockClientResponse {
  goal: Goal;
}

export async function mutateGoalLockState(goalId: string, payload: GoalLockClientPayload): Promise<GoalLockClientResponse> {
  const response = await fetch(`/api/goals/${goalId}/lock-state`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(errorBody?.error ?? "Failed to update goal lock state");
  }

  return (await response.json()) as GoalLockClientResponse;
}

export default mutateGoalLockState;
