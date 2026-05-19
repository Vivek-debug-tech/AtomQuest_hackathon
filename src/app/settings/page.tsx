"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Lock, ShieldCheck, UserCircle2, Workflow, MessageSquareShare } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ShellCard } from "@/components/layout/ShellCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { PageTitle } from "@/components/shared/PageTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useWorkflowSnapshot } from "@/hooks/useWorkflowSnapshot";
import { toastNotifications } from "@/lib/toast-notifications";
import type { UserRole } from "@/types";

type AdminCycleWindow = {
  id: string;
  key: string;
  label: string;
  opensOn: string;
  closesOn?: string;
  action: string;
  isActive: boolean;
};

type OrgHierarchyMember = {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  department: string;
  managerId?: string;
  skipLevelManagerId?: string;
  isActive: boolean;
};

type IntegrationAdapterState = {
  key: string;
  channel: "email" | "teams";
  enabled: boolean;
};

export default function SettingsPage() {
  const { session } = useAuth();
  const { snapshot } = useWorkflowSnapshot();
  const role = session?.role ?? "Employee";
  const isAdmin = role === "Admin";

  const [cycles, setCycles] = useState<AdminCycleWindow[]>([]);
  const [hierarchy, setHierarchy] = useState<OrgHierarchyMember[]>([]);
  const [adapterStatus, setAdapterStatus] = useState<IntegrationAdapterState[]>([]);

  const [cycleDraft, setCycleDraft] = useState({
    key: "",
    label: "",
    opensOn: "",
    closesOn: "",
    action: "",
  });

  const [memberDraft, setMemberDraft] = useState({
    userId: "",
    userName: "",
    role: "Employee" as UserRole,
    department: "",
    managerId: "",
    skipLevelManagerId: "",
  });

  const hierarchyLookup = useMemo(() => {
    return new Map(hierarchy.map((item) => [item.userId, item.userName]));
  }, [hierarchy]);

  useEffect(() => {
    if (!isAdmin) return;

    const loadAdminData = async () => {
      try {
        const [cycleResponse, hierarchyResponse, adapterResponse] = await Promise.all([
          fetch("/api/admin/cycles", { cache: "no-store" }),
          fetch("/api/admin/hierarchy", { cache: "no-store" }),
          fetch("/api/admin/integrations/status", { cache: "no-store" }),
        ]);

        if (cycleResponse.ok) {
          const cycleData = (await cycleResponse.json()) as AdminCycleWindow[];
          setCycles(cycleData);
        }

        if (hierarchyResponse.ok) {
          const hierarchyData = (await hierarchyResponse.json()) as OrgHierarchyMember[];
          setHierarchy(hierarchyData);
        }

        if (adapterResponse.ok) {
          const adapters = (await adapterResponse.json()) as { adapters: IntegrationAdapterState[] };
          setAdapterStatus(adapters.adapters);
        }
      } catch (error) {
        toastNotifications.error("Failed to load admin settings", error instanceof Error ? error.message : undefined);
      }
    };

    void loadAdminData();
  }, [isAdmin]);

  const createCycleWindow = async () => {
    if (!cycleDraft.key || !cycleDraft.label || !cycleDraft.opensOn || !cycleDraft.action) {
      toastNotifications.error("Missing cycle fields", "Key, label, opens-on date, and action are required.");
      return;
    }

    try {
      const response = await fetch("/api/admin/cycles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: cycleDraft.key,
          label: cycleDraft.label,
          opensOn: cycleDraft.opensOn,
          closesOn: cycleDraft.closesOn || undefined,
          action: cycleDraft.action,
          isActive: true,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Cycle creation failed");
      }

      const created = (await response.json()) as AdminCycleWindow;
      setCycles((current) => [...current, created].sort((a, b) => a.opensOn.localeCompare(b.opensOn)));
      setCycleDraft({ key: "", label: "", opensOn: "", closesOn: "", action: "" });
      toastNotifications.info("Cycle created", `${created.label} is now managed from admin settings.`);
    } catch (error) {
      toastNotifications.error("Failed to create cycle", error instanceof Error ? error.message : undefined);
    }
  };

  const toggleCycleState = async (cycle: AdminCycleWindow) => {
    try {
      const response = await fetch(`/api/admin/cycles/${cycle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !cycle.isActive }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Cycle update failed");
      }

      const updated = (await response.json()) as AdminCycleWindow;
      setCycles((current) => current.map((item) => (item.id === cycle.id ? updated : item)));
    } catch (error) {
      toastNotifications.error("Failed to update cycle", error instanceof Error ? error.message : undefined);
    }
  };

  const removeCycleWindow = async (cycleId: string) => {
    try {
      const response = await fetch(`/api/admin/cycles/${cycleId}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Cycle deletion failed");
      }
      setCycles((current) => current.filter((item) => item.id !== cycleId));
    } catch (error) {
      toastNotifications.error("Failed to delete cycle", error instanceof Error ? error.message : undefined);
    }
  };

  const upsertHierarchyMember = async () => {
    if (!memberDraft.userId || !memberDraft.userName || !memberDraft.department) {
      toastNotifications.error("Missing member fields", "User id, name, and department are required.");
      return;
    }

    try {
      const response = await fetch(`/api/admin/hierarchy/${memberDraft.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: memberDraft.userName,
          role: memberDraft.role,
          department: memberDraft.department,
          managerId: memberDraft.managerId || undefined,
          skipLevelManagerId: memberDraft.skipLevelManagerId || undefined,
          isActive: true,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Hierarchy upsert failed");
      }

      const member = (await response.json()) as OrgHierarchyMember;
      setHierarchy((current) => {
        const existing = current.some((item) => item.userId === member.userId);
        if (existing) {
          return current.map((item) => (item.userId === member.userId ? member : item));
        }
        return [...current, member].sort((a, b) => a.userName.localeCompare(b.userName));
      });
      setMemberDraft({
        userId: "",
        userName: "",
        role: "Employee",
        department: "",
        managerId: "",
        skipLevelManagerId: "",
      });
    } catch (error) {
      toastNotifications.error("Failed to upsert hierarchy member", error instanceof Error ? error.message : undefined);
    }
  };

  const deleteHierarchyMember = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/hierarchy/${userId}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Hierarchy delete failed");
      }
      setHierarchy((current) => current.filter((item) => item.userId !== userId));
    } catch (error) {
      toastNotifications.error("Failed to delete hierarchy member", error instanceof Error ? error.message : undefined);
    }
  };

  return (
    <DashboardLayout role={role} title="Settings" subtitle="Profile, notification, and governance settings.">
      <PageTitle
        eyebrow="Settings"
        title="Workspace settings"
        description="Role-aware profile details, notification preferences, and governance policies are surfaced here for production readiness."
      />

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Profile",
            copy: `${session?.name ?? "Portal user"} • ${session?.email ?? "user@company.com"}`,
            icon: UserCircle2,
          },
          {
            title: "Notifications",
            copy: "Quarterly reminders, approval escalations, email events, and Teams-style notifications are enabled.",
            icon: Bell,
          },
          {
            title: "Access Control",
            copy: `Current role: ${role}. Protected routes and redirects are active.`,
            icon: Lock,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <ShellCard key={item.title} className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-5 font-semibold text-slate-900">{item.title}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{item.copy}</p>
            </ShellCard>
          );
        })}
      </section>

      <ShellCard className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Governance defaults</p>
            <p className="mt-2 text-sm text-slate-600">
              Goal count is capped at 8, each goal must be at least 10% weightage, total weightage must equal 100%, and post-approval edits are locked unless unlocked by admin.
            </p>
          </div>
        </div>
      </ShellCard>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <ShellCard className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Workflow className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Cycle management preview</p>
              <p className="mt-2 text-sm text-slate-600">BRD-aligned cycle windows are surfaced here for admin visibility and future configuration work.</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {snapshot.cycleWindows.map((cycle) => (
              <div key={cycle.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-medium text-slate-900">{cycle.label}</p>
                <p className="mt-1 text-sm text-slate-600">Opens on {cycle.opensOn}</p>
                <p className="mt-1 text-xs text-slate-500">{cycle.action}</p>
              </div>
            ))}
          </div>
        </ShellCard>

        <ShellCard className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <MessageSquareShare className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Integration activity</p>
              <p className="mt-2 text-sm text-slate-600">Recent email and Teams-style notification events generated from real portal workflows.</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {snapshot.notifications.length > 0 ? (
              snapshot.notifications.slice(0, 6).map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{item.channel ?? "system"}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                  {item.deepLink ? <p className="mt-2 text-xs text-blue-700">Deep link: {item.deepLink}</p> : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No integration events yet.</p>
            )}
          </div>
        </ShellCard>
      </section>

      {isAdmin ? (
        <section className="grid gap-6 xl:grid-cols-[1.05fr_1fr]">
          <ShellCard className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Workflow className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Admin cycle management</p>
                <p className="mt-2 text-sm text-slate-600">Create, activate/deactivate, and remove cycle windows without code changes.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cycle-key">Cycle key</Label>
                <Input
                  id="cycle-key"
                  value={cycleDraft.key}
                  onChange={(event) => setCycleDraft((current) => ({ ...current, key: event.target.value }))}
                  placeholder="q1-2027"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cycle-label">Label</Label>
                <Input
                  id="cycle-label"
                  value={cycleDraft.label}
                  onChange={(event) => setCycleDraft((current) => ({ ...current, label: event.target.value }))}
                  placeholder="Q1 Check-in"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cycle-open">Opens on</Label>
                <Input
                  id="cycle-open"
                  type="date"
                  value={cycleDraft.opensOn}
                  onChange={(event) => setCycleDraft((current) => ({ ...current, opensOn: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cycle-close">Closes on (optional)</Label>
                <Input
                  id="cycle-close"
                  type="date"
                  value={cycleDraft.closesOn}
                  onChange={(event) => setCycleDraft((current) => ({ ...current, closesOn: event.target.value }))}
                />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <Label htmlFor="cycle-action">Action</Label>
              <Textarea
                id="cycle-action"
                value={cycleDraft.action}
                onChange={(event) => setCycleDraft((current) => ({ ...current, action: event.target.value }))}
                placeholder="Progress update - planned vs actual"
              />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Button onClick={createCycleWindow}>Create cycle</Button>
            </div>

            <div className="mt-5 space-y-3">
              {cycles.length > 0 ? (
                cycles.map((cycle) => (
                  <div key={cycle.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-slate-900">{cycle.label}</p>
                      <span className={`rounded-full px-3 py-1 text-xs ${cycle.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>
                        {cycle.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{cycle.key}</p>
                    <p className="mt-1 text-sm text-slate-600">Opens on {cycle.opensOn}{cycle.closesOn ? ` and closes on ${cycle.closesOn}` : ""}</p>
                    <p className="mt-2 text-sm text-slate-600">{cycle.action}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => toggleCycleState(cycle)}>
                        {cycle.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => removeCycleWindow(cycle.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No admin-managed cycles yet.</p>
              )}
            </div>
          </ShellCard>

          <ShellCard className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <MessageSquareShare className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Org hierarchy and integrations</p>
                <p className="mt-2 text-sm text-slate-600">Manage manager/skip-level relationships and monitor adapter readiness for external delivery.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="member-user-id">User id</Label>
                <Input
                  id="member-user-id"
                  value={memberDraft.userId}
                  onChange={(event) => setMemberDraft((current) => ({ ...current, userId: event.target.value }))}
                  placeholder="emp-010"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-name">User name</Label>
                <Input
                  id="member-name"
                  value={memberDraft.userName}
                  onChange={(event) => setMemberDraft((current) => ({ ...current, userName: event.target.value }))}
                  placeholder="Nina Shah"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-department">Department</Label>
                <Input
                  id="member-department"
                  value={memberDraft.department}
                  onChange={(event) => setMemberDraft((current) => ({ ...current, department: event.target.value }))}
                  placeholder="People Operations"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={memberDraft.role}
                  onValueChange={(value) => setMemberDraft((current) => ({ ...current, role: value as UserRole }))}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Employee">Employee</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-manager">Manager id (optional)</Label>
                <Input
                  id="member-manager"
                  value={memberDraft.managerId}
                  onChange={(event) => setMemberDraft((current) => ({ ...current, managerId: event.target.value }))}
                  placeholder="mgr-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-skip">Skip-level manager id (optional)</Label>
                <Input
                  id="member-skip"
                  value={memberDraft.skipLevelManagerId}
                  onChange={(event) => setMemberDraft((current) => ({ ...current, skipLevelManagerId: event.target.value }))}
                  placeholder="adm-001"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Button onClick={upsertHierarchyMember}>Create / update member</Button>
            </div>

            <div className="mt-5 space-y-3">
              {hierarchy.length > 0 ? (
                hierarchy.map((member) => (
                  <div key={member.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-slate-900">{member.userName}</p>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{member.role}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{member.userId}</p>
                    <p className="mt-1 text-sm text-slate-600">Department: {member.department}</p>
                    <p className="mt-1 text-sm text-slate-600">Manager: {member.managerId ? `${hierarchyLookup.get(member.managerId) ?? member.managerId} (${member.managerId})` : "Unassigned"}</p>
                    <p className="mt-1 text-sm text-slate-600">Skip level: {member.skipLevelManagerId ? `${hierarchyLookup.get(member.skipLevelManagerId) ?? member.skipLevelManagerId} (${member.skipLevelManagerId})` : "Unassigned"}</p>
                    <div className="mt-3">
                      <Button variant="outline" size="sm" onClick={() => deleteHierarchyMember(member.userId)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No hierarchy members found.</p>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-medium text-slate-900">Integration adapter readiness</p>
              <div className="mt-3 space-y-2">
                {adapterStatus.length > 0 ? (
                  adapterStatus.map((adapter) => (
                    <div key={adapter.key} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                      <p className="text-sm text-slate-700">{adapter.channel.toUpperCase()} adapter</p>
                      <span className={`rounded-full px-3 py-1 text-xs ${adapter.enabled ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {adapter.enabled ? "Configured" : "Simulated"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No adapter status available.</p>
                )}
              </div>
            </div>
          </ShellCard>
        </section>
      ) : null}
    </DashboardLayout>
  );
}
