import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Goal } from "@/types";

export function GoalCard({ goal }: { goal: Goal }) {
  return (
    <Card className="group border-slate-200/60 bg-white/60 backdrop-blur-sm shadow-[0_4px_12px_rgba(15,23,42,0.08)] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)] hover:border-slate-300">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-slate-950">{goal.title}</CardTitle>
            <p className="mt-2 text-sm font-medium text-blue-600">{goal.thrustArea}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={goal.status} />
            {goal.isLocked ? (
              <Badge className="bg-red-100 text-red-700 border-red-200">
                🔒 Locked
              </Badge>
            ) : null}
          </div>
        </div>
        <p className="text-sm leading-6 text-slate-600">{goal.description}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Progress bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Progress</p>
            <p className="text-sm font-bold text-slate-950">{goal.progress}%</p>
          </div>
          <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 shadow-[0_0_12px_rgba(59,130,246,0.4)]"
              style={{ width: `${goal.progress}%` }}
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-4 border border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Weightage</p>
            <p className="mt-2 text-xl font-bold text-slate-950">{goal.weightage}%</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 border border-blue-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Unit</p>
            <p className="mt-2 text-xl font-bold text-blue-900">{goal.uomType}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}