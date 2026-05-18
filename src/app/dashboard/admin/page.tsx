"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Users, Lock, FileText, TrendingUp, Download, AlertCircle } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageTitle } from "@/components/shared/PageTitle";
import { EmptyState } from "@/components/shared/EmptyState";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { ManagerPerformanceCards } from "@/components/admin/ManagerPerformanceCards";
import { UnlockGoalDialog } from "@/components/admin/UnlockGoalDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockGoals, mockAuditLogs, mockTeam } from "@/data/mockData";
import { downloadCsv } from "@/lib/csv";
import { mutateGoalLockState } from "@/lib/goal-lock-client";
import { ChartLoader, TableLoader } from "@/components/shared/loading-skeletons";
import type { AuditLog, Goal } from "@/types";
import { toastNotifications } from "@/lib/toast-notifications";

const StatusPie = dynamic(() => import("@/components/charts/StatusPie"), {
  ssr: false,
  loading: () => <ChartLoader />,
});

const TeamCompletionBar = dynamic(() => import("@/components/charts/TeamCompletionBar"), {
  ssr: false,
  loading: () => <ChartLoader />,
});

const QuarterlyLine = dynamic(() => import("@/components/charts/QuarterlyLine"), {
  ssr: false,
  loading: () => <ChartLoader />,
});

const HeatmapGrid = dynamic(() => import("@/components/charts/HeatmapGrid"), {
  ssr: false,
  loading: () => <ChartLoader showLegend={false} />,
});

const LazyAuditLogTable = dynamic(
  () => import("@/components/admin/AuditLogTable").then((mod) => mod.AuditLogTable),
  {
    loading: () => <TableLoader rows={5} columns={5} />,
  },
);

