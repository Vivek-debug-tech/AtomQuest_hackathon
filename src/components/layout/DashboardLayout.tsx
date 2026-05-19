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
    <div className="dashboard-mesh relative min-h-screen overflow-hidden bg-transparent lg:flex">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[18rem] top-[-8rem] h-72 w-72 rounded-full bg-blue-300/18 blur-[120px]" />
        <div className="absolute right-[-5rem] top-28 h-80 w-80 rounded-full bg-cyan-200/18 blur-[140px]" />
        <div className="absolute bottom-[-10rem] left-1/3 h-96 w-96 rounded-full bg-blue-500/10 blur-[160px]" />
      </div>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} role={role} />
      <div className="relative flex min-h-screen flex-1 flex-col">
        <Header
          title={title}
          subtitle={subtitle}
          role={role}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
