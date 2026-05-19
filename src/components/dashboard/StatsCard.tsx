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
    <Card className="relative overflow-hidden border-white/70 bg-white/78 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
      <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-blue-200/30 blur-3xl" />
      <CardContent className="relative flex h-full flex-col gap-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
            <p className="font-heading text-4xl font-semibold tracking-tight text-slate-950">{value}</p>
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#eff6ff_0%,#dbeafe_100%)] text-blue-700 shadow-[0_16px_34px_rgba(59,130,246,0.12)]">
            {icon}
          </div>
        </div>
        <div className="rounded-[20px] border border-white/80 bg-slate-950/95 px-4 py-3 text-sm text-slate-100 shadow-[0_14px_34px_rgba(15,23,42,0.18)]">
          <span className="text-slate-300">Signal:</span> {change}
        </div>
      </CardContent>
    </Card>
  );
}
