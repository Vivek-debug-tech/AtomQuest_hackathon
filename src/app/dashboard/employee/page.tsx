import Link from "next/link";
import { BellRing, CheckCircle2, Clock3, Share2, Target, TrendingUp } from "lucide-react";

import { ProgressChartClient } from "@/components/dashboard/ProgressChartClient";
import { GoalCard } from "@/components/dashboard/GoalCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ShellCard } from "@/components/layout/ShellCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageTitle } from "@/components/shared/PageTitle";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { GoalsTable } from "@/components/tables/GoalsTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildPortalSnapshot, getGoalGovernanceSummary } from "@/lib/portal-data";
import { getServerSession } from "@/lib/auth/session-server";
import { getCompletedGoals, getPendingCheckIns } from "@/lib/calculations";

export default async function EmployeeDashboardPage() {
  const session = await getServerSession();
  const snapshot = buildPortalSnapshot(session);
  const governance = getGoalGovernanceSummary(snapshot.goals);

  return (
    <DashboardLayout
      role="Employee"
      title="Employee Dashboard"
      subtitle="Goal health, quarterly execution, and governance status in one workspace."
    >
      <PageTitle
        eyebrow="Employee workspace"
        title={`Welcome back, ${snapshot.currentUser.name}`}
        description="Track current-quarter execution, submit updates, and monitor goal governance without leaving the dashboard."
      />

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard icon={<Target className="h-5 w-5" />} title="Goals Planned" value={String(snapshot.goals.length)} change={`${governance.totalWeightage}% total weightage`} />
        <StatsCard icon={<TrendingUp className="h-5 w-5" />} title="Quarter Progress" value={`${governance.averageProgress}%`} change={`${snapshot.quarterLabel} now active`} />
        <StatsCard icon={<Clock3 className="h-5 w-5" />} title="Pending Check-ins" value={String(getPendingCheckIns(snapshot.goals))} change="Quarterly update window open" />
        <StatsCard icon={<CheckCircle2 className="h-5 w-5" />} title="Completed Goals" value={String(getCompletedGoals(snapshot.goals).length)} change="Locked goals remain editable only by manager/admin" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <ShellCard className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Quarterly rhythm</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{snapshot.quarterLabel} execution window</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                  Planned vs actual progress is enforced per quarter. Check-ins remain open only for the active submission window.
                </p>
              </div>
              <div className="rounded-[24px] border border-blue-200 bg-blue-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.24em] text-blue-700">Governance</p>
                <p className="mt-1 text-lg font-semibold text-blue-950">
                  {governance.validationIssues.length === 0 ? "Compliant" : "Needs attention"}
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {snapshot.cycleWindows.slice(0, 3).map((quarter) => (
                <div key={quarter.key} className={`rounded-[24px] border p-4 ${quarter.key === snapshot.quarterKey ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                  <p className="text-sm font-semibold">{quarter.label}</p>
                  <p className="mt-2 text-xs">Opens {quarter.opensOn}</p>
                  <p className="mt-2 text-xs opacity-80">{quarter.action}</p>
                </div>
              ))}
            </div>
          </ShellCard>

          <div className="grid gap-6 lg:grid-cols-2">
            {snapshot.goals.slice(0, 2).map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
            <ProgressChartClient data={snapshot.trend} />
            <RecentActivity items={snapshot.activities} />
          </div>

          <GoalsTable goals={snapshot.goals} />
        </div>

        <div className="space-y-6">
          <ShellCard className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <BellRing className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Notifications</p>
                <p className="text-sm text-slate-500">Email reminders are simulated for production demo readiness.</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {snapshot.notifications
                .filter((item) => item.audience.includes("Employee"))
                .map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                  </div>
                ))}
            </div>
          </ShellCard>

          <ShellCard className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Shared goals</p>
                <p className="text-sm text-slate-500">Benchmark goals visible across related teams.</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {snapshot.sharedGoals.length > 0 ? snapshot.sharedGoals.map((share) => {
                const goal = snapshot.goals.find((item) => item.id === share.goalId);
                return (
                  <div key={share.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-900">{goal?.title ?? share.goalId}</p>
                      <Badge variant="outline" className="rounded-full">{share.permission}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{share.note}</p>
                  </div>
                );
              }) : <EmptyState title="No shared goals" description="Shared goals from managers or related teams will appear here." />}
            </div>
          </ShellCard>

          <ShellCard className="p-6">
            <p className="text-sm font-semibold text-slate-900">Quick actions</p>
            <div className="mt-4 grid gap-3">
              <Button asChild className="rounded-2xl">
                <Link href="/goals/create">Create goal plan</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-2xl bg-white">
                <Link href="/goals/checkins">Submit quarterly check-in</Link>
              </Button>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-900">Current plan status</p>
                  <StatusBadge status={governance.validationIssues.length === 0 ? "On Track" : "At Risk"} />
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {governance.validationIssues[0] ?? "Goal plan satisfies weightage and quarterly submission rules."}
                </p>
              </div>
            </div>
          </ShellCard>
        </div>
      </section>
    </DashboardLayout>
  );
}
