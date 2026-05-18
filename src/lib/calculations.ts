import type { Goal } from "@/types";

export type GoalEvaluationMode = "higher-is-better" | "lower-is-better" | "zero-based" | "timeline";

export function calculateGoalProgress({
  mode,
  achievement,
  target,
  deadline,
  completedAt,
}: {
  mode: GoalEvaluationMode;
  achievement: number;
  target: number;
  deadline?: string;
  completedAt?: string;
}) {
  if (mode === "zero-based") {
    return achievement === 0 ? 100 : 0;
  }

  if (mode === "lower-is-better") {
    if (achievement <= 0) return 100;
    return Math.min(100, Math.round((target / achievement) * 100));
  }

  if (mode === "timeline") {
    if (!deadline || !completedAt) return 0;
    const due = new Date(deadline).getTime();
    const done = new Date(completedAt).getTime();
    if (Number.isNaN(due) || Number.isNaN(done)) return 0;
    return done <= due ? 100 : 0;
  }

  if (target <= 0) return 0;
  return Math.min(100, Math.round((achievement / target) * 100));
}

export function getAverageProgress(goals: Goal[]) {
  if (goals.length === 0) return 0;

  return Math.round(
    goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length,
  );
}

export function getCompletedGoals(goals: Goal[]) {
  return goals.filter((goal) => goal.status === "Completed");
}

export function getPendingCheckIns(goals: Goal[]) {
  return goals.filter((goal) => goal.status !== "Completed").length;
}

export function getTotalWeightage(goals: Goal[]) {
  return goals.reduce((sum, goal) => sum + goal.weightage, 0);
}

export function getWeightageBalance(goals: Goal[]) {
  return Math.max(0, 100 - getTotalWeightage(goals));
}