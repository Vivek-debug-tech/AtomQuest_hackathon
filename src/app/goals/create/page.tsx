"use client";

import MultiGoalForm from "@/components/forms/MultiGoalForm";
import { GoalCard } from "@/components/dashboard/GoalCard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageTitle } from "@/components/shared/PageTitle";
import { useWorkflowSnapshot } from "@/hooks/useWorkflowSnapshot";
import { toastNotifications } from "@/lib/toast-notifications";

export default function CreateGoalPage() {
  const { snapshot, setSnapshot, reload } = useWorkflowSnapshot();

  return (
    <DashboardLayout role="Employee" title="Goal Creation" subtitle="Create and validate a goal against the planning rules.">
      <PageTitle
        eyebrow="Goal planning"
        title="Add a new goal"
        description="Maximum 8 goals, minimum weightage of 10, and total planning weight must remain within 100."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <MultiGoalForm
          existingCount={snapshot.goals.length}
          onSubmit={async (newGoals) => {
            const response = await fetch("/api/goals/batch", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ goals: newGoals }),
            });

            if (!response.ok) {
              const body = (await response.json().catch(() => null)) as { error?: string } | null;
              toastNotifications.error("Goal creation failed", body?.error);
              return;
            }

            const body = (await response.json()) as { goals: typeof newGoals };
            setSnapshot((current) => ({
              ...current,
              goals: [...body.goals, ...current.goals],
            }));
            toastNotifications.goalCreated(body.goals.length);
            void reload();
          }}
        />
        <div className="space-y-4">
          {snapshot.goals.length === 0 ? (
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
            {snapshot.goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
