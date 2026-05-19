import Link from "next/link";
import { ArrowRight, ChartNoAxesCombined, ShieldCheck, Sparkles, Target, Users2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mockGoals } from "@/data/mockData";
import { getAverageProgress, getCompletedGoals, getPendingCheckIns } from "@/lib/calculations";

export default function Home() {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-[1480px] flex-col justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-8 h-64 w-64 rounded-full bg-blue-200/30 blur-[120px]" />
        <div className="absolute right-0 top-16 h-72 w-72 rounded-full bg-cyan-200/25 blur-[140px]" />
      </div>

      <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <section className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/85 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-blue-700 shadow-[0_12px_28px_rgba(59,130,246,0.08)]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Enterprise Goal Setting Portal
          </div>

          <div className="space-y-5">
            <h1 className="max-w-4xl text-balance font-heading text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl xl:text-7xl">
              Enterprise goal operations designed to look submission-ready.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Atomquest Goal OS brings approvals, planning rules, quarterly execution, analytics, and governance into a polished HRMS control plane.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/login">
                Launch Portal
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard/employee">Open Live Dashboard</Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-white/70 bg-white/78">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Avg. Progress</p>
                <p className="mt-3 font-heading text-4xl font-semibold text-slate-950">{getAverageProgress(mockGoals)}%</p>
              </CardContent>
            </Card>
            <Card className="border-white/70 bg-white/78">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Completed Goals</p>
                <p className="mt-3 font-heading text-4xl font-semibold text-slate-950">{getCompletedGoals(mockGoals).length}</p>
              </CardContent>
            </Card>
            <Card className="border-white/70 bg-white/78">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Pending Check-ins</p>
                <p className="mt-3 font-heading text-4xl font-semibold text-slate-950">{getPendingCheckIns(mockGoals)}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-4">
          <Card className="overflow-hidden border-white/10 bg-[linear-gradient(145deg,#071521_0%,#0f2858_42%,#2563eb_100%)] text-white shadow-[0_28px_70px_rgba(15,23,42,0.2)]">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-2 text-blue-100">
                <Sparkles className="h-4 w-4" />
                <p className="text-sm font-semibold">Portal Highlights</p>
              </div>
              {[
                {
                  icon: Target,
                  title: "Goal governance",
                  copy: "Weightage validation, max-goal rules, and lock-state governance are built into the experience.",
                },
                {
                  icon: ChartNoAxesCombined,
                  title: "Executive analytics",
                  copy: "Premium dashboards surface approvals, heatmaps, distributions, exports, and progress trends.",
                },
                {
                  icon: Users2,
                  title: "Role-aware operation",
                  copy: "Employees, managers, and admins get focused workspaces instead of a generic shared UI.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[24px] border border-white/10 bg-white/8 p-4 backdrop-blur">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-white/12 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 font-semibold">{item.title}</p>
                    <p className="mt-2 text-sm leading-7 text-blue-100">{item.copy}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/78">
            <CardContent className="grid gap-3 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Demo readiness</p>
              <p className="font-heading text-2xl font-semibold text-slate-950">Built for a high-credibility hackathon walkthrough.</p>
              <p className="text-sm leading-7 text-slate-600">
                The portal opens with premium branding, flows into role-aware dashboards, and keeps the governance story visible throughout the journey.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
