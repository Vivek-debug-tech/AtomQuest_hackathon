import { ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { DashboardMetric, TeamMemberSummary } from "@/types";

const toneStyles: Record<NonNullable<DashboardMetric["tone"]>, string> = {
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  slate: "border-slate-200 bg-slate-100 text-slate-700",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TeamOverview({ metrics, team }: { metrics: DashboardMetric[]; team: TeamMemberSummary[] }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="border-white/70 bg-white/78 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                <span className={cn("rounded-full border px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em]", toneStyles[metric.tone || "slate"])}>
                  {metric.trend}
                </span>
              </div>
              <div className="flex items-end justify-between gap-3">
                <p className="font-heading text-4xl font-semibold tracking-tight text-slate-950">{metric.value}</p>
                <ArrowUpRight className="h-5 w-5 text-slate-300" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {team.map((member) => (
          <Card key={member.id} className="border-white/70 bg-white/78 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
            <CardContent className="space-y-5 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#0f2858_0%,#2563eb_100%)] text-sm font-semibold text-white shadow-[0_14px_28px_rgba(29,78,216,0.2)]">
                    {initials(member.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">{member.name}</p>
                    <p className="text-sm text-slate-500">{member.department}</p>
                  </div>
                </div>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-blue-700">
                  {member.role}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-[20px] border border-white/70 bg-white/72 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Goals</p>
                  <p className="mt-2 font-heading text-xl font-semibold text-slate-950">{member.goalsAssigned}</p>
                </div>
                <div className="rounded-[20px] border border-white/70 bg-white/72 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Approvals</p>
                  <p className="mt-2 font-heading text-xl font-semibold text-slate-950">{member.pendingApprovals}</p>
                </div>
                <div className="rounded-[20px] border border-white/70 bg-white/72 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Next</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{member.nextCheckIn}</p>
                </div>
              </div>

              <div className="rounded-[20px] border border-white/70 bg-slate-950/96 p-4 text-white shadow-[0_18px_36px_rgba(15,23,42,0.18)]">
                <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                  <span>Completion</span>
                  <span>{member.completionRate}%</span>
                </div>
                <Progress value={member.completionRate} className="bg-white/15" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
