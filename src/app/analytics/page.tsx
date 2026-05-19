"use client";

import dynamic from "next/dynamic";
import { Download, FileSpreadsheet, ShieldAlert } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ShellCard } from "@/components/layout/ShellCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { PageTitle } from "@/components/shared/PageTitle";
import { Button } from "@/components/ui/button";
import { buildPortalSnapshot, getCheckinCompletion, getGoalDistribution, getGoalStatusBreakdown } from "@/lib/portal-data";
import { buildAuditExportRows, buildGoalExportRows } from "@/lib/reporting";
import { downloadCsv, downloadExcelCompatible } from "@/lib/csv";
import { toastNotifications } from "@/lib/toast-notifications";

const StatusPie = dynamic(() => import("@/components/charts/StatusPie"), { ssr: false });
const TeamCompletionBar = dynamic(() => import("@/components/charts/TeamCompletionBar"), { ssr: false });
const QuarterlyLine = dynamic(() => import("@/components/charts/QuarterlyLine"), { ssr: false });
const HeatmapGrid = dynamic(() => import("@/components/charts/HeatmapGrid"), { ssr: false });

function columnsFromRows<T extends Record<string, string | number>>(rows: T[]) {
  const firstRow = rows[0];
  if (!firstRow) return [];

  return Object.keys(firstRow).map((key) => ({
    header: key,
    value: (row: T) => row[key],
  }));
}

export default function AnalyticsPage() {
  const { session } = useAuth();
  const snapshot = buildPortalSnapshot(session);
  const role = session?.role ?? "Employee";

  const exportGoalsCsv = () => {
    const rows = buildGoalExportRows(snapshot.goals);
    downloadCsv({
      rows,
      filename: `goal-export-${snapshot.quarterKey}`,
      columns: columnsFromRows(rows),
    });
    toastNotifications.csvExported();
  };

  const exportGoalsExcel = () => {
    const rows = buildGoalExportRows(snapshot.goals);
    downloadExcelCompatible({
      rows,
      filename: `goal-export-${snapshot.quarterKey}`,
      columns: columnsFromRows(rows),
    });
    toastNotifications.success("Excel-compatible export generated.");
  };

  const exportAuditCsv = () => {
    const rows = buildAuditExportRows(snapshot.auditLogs);
    downloadCsv({
      rows,
      filename: `audit-export-${snapshot.quarterKey}`,
      columns: columnsFromRows(rows),
    });
    toastNotifications.csvExported();
  };

  return (
    <DashboardLayout role={role} title="Analytics & Reporting" subtitle="Dashboards, exports, auditability, and governance reporting.">
      <PageTitle
        eyebrow="Reporting"
        title="Analytics and export center"
        description="Goal completion, quarterly trends, heatmaps, and audit-ready downloads are centralized here for every role."
      />

      <section className="grid gap-6 lg:grid-cols-3">
        <ShellCard className="p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Exports</p>
              <p className="mt-2 text-sm text-slate-600">CSV and Excel-compatible extracts for goals, check-ins, and audits.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={exportGoalsCsv} className="rounded-2xl">
                <Download className="mr-2 h-4 w-4" />
                Goals CSV
              </Button>
              <Button onClick={exportGoalsExcel} variant="outline" className="rounded-2xl bg-white">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Goals Excel
              </Button>
              <Button onClick={exportAuditCsv} variant="outline" className="rounded-2xl bg-white">
                Audit CSV
              </Button>
            </div>
          </div>
        </ShellCard>

        <ShellCard className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Governance snapshot</p>
              <p className="mt-2 text-sm text-slate-600">Audit logs and escalations remain visible for reporting and compliance review.</p>
            </div>
          </div>
        </ShellCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <StatusPie title="Goal Status Breakdown" data={getGoalStatusBreakdown(snapshot.goals)} />
        <TeamCompletionBar title="Goal Distribution by Employee" team={snapshot.team} />
        <QuarterlyLine title="Quarterly Progress" points={snapshot.trend} />
        <HeatmapGrid
          title="Completion Heatmap"
          xLabels={snapshot.quarterWindows.map((item) => item.label)}
          yLabels={snapshot.team.map((item) => item.name)}
          values={snapshot.team.map((member) => snapshot.quarterWindows.map((_, index) => Math.max(20, Math.min(100, member.completionRate - 10 + index * 8))))}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ShellCard className="p-6">
          <p className="text-sm font-semibold text-slate-900">Goal distribution chart data</p>
          <div className="mt-4 space-y-3">
            {getGoalDistribution(snapshot.goals).map((goal) => (
              <div key={goal.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium text-slate-900">{goal.name}</p>
                  <span className="text-sm text-slate-500">{goal.weightage}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-slate-950" style={{ width: `${goal.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </ShellCard>

        <ShellCard className="p-6">
          <p className="text-sm font-semibold text-slate-900">Quarterly check-in coverage</p>
          <div className="mt-4 space-y-3">
            {getCheckinCompletion(snapshot.goals, snapshot.checkIns).map((item) => (
              <div key={item.goalId} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium text-slate-900">{item.goalTitle}</p>
                  <span className="text-sm text-slate-500">{item.submitted} submissions</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">Current progress: {item.progress}%</p>
              </div>
            ))}
          </div>
        </ShellCard>
      </section>
    </DashboardLayout>
  );
}
