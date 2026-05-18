import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Target, Users2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockGoals } from "@/data/mockData";
import { getAverageProgress, getCompletedGoals, getPendingCheckIns } from "@/lib/calculations";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.95fr] lg:items-center">
        <section className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm backdrop-blur">
            <ShieldCheck className="h-4 w-4" />
            Enterprise Goal Setting & Tracking Portal
          </div>

          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              A modern HRMS workspace for setting, tracking, and reviewing goal progress.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Manage employee goals, monitor check-ins, and review performance visibility from one polished dashboard.
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
              <Link href="/dashboard/employee">Open Employee Dashboard</Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-slate-500">Avg. Progress</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{getAverageProgress(mockGoals)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-slate-500">Completed Goals</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{getCompletedGoals(mockGoals).length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-slate-500">Pending Check-ins</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{getPendingCheckIns(mockGoals)}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-4">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
            <CardHeader>
              <CardTitle className="text-white">Portal Highlights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-blue-50">
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                <Target className="h-5 w-5" />
                <div>
                  <p className="font-medium">Goal governance</p>
                  <p className="text-sm text-blue-100">Enforce weightage and planning rules consistently.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                <Sparkles className="h-5 w-5" />
                <div>
                  <p className="font-medium">Clean HRMS UI</p>
                  <p className="text-sm text-blue-100">Professional layout with cards, tables, and charts.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                <Users2 className="h-5 w-5" />
                <div>
                  <p className="font-medium">Role-aware login</p>
                  <p className="text-sm text-blue-100">Employee, manager, and admin entry paths.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phase 1 Included</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>Responsive dashboard shell with sidebar and header.</p>
              <p>Employee dashboard with stats, charts, activity, and tables.</p>
              <p>Validated goal creation and local mock data seeded for the first run.</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
