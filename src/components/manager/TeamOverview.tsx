import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { DashboardMetric, TeamMemberSummary } from "@/types";

const toneStyles: Record<NonNullable<DashboardMetric["tone"]>, string> = {
  blue: "bg-blue-50 text-blue-700",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  slate: "bg-slate-50 text-slate-700",
};

export function TeamOverview({ metrics, team }: { metrics: DashboardMetric[]; team: TeamMemberSummary[] }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", toneStyles[metric.tone || "slate"]) }>
                  {metric.trend}
                </span>
              </div>
              <p className="text-3xl font-semibold tracking-tight text-slate-950">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {team.map((member) => (
          <Card key={member.id} className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">{member.name}</p>
                  <p className="text-sm text-slate-500">{member.department}</p>
                </div>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">{member.role}</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Goals</p>
                  <p className="mt-1 font-semibold text-slate-950">{member.goalsAssigned}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Approvals</p>
                  <p className="mt-1 font-semibold text-slate-950">{member.pendingApprovals}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Next Check-in</p>
                  <p className="mt-1 font-semibold text-slate-950">{member.nextCheckIn}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>Completion</span>
                  <span>{member.completionRate}%</span>
                </div>
                <Progress value={member.completionRate} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}