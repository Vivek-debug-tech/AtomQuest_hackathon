"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, BarChart3, CalendarCheck2, CheckCircle2, Download, ShieldCheck, Users } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageTitle } from "@/components/shared/PageTitle";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { TeamOverview } from "@/components/manager/TeamOverview";
import { ApprovalTable } from "@/components/manager/ApprovalTable";
import { FeedbackDialog } from "@/components/manager/FeedbackDialog";
import { ChartLoader } from "@/components/shared/loading-skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { mockApprovals, mockAuditLogs, mockCheckIns, mockGoals, mockMetrics, mockTeam } from "@/data/mockData";
import { mutateGoalLockState } from "@/lib/goal-lock-client";
import type { Approval, Goal } from "@/types";
import { toastNotifications } from "@/lib/toast-notifications";

const TeamPerformanceCharts = dynamic(() => import("@/components/manager/TeamPerformanceCharts").then((mod) => mod.TeamPerformanceCharts), {
  ssr: false,
  loading: () => <ChartLoader />,
});

type ApprovalRow = Approval & { goal?: Goal };

function formatShortDate(value?: string) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return value;
  }
}

export default function ManagerDashboardPage() {
  const [goals, setGoals] = useState<Goal[]>(mockGoals.map((goal) => ({ ...goal })));
  const [approvals, setApprovals] = useState<ApprovalRow[]>(
    mockApprovals.map((approval) => ({ ...approval, goal: goals.find((goal) => goal.id === approval.goalId) })),
  );
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);

  const pendingCount = approvals.filter((approval) => approval.status === "Pending").length;
  const completedGoals = goals.filter((goal) => goal.status === "Completed").length;
  const averageCompletion = Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length);

  const teamCompletion = useMemo(() => mockTeam.reduce((sum, member) => sum + member.completionRate, 0) / mockTeam.length, []);

  const openFeedback = (approvalId: string) => {
    setSelectedApprovalId(approvalId);
    setFeedbackOpen(true);
  };

  const patchApproval = (approvalId: string, status: Approval["status"], comments?: string) => {
    const selectedApproval = approvals.find((approval) => approval.id === approvalId);
    const goalId = selectedApproval?.goalId;

    setApprovals((current) =>
      current.map((approval) => {
        if (approval.id !== approvalId) return approval;

        const goal = goals.find((item) => item.id === approval.goalId);
        return {
          ...approval,
          status,
          comments: comments || approval.comments,
          respondedAt: new Date().toISOString(),
          approverId: "mgr-001",
          goal: goal
            ? {
                ...goal,
                approvalStatus: status,
                isLocked: status === "Approved",
                lastUpdated: new Date().toISOString().slice(0, 10),
              }
            : undefined,
        };
      }),
    );

    setGoals((current) =>
      current.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              approvalStatus: status,
              isLocked: status === "Approved",
              status: status === "Approved" ? "On Track" : goal.status,
              lastUpdated: new Date().toISOString().slice(0, 10),
            }
          : goal,
      ),
    );

    if (selectedApproval && status === "Approved" && goalId) {
      void mutateGoalLockState(goalId, {
        action: "lock",
        performedById: "mgr-001",
        performedByName: "Manager Lee",
        reason: "Locked automatically after manager approval",
      }).catch((error) => {
        console.error("Failed to persist goal lock", error);
      });

      toastNotifications.goalApproved();
    }
  };

  const handleUpdateGoal = (goalId: string, updates: { target?: string; weightage?: number }) => {
    setGoals((current) =>
      current.map((goal) => {
        if (goal.id !== goalId) return goal;
        return {
          ...goal,
          target: updates.target ?? goal.target,
          weightage: updates.weightage ?? goal.weightage,
          lastUpdated: new Date().toISOString().slice(0, 10),
        };
      }),
    );

    // Update the approval to reflect goal changes
    setApprovals((current) =>
      current.map((approval) => {
        if (approval.goalId !== goalId) return approval;
        const updatedGoal = goals.find((g) => g.id === goalId);
        return {
          ...approval,
          goal: updatedGoal
            ? {
                ...updatedGoal,
                target: updates.target ?? updatedGoal.target,
                weightage: updates.weightage ?? updatedGoal.weightage,
              }
            : approval.goal,
        };
      }),
    );
  };

  const currentApproval = approvals.find((approval) => approval.id === selectedApprovalId);

  const recentApprovals = approvals.filter((approval) => approval.status !== "Pending").slice(0, 3);

  return (
    <DashboardLayout
      role="Manager"
      title="Manager Dashboard"
      subtitle="Review team goals, approve submissions, and track quarterly execution health."
    >
      <PageTitle
        eyebrow="Team oversight"
        title="Manager execution console"
        description="A single view for approvals, team completion, check-ins, and review actions."
      />

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-slate-500">Pending Approvals</p>
              <p className="mt-1 text-3xl font-semibold text-slate-950"><AnimatedNumber value={pendingCount} /></p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <CalendarCheck2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-slate-500">Team Completion</p>
              <p className="mt-1 text-3xl font-semibold text-slate-950"><AnimatedNumber value={Math.round(teamCompletion)} suffix="%" /></p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-slate-500">Completed Goals</p>
              <p className="mt-1 text-3xl font-semibold text-slate-950"><AnimatedNumber value={completedGoals} /></p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-slate-500">Average Progress</p>
              <p className="mt-1 text-3xl font-semibold text-slate-950"><AnimatedNumber value={averageCompletion} suffix="%" /></p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <BarChart3 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </section>

      <TeamOverview metrics={mockMetrics} team={mockTeam} />

      <TeamPerformanceCharts />

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <ApprovalTable
          approvals={approvals}
          onApprove={(id) => patchApproval(id, "Approved", "Approved from manager dashboard")}
          onReject={(id) => {
            patchApproval(id, "Rejected", "Rejected after review");
            toastNotifications.goalRejected();
          }}
          onReturn={openFeedback}
          onUpdateGoal={handleUpdateGoal}
        />

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
            <CardHeader>
              <CardTitle>Quarterly Check-in Reminders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockTeam.map((member) => (
                <div key={member.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-950">{member.name}</p>
                      <p className="text-xs text-slate-500">Next review: {formatShortDate(member.nextCheckIn)}</p>
                    </div>
                    <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                      Due soon
                    </Badge>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Completion</span>
                      <span>{member.completionRate}%</span>
                    </div>
                    <Progress value={member.completionRate} className="h-2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockCheckIns.slice(0, 4).map((checkIn) => (
                <div key={checkIn.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-950">{checkIn.comments}</p>
                      <p className="text-xs text-slate-500">Submitted by {checkIn.createdBy} · {formatShortDate(checkIn.createdAt)}</p>
                    </div>
                    <StatusBadge status={checkIn.status === "Completed" ? "Completed" : checkIn.status === "On Track" ? "On Track" : "Not Started"} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle>Employee Progress Table</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/analytics">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Goals</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Check-in</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTeam.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium text-slate-950">{member.name}</TableCell>
                    <TableCell>{member.goalsAssigned}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Progress value={member.completionRate} className="h-2 w-28" />
                        <span className="text-xs text-slate-500">{member.completionRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.pendingApprovals > 0 ? "secondary" : "default"}>
                        {member.pendingApprovals > 0 ? "Needs attention" : "On track"}
                      </Badge>
                    </TableCell>
                    <TableCell>{member.nextCheckIn}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <CardHeader>
            <CardTitle>Activity & Audit Trail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentApprovals.map((approval) => (
              <div key={approval.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-950">{approval.goal?.title || approval.goalId}</p>
                  <StatusBadge status={approval.status === "Approved" ? "Completed" : approval.status === "Rejected" ? "At Risk" : "On Track"} />
                </div>
                <p className="mt-2 text-sm text-slate-500">{approval.comments}</p>
              </div>
            ))}
            {mockAuditLogs.slice(0, 2).map((log) => (
              <div key={log.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-950">{log.action.toUpperCase()} · {log.entityType}</p>
                  <Badge variant="outline">{formatShortDate(log.timestamp)}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">Performed by {log.performedByRole || "System"}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <FeedbackDialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        title="Return goal for rework"
        description={currentApproval?.goal?.title || "Add structured feedback to help the employee revise the goal."}
        onSubmit={(message) => {
          if (!selectedApprovalId) return;
          patchApproval(selectedApprovalId, "Pending", message);
          setSelectedApprovalId(null);
        }}
      />

      <Card className="border-dashed border-slate-300 bg-slate-50 shadow-none">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              Goals are locked after approval
            </p>
            <p className="mt-1 text-sm text-slate-500">Approved goals are marked read-only for employees and can only be changed by managers or admins.</p>
          </div>
          <Button asChild>
            <Link href="/analytics">
              <AlertCircle className="mr-2 h-4 w-4" />
              Open analytics
            </Link>
          </Button>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
