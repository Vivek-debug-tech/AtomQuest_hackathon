import { Activity } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/types";

const toneStyles: Record<ActivityItem["tone"], string> = {
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  slate: "bg-slate-500",
};

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <Card className="border-white/70 bg-white/78 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#0f2858_0%,#2563eb_100%)] text-white shadow-[0_16px_32px_rgba(29,78,216,0.22)]">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <p className="text-sm text-slate-500">A live-looking timeline of workflow movement across the portal.</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        {items.map((item, index) => (
          <div key={item.id} className="grid grid-cols-[auto_1fr] gap-4">
            <div className="flex flex-col items-center">
              <div className={cn("h-3 w-3 rounded-full shadow-[0_0_0_6px_rgba(255,255,255,0.75)]", toneStyles[item.tone])} />
              {index < items.length - 1 ? <div className="mt-2 h-full w-px bg-slate-200" /> : null}
            </div>
            <div className="rounded-[22px] border border-white/70 bg-white/72 p-4 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-slate-950">{item.title}</p>
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">{item.timestamp}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
