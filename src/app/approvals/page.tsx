"use client";

import { AlertCircle, MailCheck, Share2 } from "lucide-react";

import { ApprovalTable } from "@/components/manager/ApprovalTable";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ShellCard } from "@/components/layout/ShellCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { PageTitle } from "@/components/shared/PageTitle";
import { useWorkflowSnapshot } from "@/hooks/useWorkflowSnapshot";
import { toastNotifications } from "@/lib/toast-notifications";

export default function ApprovalsPage() {
  const { session } = useAuth();
  const { snapshot, reload } = useWorkflowSnapshot();
  const role = session?.role ?? "Manager";

  return (
    <DashboardLayout role={role} title="Approvals Workspace" subtitle="Goal approvals, returns for rework, sharing, and escalation tracking.">
      <PageTitle
        eyebrow="Approvals"
        title="Approval and escalation workspace"
        description="Managers and admins can review pending goals, monitor escalations, and simulate approval reminders from one queue."
      />

      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <ApprovalTable
          approvals={snapshot.approvals.map((approval) => ({
            ...approval,
            goal: snapshot.goals.find((goal) => goal.id === approval.goalId),
          }))}
          onApprove={async (id) => {
            const response = await fetch(`/api/approvals/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "approve", comments: "Approved in approval workspace" }),
            });
            if (!response.ok) {
              const body = (await response.json().catch(() => null)) as { error?: string } | null;
              toastNotifications.error("Approval failed", body?.error);
              return;
            }
            toastNotifications.goalApproved();
            void reload();
          }}
          onReject={async (id) => {
            const response = await fetch(`/api/approvals/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "reject", comments: "Rejected in approval workspace" }),
            });
            if (!response.ok) {
              const body = (await response.json().catch(() => null)) as { error?: string } | null;
              toastNotifications.error("Rejection failed", body?.error);
              return;
            }
            toastNotifications.goalRejected();
            void reload();
          }}
          onReturn={async (id) => {
            const response = await fetch(`/api/approvals/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "return", comments: "Returned for rework" }),
            });
            if (!response.ok) {
              const body = (await response.json().catch(() => null)) as { error?: string } | null;
              toastNotifications.error("Return for rework failed", body?.error);
              return;
            }
            toastNotifications.info("Goal returned for rework with feedback.");
            void reload();
          }}
          onUpdateGoal={async (goalId, updates) => {
            const approval = snapshot.approvals.find((item) => item.goalId === goalId);
            if (!approval) return;
            const response = await fetch(`/api/approvals/${approval.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "return", comments: "Goal adjusted during review", ...updates }),
            });
            if (!response.ok) {
              const body = (await response.json().catch(() => null)) as { error?: string } | null;
              toastNotifications.error("Goal update failed", body?.error);
              return;
            }
            toastNotifications.success("Goal updated in the approval queue.");
            void reload();
          }}
        />

        <div className="space-y-6">
          <ShellCard className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <MailCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Email notification simulation</p>
                <p className="mt-2 text-sm text-slate-600">Approval reminders and escalation notices are represented as simulated outbound messages.</p>
              </div>
            </div>
          </ShellCard>

          <ShellCard className="p-6">
            <p className="text-sm font-semibold text-slate-900">Escalation monitor</p>
            <div className="mt-4 space-y-3">
              {snapshot.escalations.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <span className={`rounded-full px-3 py-1 text-xs ${item.severity === "high" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                      {item.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{item.reason}</p>
                </div>
              ))}
            </div>
          </ShellCard>

          <ShellCard className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Shared goals governance</p>
                <p className="mt-2 text-sm text-slate-600">Shared goals are visible with explicit permissions for view, comment, edit, and owner scopes.</p>
              </div>
            </div>
          </ShellCard>

          <ShellCard className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Lock policy</p>
                <p className="mt-2 text-sm text-slate-600">Approved goals are locked against employee edits and remain auditable for admin unlocks.</p>
              </div>
            </div>
          </ShellCard>
        </div>
      </section>
    </DashboardLayout>
  );
}
