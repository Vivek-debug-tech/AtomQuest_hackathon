import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/types";

const toneStyles: Record<ActivityItem["tone"], string> = {
  blue: "bg-blue-100 text-blue-700",
  emerald: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  slate: "bg-slate-100 text-slate-700",
};

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <Card className="border-slate-200/60 bg-white/60 backdrop-blur-sm shadow-[0_4px_12px_rgba(15,23,42,0.08)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)] transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-slate-950">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 rounded-xl bg-gradient-to-r from-slate-50 to-white p-4 border border-slate-200/50 hover:bg-slate-50/80 transition-colors">
            <div className={cn("mt-1 h-2 w-2 flex-shrink-0 rounded-full", toneStyles[item.tone])} />
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-slate-950 text-sm">{item.title}</p>
                <span className="text-xs font-medium text-slate-500 flex-shrink-0">{item.timestamp}</span>
              </div>
              <p className="text-sm text-slate-600">{item.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}