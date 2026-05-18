import { StatusBadge } from "@/components/shared/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Goal } from "@/types";

export function GoalsTable({ goals }: { goals: Goal[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-sm shadow-[0_4px_12px_rgba(15,23,42,0.08)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)] transition-all duration-300">
      <div className="border-b border-slate-200/50 px-6 py-6">
        <h3 className="text-xl font-bold text-slate-950">Recent Goals</h3>
        <p className="mt-1 text-sm text-slate-600">Overview of all active goals and their current progress</p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/50 border-b border-slate-200/50">
            <TableRow className="hover:bg-slate-50/50">
              <TableHead className="font-bold text-slate-950">Goal</TableHead>
              <TableHead className="font-bold text-slate-950">Thrust Area</TableHead>
              <TableHead className="font-bold text-slate-950">Weightage</TableHead>
              <TableHead className="font-bold text-slate-950">Progress</TableHead>
              <TableHead className="font-bold text-slate-950">Status</TableHead>
              <TableHead className="font-bold text-slate-950">Next Check-in</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {goals.map((goal) => (
              <TableRow key={goal.id} className="border-slate-200/50 hover:bg-blue-50/50 transition-colors duration-150">
                <TableCell className="font-semibold text-slate-950 py-4">{goal.title}</TableCell>
                <TableCell className="text-sm text-slate-700">{goal.thrustArea}</TableCell>
                <TableCell className="font-semibold text-slate-900">{goal.weightage}%</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-24 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: `${goal.progress}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-950 min-w-8">{goal.progress}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={goal.status} />
                </TableCell>
                <TableCell className="text-xs font-medium text-slate-600">{goal.nextCheckIn}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}