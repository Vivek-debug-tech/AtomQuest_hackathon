import { Layers3 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="glass-panel rounded-[30px] border border-dashed border-white/80 p-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#dbeafe_0%,#eff6ff_100%)] text-blue-700 shadow-[0_12px_28px_rgba(59,130,246,0.12)]">
        <Layers3 className="h-6 w-6" />
      </div>
      <h3 className="mt-5 font-heading text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-6" onClick={onAction} type="button">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
