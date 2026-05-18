import { BarChart3, CheckCircle2, Clock3, Target } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageTitle } from "@/components/shared/PageTitle";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { GoalsTable } from "@/components/tables/GoalsTable";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { GoalCard } from "@/components/dashboard/GoalCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { mockActivities, mockGoals, mockTrend } from "@/data/mockData";
import { getAverageProgress, getCompletedGoals, getPendingCheckIns } from "@/lib/calculations";
import type { UserRole } from "@/types";

import { ProgressChartClient } from "@/components/dashboard/ProgressChartClient";

function formatDate(d?: string) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return d;
  }
}

export default async function EmployeeDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ role?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const role = (resolvedSearchParams?.role === "manager"
    ? "Manager"
    : resolvedSearchParams?.role === "admin"
      ? "Admin"
      : "Employee") as UserRole;

  // upcoming check-ins sorted ascending
  const upcoming = [...mockGoals]
    .filter((g) => g.nextCheckIn)
    .sort((a, b) => (new Date(a.nextCheckIn!).getTime() - new Date(b.nextCheckIn!).getTime()))
    .slice(0, 4);

  const topGoals = mockGoals.slice(0, 3);

  return (
    <DashboardLayout
      role={role}
      title="Employee Dashboard"
      subtitle="Monitor personal goals, recent activity, and delivery risks at a glance."
    >
      <PageTitle
        eyebrow="Performance overview"
        title="Your goal summary"
        description="A concise view of active goals, total weightage, and the latest progress checkpoints."
      />

      <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          icon={<Target className="h-5 w-5" />}
          title="Total Goals"
          value={String(mockGoals.length)}
          change="2 active this quarter"
        />
        <StatsCard
          icon={<BarChart3 className="h-5 w-5" />}
          title="Progress %"
          value={`${getAverageProgress(mockGoals)}%`}
          change="+6% from last week"
        />
        <StatsCard
          icon={<Clock3 className="h-5 w-5" />}
          title="Pending Check-ins"
          value={String(getPendingCheckIns(mockGoals))}
          change="Next in 2 days"
        />
        <StatsCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          title="Completed Goals"
          value={String(getCompletedGoals(mockGoals).length)}
          change="1 goal closed"
        />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {topGoals.map((g) => (
              <GoalCard key={g.id} goal={g} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_0.6fr]">
            <ProgressChartClient data={mockTrend} />
            <RecentActivity items={mockActivities} />
          </div>

          <GoalsTable goals={mockGoals} />
        </div>

        {/* Right column / sidebar */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-900">Upcoming Check-ins</h3>
              <Link href="/goals/checkins" className="text-sm text-blue-600">View all</Link>
            </div>
            <ul className="mt-3 space-y-3">
              {upcoming.map((g) => (
                <li key={g.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{g.title}</p>
                    <p className="mt-1 text-xs text-slate-500">Next: {formatDate(g.nextCheckIn)}</p>
                  </div>
                  <div className="text-sm text-slate-500">{g.progress}%</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-medium text-slate-900">Quick actions</h3>
            <p className="mt-1 text-xs text-slate-500">Create a goal or record a check-in quickly.</p>
            <div className="mt-3 flex flex-col gap-2">
              <Button asChild>
                <Link href="/goals/create">Create Goal</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/goals/checkins">Record Check-in</Link>
              </Button>
            </div>
          </div>
        </aside>
      </section>
    </DashboardLayout>
  );
}