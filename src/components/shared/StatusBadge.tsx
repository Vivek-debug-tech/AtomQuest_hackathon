import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GoalStatus } from "@/types";

const variants: Record<GoalStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Completed: "default",
  "On Track": "default",
  "At Risk": "destructive",
  "Not Started": "secondary",
};

const tones: Record<GoalStatus, string> = {
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
  "On Track": "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50",
  "At Risk": "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50",
  "Not Started": "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100",
};

export function StatusBadge({ status }: { status: GoalStatus }) {
  return (
    <Badge variant={variants[status]} className={cn("shadow-none", tones[status])}>
      {status}
    </Badge>
  );
}
