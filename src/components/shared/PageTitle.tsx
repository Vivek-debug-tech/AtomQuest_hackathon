import { ShieldCheck, Sparkles, Zap } from "lucide-react";

export function PageTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="glass-panel relative overflow-hidden rounded-[34px] border border-white/70 px-6 py-7 shadow-[0_28px_90px_rgba(15,23,42,0.1)] sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="relative grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
        <div className="space-y-4">
          {eyebrow ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50/80 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              {eyebrow}
            </div>
          ) : null}
          <div>
            <h1 className="text-balance font-heading text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl xl:text-[2.9rem]">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-3xl text-base leading-8 text-slate-600">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-[24px] border border-white/70 bg-white/72 p-4 shadow-[0_14px_32px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-2 text-slate-900">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-semibold">Governed workflow</p>
            </div>
            <p className="mt-2 text-xs leading-6 text-slate-500">
              Validation, approvals, and lock-state rules remain active across the portal.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/70 bg-white/72 p-4 shadow-[0_14px_32px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-2 text-slate-900">
              <Zap className="h-4 w-4 text-cyan-600" />
              <p className="text-sm font-semibold">Live execution</p>
            </div>
            <p className="mt-2 text-xs leading-6 text-slate-500">
              Quarterly progress, dashboards, and operational actions share one visual system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
