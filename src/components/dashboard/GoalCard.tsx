import { CalendarClock, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Goal } from "@/types";

export function GoalCard({ goal }: { goal: Goal }) {
  return (
    <Card className="relative overflow-hidden border-white/70 bg-white/78 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
      <div className="pointer-events-none absolute right-[-1rem] top-[-1rem] h-28 w-28 rounded-full bg-blue-200/35 blur-3xl" />
      <CardHeader className="space-y-4 pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-3">
            <Badge variant="outline" className="border-blue-200 bg-blue-50/90 text-blue-700">
              {goal.thrustArea}
            </Badge>
            <div>
              <CardTitle className="text-xl">{goal.title}</CardTitle>
              <p className="mt-2 max-w-xl text-sm leading-7 text-slate-600">{goal.description}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={goal.status} />
            {goal.sharedSourceGoalId ? (
              <Badge className="border-blue-200 bg-blue-50 text-blue-700">Shared KPI</Badge>
            ) : null}
            {goal.isLocked ? (
              <Badge className="border-red-200 bg-red-50 text-red-700">Locked</Badge>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        <div className="rounded-[26px] bg-[linear-gradient(135deg,#0f2858_0%,#173d84_45%,#2563eb_100%)] p-5 text-white shadow-[0_22px_48px_rgba(29,78,216,0.2)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">Progress</p>
              <p className="mt-2 font-heading text-4xl font-semibold">{goal.progress}%</p>
            </div>
            <div className="rounded-[20px] bg-white/12 px-4 py-3 text-right backdrop-blur">
              <p className="text-xs text-blue-100">Target</p>
              <p className="mt-1 text-sm font-semibold text-white">{goal.target}</p>
            </div>
          </div>
          <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/18">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#f8fbff_0%,#bae6fd_100%)]"
              style={{ width: `${goal.progress}%` }}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[22px] border border-white/70 bg-white/72 p-4 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-2 text-slate-500">
              <Target className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em]">Weightage</p>
            </div>
            <p className="mt-3 font-heading text-2xl font-semibold text-slate-950">{goal.weightage}%</p>
          </div>
          <div className="rounded-[22px] border border-white/70 bg-white/72 p-4 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-2 text-slate-500">
              <CalendarClock className="h-4 w-4 text-cyan-600" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em]">Next check-in</p>
            </div>
            <p className="mt-3 text-base font-semibold text-slate-950">{goal.nextCheckIn}</p>
            <p className="mt-1 text-xs text-slate-500">UoM: {goal.uomType}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
