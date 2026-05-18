import { Card, CardContent } from "@/components/ui/card";

export function StatsCard({
  title,
  value,
  change,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-slate-200/60 bg-white/60 backdrop-blur-sm shadow-[0_4px_12px_rgba(15,23,42,0.08)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)] hover:border-slate-300 transition-all duration-300">
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
            <p className="text-4xl font-bold tracking-tight text-slate-950">{value}</p>
          </div>
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 shadow-sm">
            {icon}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <p className="text-xs font-medium text-emerald-700">{change}</p>
        </div>
      </CardContent>
    </Card>
  );
}