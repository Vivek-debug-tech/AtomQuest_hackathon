"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BarChart3,
  CalendarCheck2,
  FolderKanban,
  Home,
  type LucideIcon,
  PlusCircle,
  ShieldAlert,
  Settings,
  Sparkles,
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
    { label: "Approvals", href: "/approvals", icon: FolderKanban },
    { label: "Check-ins", href: "/goals/checkins", icon: CalendarCheck2 },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
  Admin: [
    { label: "Dashboard", href: "/dashboard/admin", icon: Home },
    { label: "Approvals", href: "/approvals", icon: FolderKanban },
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
          "fixed inset-y-0 left-0 z-50 flex w-[18.75rem] flex-col overflow-y-auto border-r border-white/10 bg-[linear-gradient(180deg,rgba(7,15,31,0.96)_0%,rgba(8,18,38,0.92)_55%,rgba(11,29,63,0.9)_100%)] text-white transition-transform duration-300 ease-out lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="relative flex items-center justify-between gap-3 border-b border-white/10 px-6 py-6">
          <div className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.34em] text-blue-200">Atomquest</p>
            <p className="font-heading text-2xl font-semibold tracking-tight text-white">Goal OS</p>
          </div>
          <Button className="lg:hidden" size="icon" variant="ghost" onClick={onClose} type="button" aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="mx-4 my-5 rounded-[28px] border border-white/10 bg-white/7 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-100 shadow-[0_12px_30px_rgba(29,78,216,0.18)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Executive HRMS Workspace</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">Governance, planning, approvals, and quarterly rhythm in one control plane.</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-blue-100">
                <span className="h-2 w-2 rounded-full bg-blue-300" />
                {role}
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-2">
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
                      "group flex items-center gap-3 rounded-[22px] px-4 py-3.5 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-white text-slate-950 shadow-[0_18px_40px_rgba(15,23,42,0.24)]"
                        : "text-slate-300 hover:bg-white/8 hover:text-white",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-200 flex-shrink-0",
                        active ? "bg-slate-950 text-white" : "bg-white/6 text-slate-200 group-hover:bg-white/10",
                      )}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </span>

                    <span className="flex-1">{item.label}</span>

                    {active && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-[28px] border border-blue-400/20 bg-gradient-to-br from-blue-500/15 via-blue-400/8 to-cyan-400/10 p-4">
            <div className="flex items-center gap-2 text-blue-100">
              <Bell className="h-4 w-4" />
              <p className="text-sm font-semibold">Quick action</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">Create a goal, monitor escalations, or review approval queues without leaving the rail.</p>
            <Button asChild className="mt-4 w-full bg-white text-slate-950 hover:bg-slate-100">
              <Link href="/goals/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Goal
              </Link>
            </Button>
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white/8 px-3 py-3 text-xs text-slate-200">
              <ShieldAlert className="h-4 w-4 text-amber-300" />
              2 escalations need manager attention
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
