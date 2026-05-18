"use client";

import { useState } from "react";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import type { UserRole } from "@/types";

export function DashboardLayout({
  title,
  subtitle,
  role,
  children,
}: {
  title: string;
  subtitle?: string;
  role: UserRole;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 lg:flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} role={role} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Header
          title={title}
          subtitle={subtitle}
          role={role}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">{children}</div>
        </main>
      </div>
    </div>
  );
}