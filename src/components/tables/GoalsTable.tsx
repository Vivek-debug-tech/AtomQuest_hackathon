import { Sparkles } from "lucide-react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Goal } from "@/types";

export function GoalsTable({ goals }: { goals: Goal[] }) {
  return (
    <div className="glass-panel overflow-hidden rounded-[30px] border border-white/70 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/70 px-6 py-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-blue-700">
            <Sparkles className="h-3.5 w-3.5" />
            Goal register
          </div>
          <h3 className="mt-3 font-heading text-2xl font-semibold text-slate-950">Current goal portfolio</h3>
          <p className="mt-1 text-sm text-slate-600">A consolidated view of active goals, weightage, status, and quarterly rhythm.</p>
        </div>
        <div className="rounded-[20px] border border-white/70 bg-white/75 px-4 py-3 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Active rows</p>
          <p className="mt-2 font-heading text-2xl font-semibold text-slate-950">{goals.length}</p>
        </div>
      </div>
      <div className="overflow-x-auto px-2 pb-2">
        <Table>
          <TableHeader className="bg-transparent">
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Goal</TableHead>
              <TableHead>Thrust Area</TableHead>
              <TableHead>Weightage</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Next Check-in</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {goals.map((goal) => (
              <TableRow key={goal.id}>
                <TableCell className="pl-4">
                  <div>
                    <p className="font-semibold text-slate-950">{goal.title}</p>
                    <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">{goal.description}</p>
                  </div>
                </TableCell>
                <TableCell>{goal.thrustArea}</TableCell>
                <TableCell className="font-semibold text-slate-950">{goal.weightage}%</TableCell>
                <TableCell>
                  <div className="flex min-w-[10rem] items-center gap-3">
                    <div className="h-2.5 w-24 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-[linear-gradient(90deg,#1d4ed8_0%,#38bdf8_100%)]" style={{ width: `${goal.progress}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-900">{goal.progress}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={goal.status} />
                </TableCell>
                <TableCell className="text-sm text-slate-600">{goal.nextCheckIn}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
