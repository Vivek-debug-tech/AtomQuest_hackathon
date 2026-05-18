"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarCheck2,
  Home,
  type LucideIcon,
  PlusCircle,
  Settings,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

const navigationByRole: Record<UserRole, Array<{ label: string; href: string; icon: LucideIcon }>> = {
  Employee: [
    { label: "Dashboard", href: "/dashboard/employee", icon: Home },
    { label: "Create Goals", href: "/goals/create", icon: PlusCircle },
    { label: "Check-ins", href: "/goals/checkins", icon: CalendarCheck2 },
    { label: "Reports", href: "/analytics", icon: BarChart3 },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
  Manager: [
    { label: "Dashboard", href: "/dashboard/manager", icon: Home },
    { label: "Approvals", href: "/approvals", icon: CalendarCheck2 },
    { label: "Check-ins", href: "/checkins", icon: BarChart3 },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
  Admin: [
    { label: "Dashboard", href: "/dashboard/admin", icon: Home },
    { label: "Approvals", href: "/approvals", icon: CalendarCheck2 },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
};

export function Sidebar({ open, onClose, role = "Employee" }: { open: boolean; onClose: () => void; role?: UserRole }) {
  const pathname = usePathname() || "/";
  const navigation = navigationByRole[role];

  return (
    <>
      {/* overlay for mobile */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        aria-label="Primary Navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/60 bg-white/95 backdrop-blur-lg transition-transform duration-300 ease-out lg:static lg:translate-x-0 overflow-y-auto",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/50 px-5 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">GoalFlow</p>
            <p className="text-xl font-bold tracking-tight text-slate-950">Portal</p>
          </div>
          <Button className="lg:hidden" size="icon" variant="ghost" onClick={onClose} type="button" aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Info banner */}
        <div className="mx-3 my-4 rounded-xl bg-gradient-to-br from-blue-50 via-slate-50 to-white border border-blue-100 p-4 shadow-sm">
          <p className="text-sm font-bold text-slate-900">HRMS Dashboard</p>
          <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">Centralized people & performance management</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200",
                      active
                        ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-950 hover:shadow-sm",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-md transition-all duration-200 flex-shrink-0",
                        active ? "bg-blue-100 text-blue-700" : "text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700",
                      )}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </span>

                    <span className="flex-1">{item.label}</span>

                    {active && <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer CTA */}
        <div className="border-t border-slate-200/50 p-3">
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-slate-50 border border-slate-200 p-4 shadow-sm">
            <p className="text-sm font-bold text-slate-900">Quick Action</p>
            <p className="mt-1 text-xs text-slate-600">Start a new goal or log activity</p>
            <Button asChild className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm">
              <Link href="/goals/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Goal
              </Link>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}