import type { ReactNode } from "react";

export function GoalInputRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-[220px_1fr] md:items-start md:gap-6">
      <div className="space-y-1 pt-1">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        {description ? <p className="text-sm text-slate-500">{description}</p> : null}
      </div>
      <div>{children}</div>
    </div>
  );
}