export default function AdminDashboardPage() {
  const [goals, setGoals] = useState<Goal[]>(mockGoals.map((goal) => ({ ...goal })));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs.map((log) => ({ ...log })));
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Calculate stats
  const totalEmployees = mockTeam.length;
  const completedGoals = goals.filter((g) => g.status === "Completed").length;
  const totalGoals = goals.length;
  const completionPercentage = Math.round((completedGoals / totalGoals) * 100);
  const pendingApprovals = mockTeam.reduce((sum, m) => sum + m.pendingApprovals, 0);
  const lockedGoals = goals.filter((g) => g.isLocked).length;

  // Quarterly completion trend
  const quarterlyData = [
    {
      quarter: "Q1 2026",
      completed: Math.floor(totalGoals * 0.2),
      inProgress: Math.floor(totalGoals * 0.5),
      notStarted: Math.floor(totalGoals * 0.3),
    },
    {
      quarter: "Q2 2026",
      completed: Math.floor(totalGoals * 0.35),
      inProgress: Math.floor(totalGoals * 0.5),
      notStarted: Math.floor(totalGoals * 0.15),
    },
    {
      quarter: "Q3 2026",
      completed: Math.floor(totalGoals * 0.5),
      inProgress: Math.floor(totalGoals * 0.4),
      notStarted: Math.floor(totalGoals * 0.1),
    },
  ];

  const handleUnlockGoal = async (goalId: string, reason: string) => {
    const goal = goals.find((item) => item.id === goalId);
    if (!goal) return;

    setGoals((current) =>
      current.map((item) =>
        item.id === goalId
          ? {
              ...item,
              isLocked: false,
              lastUpdated: new Date().toISOString().slice(0, 10),
            }
          : item,
      ),
    );

    const auditEntry: AuditLog = {
      id: `audit-${Date.now()}`,
      action: "unlock",
      entityType: "Goal",
      entityId: goalId,
      performedById: "admin-001",
      performedByName: "System Admin",
      performedByRole: "Admin",
      timestamp: new Date().toISOString(),
      details: { reason, goalTitle: goal.title },
    };

    setAuditLogs((current) => [auditEntry, ...current]);

    toastNotifications.goalUnlocked();

    mutateGoalLockState(goalId, {
      action: "unlock",
      performedById: "admin-001",
      performedByName: "System Admin",
      reason,
    }).catch((error) => {
      console.error("Failed to persist goal unlock", error);
    });
    setUnlockDialogOpen(false);
    setSelectedGoal(null);
  };

  const openUnlockDialog = (goal: Goal) => {
    setSelectedGoal(goal);
    setUnlockDialogOpen(true);
  };

  const lockedGoalsData = goals.filter((g) => g.isLocked);

  const exportGoalsCsv = () => {
    downloadCsv({
      rows: goals,
      filename: `goal-export-${new Date().toISOString().slice(0, 10)}`,
      columns: [
        { header: "Employee Name", value: (goal) => goal.owner },
        { header: "Goal Title", value: (goal) => goal.title },
        { header: "Planned Target", value: (goal) => goal.target },
        { header: "Actual Achievement", value: (goal) => goal.actualAchievement ?? goal.progress },
        { header: "Progress Percentage", value: (goal) => `${goal.progress}%` },
        { header: "Goal Status", value: (goal) => goal.status },
      ],
    });
    toastNotifications.csvExported();
  };

  return (
    <DashboardLayout
      role="Admin"
      title="Admin Dashboard"
      subtitle="System-wide oversight: employee management, approvals, analytics, and audit logs."
    >
      <PageTitle
        eyebrow="System oversight"
        title="Admin control center"
        description="Complete visibility into goals, approvals, employees, and system audit trail."
      />

      {/* Key Metrics */}
      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
        <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-slate-500">Total Employees</p>
              <p className="mt-1 text-3xl font-semibold text-slate-950"><AnimatedNumber value={totalEmployees} /></p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-slate-500">Goal Completion</p>
              <p className="mt-1 text-3xl font-semibold text-slate-950"><AnimatedNumber value={completionPercentage} suffix="%" /></p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-slate-500">Pending Approvals</p>
              <p className="mt-1 text-3xl font-semibold text-slate-950"><AnimatedNumber value={pendingApprovals} /></p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-slate-500">Locked Goals</p>
              <p className="mt-1 text-3xl font-semibold text-slate-950"><AnimatedNumber value={lockedGoals} /></p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Lock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-slate-500">Total Goals</p>
              <p className="mt-1 text-3xl font-semibold text-slate-950"><AnimatedNumber value={totalGoals} /></p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Alerts */}
      {lockedGoals > 3 && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <span className="font-semibold">{lockedGoals} goals</span> are currently locked. Review and unlock as needed.
          </AlertDescription>
        </Alert>
      )}

      {pendingApprovals > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <span className="font-semibold">{pendingApprovals} goal(s)</span> are awaiting manager approval across the organization.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="managers">Managers</TabsTrigger>
          <TabsTrigger value="locked">Locked Goals</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quarterly Completion Trend */}
          <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
            <CardHeader>
              <CardTitle className="text-base">Quarterly Completion Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quarterlyData.map((quarter) => (
                <div key={quarter.quarter}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-950">{quarter.quarter}</h4>
                    <span className="text-sm text-slate-500">
                      {quarter.completed} / {totalGoals} completed
                    </span>
                  </div>
                  <div className="flex gap-2 h-3 rounded-full overflow-hidden bg-slate-100">
                    <div
                      className="bg-emerald-500"
                      style={{ width: `${(quarter.completed / totalGoals) * 100}%` }}
                    />
                    <div
                      className="bg-blue-500"
                      style={{ width: `${(quarter.inProgress / totalGoals) * 100}%` }}
                    />
                    <div
                      className="bg-slate-300"
                      style={{ width: `${(quarter.notStarted / totalGoals) * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 flex gap-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span>Completed: {quarter.completed}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span>In Progress: {quarter.inProgress}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-slate-300" />
                      <span>Not Started: {quarter.notStarted}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Dashboard Charts: status pie, team completion, quarterly trend, heatmap */}
          {goals.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <StatusPie
                title="Goal Status"
                data={
                  [
                    { name: "Not Started", value: goals.filter((g) => g.status === "Not Started").length },
                    { name: "On Track", value: goals.filter((g) => g.status === "On Track").length },
                    { name: "At Risk", value: goals.filter((g) => g.status === "At Risk").length },
                    { name: "Completed", value: goals.filter((g) => g.status === "Completed").length },
                  ].filter((d) => d.value > 0)
                }
              />

              <TeamCompletionBar title="Team Completion" team={mockTeam} />

              <QuarterlyLine
                title="Quarterly Progress"
                points={quarterlyData.map((q) => ({ label: q.quarter, progress: Math.round((q.completed / totalGoals) * 100), target: 100 }))}
              />

              <HeatmapGrid
                title="Completion Heatmap"
                xLabels={quarterlyData.map((q) => q.quarter)}
                yLabels={mockTeam.map((m) => m.name)}
                values={mockTeam.map((m) =>
                  quarterlyData.map((_, i) => Math.max(0, Math.min(100, Math.round(m.completionRate + (i - 1) * 6))))
                )}
              />
            </div>
          ) : (
            <EmptyState
              title="No analytics data"
              description="Add goals to populate the analytics section with live charts and trends."
            />
          )}
        </TabsContent>

        {/* Manager Performance Tab */}
        <TabsContent value="managers" className="space-y-6">
          <ManagerPerformanceCards
            managers={mockTeam.map((m) => ({
              ...m,
              departmentCount: Math.floor(Math.random() * 10) + 3,
            }))}
          />
        </TabsContent>

        {/* Locked Goals Tab */}
        <TabsContent value="locked" className="space-y-4">
          {lockedGoals > 0 ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">Locked Goals Management</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {lockedGoals} goal(s) are currently locked from employee editing.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={exportGoalsCsv}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>

              <div className="space-y-3">
                {lockedGoalsData.map((goal) => (
                  <Card key={goal.id} className="border-slate-200">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-950">{goal.title}</h4>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="bg-slate-100">
                            {goal.thrustArea}
                          </Badge>
                          <Badge variant="destructive" className="bg-red-100">
                            <Lock className="mr-1 h-3 w-3" />
                            Locked
                          </Badge>
                          <Badge variant="secondary">{goal.owner}</Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openUnlockDialog(goal)}
                        className="ml-4"
                      >
                        Unlock Goal
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card className="border-slate-200">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Lock className="mb-3 h-8 w-8 text-slate-400 opacity-50" />
                <p className="text-sm text-slate-600">No locked goals</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="space-y-4">
          <LazyAuditLogTable auditLogs={auditLogs} />
        </TabsContent>
      </Tabs>

      <UnlockGoalDialog
        open={unlockDialogOpen}
        onOpenChange={setUnlockDialogOpen}
        goal={selectedGoal}
        onUnlock={handleUnlockGoal}
      />
    </DashboardLayout>
  );
}
