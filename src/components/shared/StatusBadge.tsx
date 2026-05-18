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
  Completed: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  "On Track": "bg-blue-100 text-blue-700 hover:bg-blue-100",
  "At Risk": "bg-amber-100 text-amber-700 hover:bg-amber-100",
  "Not Started": "bg-slate-100 text-slate-700 hover:bg-slate-100",
};

export function StatusBadge({ status }: { status: GoalStatus }) {
  return (
    <Badge variant={variants[status]} className={cn("border-transparent", tones[status])}>
      {status}
    </Badge>
  );
}