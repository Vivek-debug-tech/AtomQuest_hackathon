"use client";

import MultiGoalForm from "@/components/forms/MultiGoalForm";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EmptyState } from "@/components/shared/EmptyState";
import { GoalCard } from "@/components/dashboard/GoalCard";
import { PageTitle } from "@/components/shared/PageTitle";
import { useGoals } from "@/hooks/useGoals";
import { mockGoals } from "@/data/mockData";
import { toastNotifications } from "@/lib/toast-notifications";

export default function CreateGoalPage() {
  const { goals, addGoal } = useGoals(mockGoals);

  return (
    <DashboardLayout role="Employee" title="Goal Creation" subtitle="Create and validate a goal against the planning rules.">
      <PageTitle
        eyebrow="Goal planning"
        title="Add a new goal"
        description="Maximum 8 goals, minimum weightage of 10, and total planning weight must remain within 100."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <MultiGoalForm
          existingCount={goals.length}
          onSubmit={(newGoals) => {
            newGoals.forEach((g) => addGoal(g));
            toastNotifications.goalCreated(newGoals.length);
          }}
        />
        <div className="space-y-4">
          {goals.length === 0 ? (
            <EmptyState
              title="No goals yet"
              description="Add the first goal to begin the quarterly planning cycle."
            />
          ) : (
            <EmptyState
              title="Goal plan snapshot"
              description="The current goal list is seeded with mock data so the portal feels usable on first load."
            />
          )}
          <div className="grid gap-4">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}