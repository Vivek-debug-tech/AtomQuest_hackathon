import { notFound } from "next/navigation";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GoalCard } from "@/components/dashboard/GoalCard";
import { PageTitle } from "@/components/shared/PageTitle";
import { getServerSession } from "@/lib/auth/session-server";
import { getWorkflowSnapshot } from "@/lib/workflows";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function GoalDetailPage({ params }: PageProps) {
  const session = await getServerSession();
  const snapshot = await getWorkflowSnapshot();
  const { id } = await params;

  const goal = snapshot.goals.find((item) => item.id === id);
  if (!goal) notFound();

  const linkedGoals = snapshot.goals.filter(
    (item) => item.sharedSourceGoalId === (goal.sharedSourceGoalId ?? goal.id) && item.id !== goal.id,
  );
  const checkIns = snapshot.checkIns.filter((item) => item.goalId === goal.id);

  return (
    <DashboardLayout role={session?.role ?? "Employee"} title="Goal Details" subtitle="Deep-link destination for goals, approvals, and notification workflows.">
      <PageTitle
        eyebrow="Goal sheet"
        title={goal.title}
        description="Detailed view of the selected goal, linked shared copies, and its quarterly update history."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <GoalCard goal={goal} />
        <div className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold text-slate-900">Goal metadata</p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>Owner: <span className="font-medium text-slate-900">{goal.owner}</span></p>
            <p>Target: <span className="font-medium text-slate-900">{goal.target}</span></p>
            <p>Weightage: <span className="font-medium text-slate-900">{goal.weightage}%</span></p>
            <p>Approval: <span className="font-medium text-slate-900">{goal.approvalStatus ?? "Pending"}</span></p>
            <p>Locked: <span className="font-medium text-slate-900">{goal.isLocked ? "Yes" : "No"}</span></p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold text-slate-900">Quarterly updates</p>
          <div className="mt-4 space-y-3">
            {checkIns.length > 0 ? (
              checkIns.map((checkin) => (
                <div key={checkin.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">{checkin.quarterKey}</p>
                  <p className="mt-1 text-sm text-slate-600">Actual {checkin.actualAchievement} vs planned {checkin.plannedTarget}</p>
                  <p className="mt-1 text-sm text-slate-600">{checkin.comments}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No quarterly updates recorded yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold text-slate-900">Linked shared copies</p>
          <div className="mt-4 space-y-3">
            {linkedGoals.length > 0 ? (
              linkedGoals.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">{item.owner}</p>
                  <p className="mt-1 text-sm text-slate-600">Weightage {item.weightage}% • Progress {item.progress}%</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No linked shared copies for this goal.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
