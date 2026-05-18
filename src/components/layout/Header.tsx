"use client";

import { Menu, Search, ShieldCheck, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Button className="lg:hidden" size="icon" variant="ghost" onClick={onMenuClick} type="button" aria-label="Toggle menu">
            <Menu className="h-5 w-5 text-slate-600" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold tracking-tight text-slate-950 truncate">{title}</p>
            {subtitle ? <p className="text-xs sm:text-sm text-slate-500 truncate">{subtitle}</p> : null}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white/50 px-4 py-2 text-sm text-slate-500 shadow-sm md:flex hover:bg-white/80 transition-colors">
            <Search className="h-4 w-4 text-slate-400" />
            <span className="text-slate-500">Search goals</span>
          </div>
          <Badge variant="outline" className="gap-2 px-3 py-2 text-slate-700 border-slate-200 bg-slate-50 hidden sm:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-xs font-semibold">{role}</span>
          </Badge>
          <Button variant="outline" size="sm" type="button" className="gap-2 border-slate-200 hover:bg-slate-50">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}