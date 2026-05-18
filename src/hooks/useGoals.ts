"use client";

import { useState } from "react";

import { mockGoals, mockGoalUpdates } from "@/data/mockData";
import { getAverageProgress, getCompletedGoals, getPendingCheckIns, getTotalWeightage } from "@/lib/calculations";
import type { Goal, GoalUpdate } from "@/types";

export function useGoals(initialGoals: Goal[] = mockGoals) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [updates, setUpdates] = useState<GoalUpdate[]>(mockGoalUpdates);

  const applyGoalPatch = (goalId: string, patch: Partial<Goal>) => {
    setGoals((current) => current.map((goal) => (goal.id === goalId ? { ...goal, ...patch } : goal)));
  };

  const addGoal = (goal: Goal) => {
    setGoals((current) => [...current, goal]);
  };

  const updateGoal = (goalId: string, patch: Partial<Goal>) => {
    setGoals((current) =>
      current.map((goal) => {
        if (goal.id !== goalId) return goal;
        if (goal.isLocked) return goal;
        return { ...goal, ...patch };
      }),
    );
  };

  const recordCheckIn = (goalId: string, update: GoalUpdate) => {
    setUpdates((current) => [update, ...current]);
    applyGoalPatch(goalId, {
      progress: update.progress,
      lastUpdated: update.updatedAt,
      status: update.progress >= 100 ? "Completed" : update.progress >= 65 ? "On Track" : "At Risk",
    });
  };

  return {
    goals,
    updates,
    addGoal,
    updateGoal,
    recordCheckIn,
    stats: {
      totalGoals: goals.length,
      averageProgress: getAverageProgress(goals),
      pendingCheckIns: getPendingCheckIns(goals),
      completedGoals: getCompletedGoals(goals).length,
      totalWeightage: getTotalWeightage(goals),
    },
  };
}