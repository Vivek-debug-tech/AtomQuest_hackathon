"use client";

import Link from "next/link";
import { Bell, ChevronDown, Menu, Search, ShieldCheck, Sparkles } from "lucide-react";

import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserRole } from "@/types";

export function Header({
  title,
  subtitle,
  role,
  onMenuClick,
}: {
  title: string;
  subtitle?: string;
  role: UserRole;
  onMenuClick: () => void;
}) {
  const { session, signOut, isPending } = useAuth();

  return (
    <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="glass-panel rounded-[30px] border border-white/70 px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Button className="lg:hidden" size="icon" variant="ghost" onClick={onMenuClick} type="button" aria-label="Toggle menu">
              <Menu className="h-5 w-5 text-slate-600" />
            </Button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <p className="truncate font-heading text-xl font-semibold tracking-tight text-slate-950">{title}</p>
                <Badge variant="outline" className="hidden gap-2 border-blue-200 bg-blue-50/90 text-blue-700 md:inline-flex">
                  <Sparkles className="h-3.5 w-3.5" />
                  Executive Mode
                </Badge>
              </div>
              {subtitle ? <p className="mt-1 truncate text-sm text-slate-500">{subtitle}</p> : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden items-center gap-3 rounded-[22px] border border-white/65 bg-white/72 px-4 py-3 text-sm text-slate-500 shadow-[0_14px_30px_rgba(15,23,42,0.05)] xl:flex">
              <Search className="h-4 w-4 text-slate-400" />
              <span>Search goals, owners, approvals</span>
            </div>
            <Badge variant="outline" className="hidden gap-2 border-slate-200 bg-white/75 text-slate-700 sm:flex">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              <span>{role}</span>
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="border-white/70 bg-white/76">
                  <Bell className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex-col items-start">
                  <span className="font-medium">Quarterly check-ins open</span>
                  <span className="text-xs text-slate-500">Current quarter submissions are available now.</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex-col items-start">
                  <span className="font-medium">Approval queue updated</span>
                  <span className="text-xs text-slate-500">Manager reminders were simulated for overdue items.</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-3 border-white/70 bg-white/76 px-3 py-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f2858_0%,#2563eb_100%)] text-sm font-semibold text-white shadow-[0_14px_28px_rgba(29,78,216,0.25)]">
                    {session?.name?.slice(0, 1) ?? "U"}
                  </div>
                  <div className="hidden text-left md:block">
                    <p className="text-sm font-semibold text-slate-900">{session?.name ?? "Portal user"}</p>
                    <p className="text-xs text-slate-500">{session?.department ?? "HRMS"}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Profile</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void signOut()} disabled={isPending}>
                  {isPending ? "Signing out..." : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
