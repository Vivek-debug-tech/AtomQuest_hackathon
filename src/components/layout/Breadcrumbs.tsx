"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  employee: "Employee",
  manager: "Manager",
  admin: "Admin",
  goals: "Goals",
  create: "Create",
  checkins: "Check-ins",
  analytics: "Analytics",
  approvals: "Approvals",
  settings: "Settings",
  login: "Login",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
      <Link href="/" className="font-medium text-slate-600 transition hover:text-slate-900">
        Home
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isCurrent = index === segments.length - 1;
        const label = LABELS[segment] ?? segment[0]?.toUpperCase() + segment.slice(1);

        return (
          <span key={href} className="flex items-center gap-2">
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            {isCurrent ? (
              <span className="font-semibold text-slate-800">{label}</span>
            ) : (
              <Link href={href} className="transition hover:text-slate-900">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

