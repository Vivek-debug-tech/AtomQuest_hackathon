import { randomUUID } from "crypto";

import {
  mockApprovals,
  mockAuditLogs,
  mockCheckIns,
  mockGoals,
} from "@/data/mockData";
import { getServerSession } from "@/lib/auth/session-server";
import { logApprovalAction, logAudit, logCheckinUpdate, logGoalUpdate } from "@/lib/audit";
import { fetchAuditLogs } from "@/lib/audit";
import { calculateGoalProgress } from "@/lib/calculations";
import {
  emitApprovalNotifications,
  emitCheckinNotifications,
  emitGoalSubmissionNotifications,
  fetchNotificationEvents,
  logNotificationEvent,
} from "@/lib/notifications";
import { resolveApprover, getSkipLevelForUser } from "@/lib/org-admin";
import { fetchAdminCycles } from "@/lib/org-admin";
import { buildPortalSnapshot } from "@/lib/portal-data";
import { getQuarterKey, getQuarterLabel, isQuarterSubmissionOpen } from "@/lib/quarters";
import {
  createGoal,
  fetchGoals,
  getSupabaseClient,
  isSupabaseConfigured,
  updateGoal,
} from "@/lib/supabase";
import type {
  Approval,
  ApprovalStatus,
  AuditLog,
  Goal,
  GoalCheckIn,
  GoalStatus,
  SharedGoal,
  UserRole,
} from "@/types";

type DbApprovalRow = {
  id: string;
  goal_id: string;
  requester_id: string;
  approver_id?: string | null;
  approver_role?: string | null;
  status: string;
  comments?: string | null;
  requested_at: string;
  responded_at?: string | null;
};

type DbCheckinRow = {
  id: string;
  goal_id: string;
  quarter_key: string;
  actual_achievement: number;
  planned_target: number;
  progress: number;
  status: string;
  comments: string;
  manager_comments?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_by: string;
  created_at: string;
};

type DbSharedGoalRow = {
  id: string;
  goal_id: string;
  shared_by_id: string;
  shared_with_ids: string[] | null;
  permission: string;
  shared_at: string;
  expires_at?: string | null;
  note?: string | null;
};

type DbEscalationRow = {
  id: string;
  goal_id?: string | null;
  title: string;
  owner: string;
  reason: string;
  severity: string;
  status: string;
  due_date?: string | null;
  created_at?: string | null;
};

type WorkflowStore = {
  approvals: Approval[];
  checkins: GoalCheckIn[];
  sharedGoals: SharedGoal[];
  escalations: Array<{
    id: string;
    goalId?: string;
    title: string;
    owner: string;
    reason: string;
    severity: "medium" | "high";
    status: "Open" | "Watching" | "Resolved";
    dueDate: string;
  }>;
  auditLogs: AuditLog[];
};

declare global {
  var __goalflowStore: WorkflowStore | undefined;
}

function createMemoryStore(): WorkflowStore {
  const seeded = buildPortalSnapshot();
  return {
    approvals: mockApprovals.map((item) => ({ ...item })),
    checkins: mockCheckIns.map((item) => ({ ...item })),
    sharedGoals: seeded.sharedGoals.map((item) => ({ ...item })),
    escalations: seeded.escalations.map((item) => ({
      ...item,
      goalId: item.id.startsWith("esc-goal-") ? item.id.replace("esc-goal-", "") : undefined,
    })),
    auditLogs: mockAuditLogs.map((item) => ({ ...item })),
  };
}

function getMemoryStore() {
  if (!global.__goalflowStore) {
    global.__goalflowStore = createMemoryStore();
  }
  return global.__goalflowStore;
}

function mapApproval(row: DbApprovalRow): Approval {
  return {
    id: row.id,
    goalId: row.goal_id,
    requesterId: row.requester_id,
    approverId: row.approver_id ?? undefined,
    approverRole: (row.approver_role as UserRole | null) ?? undefined,
    status: (row.status as ApprovalStatus) ?? "Pending",
    comments: row.comments ?? undefined,
    requestedAt: row.requested_at,
    respondedAt: row.responded_at ?? undefined,
  };
}

function mapCheckin(row: DbCheckinRow): GoalCheckIn {
  return {
    id: row.id,
    goalId: row.goal_id,
    quarterKey: row.quarter_key,
    actualAchievement: row.actual_achievement,
    plannedTarget: row.planned_target,
    progress: row.progress,
    status: row.status as GoalCheckIn["status"],
    comments: row.comments,
    managerComments: row.manager_comments ?? undefined,
    reviewedBy: row.reviewed_by ?? undefined,
    reviewedAt: row.reviewed_at ?? undefined,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

function mapSharedGoal(row: DbSharedGoalRow): SharedGoal {
  return {
    id: row.id,
    goalId: row.goal_id,
    sharedById: row.shared_by_id,
    sharedWithIds: row.shared_with_ids ?? [],
    permission: row.permission as SharedGoal["permission"],
    sharedAt: row.shared_at,
    expiresAt: row.expires_at ?? undefined,
    note: row.note ?? undefined,
  };
}

function mapEscalation(row: DbEscalationRow) {
  return {
    id: row.id,
    goalId: row.goal_id ?? undefined,
    title: row.title,
    owner: row.owner,
    reason: row.reason,
    severity: (row.severity as "medium" | "high") ?? "medium",
    status: (row.status as "Open" | "Watching" | "Resolved") ?? "Open",
    dueDate: row.due_date ?? new Date().toISOString().slice(0, 10),
  };
}

function deriveGoalStatus(progress: number): GoalStatus {
  if (progress >= 100) return "Completed";
  if (progress >= 65) return "On Track";
  if (progress > 0) return "At Risk";
  return "Not Started";
}

async function fetchApprovals(server = true) {
  if (!isSupabaseConfigured) {
    return getMemoryStore().approvals.map((item) => ({ ...item }));
  }

  const supabase = getSupabaseClient({ server });
  const { data, error } = await supabase
    .from("goal_approvals")
    .select("*")
    .order("requested_at", { ascending: false });

  if (error) throw error;
  return ((data as DbApprovalRow[] | null) ?? []).map(mapApproval);
}

async function fetchCheckins(server = true) {
  if (!isSupabaseConfigured) {
    return getMemoryStore().checkins.map((item) => ({ ...item }));
  }

  const supabase = getSupabaseClient({ server });
  const { data, error } = await supabase
    .from("goal_checkins")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data as DbCheckinRow[] | null) ?? []).map(mapCheckin);
}

async function fetchSharedGoals(server = true) {
  if (!isSupabaseConfigured) {
    return getMemoryStore().sharedGoals.map((item) => ({ ...item }));
  }

  const supabase = getSupabaseClient({ server });
  const { data, error } = await supabase
    .from("shared_goals")
    .select("*")
    .order("shared_at", { ascending: false });

  if (error) throw error;
  return ((data as DbSharedGoalRow[] | null) ?? []).map(mapSharedGoal);
}

async function fetchEscalations(server = true) {
  if (!isSupabaseConfigured) {
    return getMemoryStore().escalations.map((item) => ({ ...item }));
  }

  const supabase = getSupabaseClient({ server });
  const { data, error } = await supabase
    .from("goal_escalations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data as DbEscalationRow[] | null) ?? []).map(mapEscalation);
}

export async function getWorkflowSnapshot() {
  const session = await getServerSession();
  const [goals, approvals, checkins, sharedGoals, escalations, auditLogs, cycles] = await Promise.all([
    fetchGoals({ server: true }),
    fetchApprovals(true),
    fetchCheckins(true),
    fetchSharedGoals(true),
    fetchEscalations(true),
    isSupabaseConfigured ? fetchAuditLogs({ server: true, limit: 200 }) : Promise.resolve(getMemoryStore().auditLogs),
    fetchAdminCycles(true).catch(() => []),
  ]);

  const base = buildPortalSnapshot(session);
  const resolvedGoals = goals.length > 0 ? goals : base.goals;
  const resolvedApprovals = approvals.length > 0 ? approvals : base.approvals;
  const resolvedCheckins = checkins.length > 0 ? checkins : base.checkIns;
  const resolvedSharedGoals = sharedGoals.length > 0 ? sharedGoals : base.sharedGoals;
  const currentQuarterKey = getQuarterKey();
  const dynamicEscalations = await buildEscalations(resolvedGoals, resolvedApprovals, resolvedCheckins, currentQuarterKey);
  const notificationEvents = await fetchNotificationEvents(20).catch(() => []);

  return {
    ...base,
    goals: resolvedGoals,
    approvals: resolvedApprovals,
    checkIns: resolvedCheckins,
    sharedGoals: resolvedSharedGoals,
    escalations: dynamicEscalations.length > 0 ? dynamicEscalations : escalations.length > 0 ? escalations : base.escalations,
    auditLogs: auditLogs.length > 0 ? auditLogs : base.auditLogs,
    cycleWindows:
      cycles.length > 0
        ? cycles.map((cycle) => ({
            key: cycle.key,
            label: cycle.label,
            opensOn: cycle.opensOn,
            closesOn: cycle.closesOn,
            action: cycle.action,
            isActive: cycle.isActive,
          }))
        : base.cycleWindows,
    notifications: [
      ...notificationEvents.map((item) => ({
        id: item.id,
        title: item.subject,
        description: item.message,
        severity: item.channel === "teams" ? ("info" as const) : ("success" as const),
        audience: ["Employee", "Manager", "Admin"] as UserRole[],
        createdAt: item.createdAt,
        channel: item.channel,
        deepLink: item.deepLink,
      })),
      ...buildNotifications(resolvedApprovals, dynamicEscalations, currentQuarterKey),
    ].slice(0, 20),
  };
}

export async function pushSharedGoal(input: {
  sourceGoalId: string;
  recipients: Array<{ userId: string; ownerName: string; department?: string }>;
  sharedById?: string;
  sharedByName?: string;
}) {
  const session = await getServerSession();
  const actorId = input.sharedById ?? session?.userId ?? "mgr-001";
  const actorName = input.sharedByName ?? session?.name ?? "Manager";

  const goals = await fetchGoals({ server: true });
  const sourceGoal = goals.find((item) => item.id === input.sourceGoalId) ?? mockGoals.find((item) => item.id === input.sourceGoalId);
  if (!sourceGoal) throw new Error("Source goal not found");

  const createdGoals: Goal[] = [];
  const createdSharedLinks: SharedGoal[] = [];

  if (!isSupabaseConfigured) {
    const store = getMemoryStore();

    for (const recipient of input.recipients) {
      const clonedGoal: Goal = {
        ...sourceGoal,
        id: randomUUID(),
        owner: recipient.ownerName,
        progress: sourceGoal.progress,
        actualAchievement: sourceGoal.actualAchievement,
        approvalStatus: "Pending",
        isLocked: false,
        sharedSourceGoalId: sourceGoal.sharedSourceGoalId ?? sourceGoal.id,
        sharedEditMode: "weightage-only",
      };
      mockGoals.unshift(clonedGoal);
      createdGoals.push(clonedGoal);

      const link: SharedGoal = {
        id: randomUUID(),
        goalId: clonedGoal.id,
        sharedById: actorId,
        sharedWithIds: [recipient.userId],
        permission: "edit",
        sharedAt: new Date().toISOString(),
        note: "Department KPI pushed as a shared goal. Title and target stay read-only.",
      };
      store.sharedGoals.unshift(link);
      createdSharedLinks.push(link);

      store.approvals.unshift({
        id: randomUUID(),
        goalId: clonedGoal.id,
        requesterId: recipient.userId,
        approverId: sourceGoal.managerId ?? (await resolveApprover(recipient.userId)) ?? "mgr-001",
        approverRole: "Manager",
        status: "Pending",
        comments: "Shared KPI awaiting recipient weightage confirmation.",
        requestedAt: new Date().toISOString(),
      });
    }

    await logAudit({
      action: "share",
      entityType: "Goal",
      entityId: sourceGoal.id,
      performedById: actorId,
      performedByName: actorName,
      performedByRole: session?.role,
      details: { recipients: input.recipients.map((item) => item.userId) },
    });
    for (const recipient of input.recipients) {
      await logNotificationEvent({
        eventType: "goal_shared",
        channel: "email",
        recipient: recipient.ownerName,
        subject: "Shared goal assigned",
        message: "A shared departmental KPI was pushed to your goal sheet. Only weightage is editable.",
        deepLink: `/goals/${sourceGoal.id}`,
      });
    }

    return { createdGoals, sharedLinks: createdSharedLinks };
  }

  const supabase = getSupabaseClient({ server: true });

  for (const recipient of input.recipients) {
    const createdGoal = await createGoal(
      {
        id: randomUUID(),
        thrust_area: sourceGoal.thrustArea,
        title: sourceGoal.title,
        description: sourceGoal.description,
        uom_type: sourceGoal.uomType,
        target: sourceGoal.target,
        weightage: sourceGoal.weightage,
        progress: sourceGoal.progress,
        status: sourceGoal.status,
        owner_id: recipient.userId,
        owner: recipient.ownerName,
        due_date: sourceGoal.dueDate,
        next_check_in: sourceGoal.nextCheckIn,
        last_updated: new Date().toISOString().slice(0, 10),
        is_locked: false,
        approval_status: "Pending",
        shared_source_goal_id: sourceGoal.sharedSourceGoalId ?? sourceGoal.id,
        shared_edit_mode: "weightage-only",
      },
      { server: true },
    );

    createdGoals.push(createdGoal);

    const { data: sharedData, error: sharedError } = await supabase
      .from("shared_goals")
      .insert({
        goal_id: createdGoal.id,
        shared_by_id: actorId,
        shared_with_ids: [recipient.userId],
        permission: "edit",
        note: "Department KPI pushed as a shared goal. Title and target stay read-only.",
      })
      .select("*")
      .single();

    if (sharedError) throw sharedError;
    createdSharedLinks.push(mapSharedGoal(sharedData as DbSharedGoalRow));

    const approverForRecipient = sourceGoal.managerId ?? (await resolveApprover(recipient.userId)) ?? "mgr-001";
    const { error: approvalError } = await supabase.from("goal_approvals").insert({
      goal_id: createdGoal.id,
      requester_id: recipient.userId,
      approver_id: approverForRecipient,
      approver_role: "Manager",
      status: "Pending",
      comments: "Shared KPI awaiting recipient weightage confirmation.",
    });

    if (approvalError) throw approvalError;
  }

  await logAudit({
    action: "share",
    entityType: "Goal",
    entityId: sourceGoal.id,
    performedById: actorId,
    performedByName: actorName,
    performedByRole: session?.role,
    details: { recipients: input.recipients.map((item) => item.userId) },
  });
  for (const recipient of input.recipients) {
    await logNotificationEvent({
      eventType: "goal_shared",
      channel: "email",
      recipient: recipient.ownerName,
      subject: "Shared goal assigned",
      message: "A shared departmental KPI was pushed to your goal sheet. Only weightage is editable.",
      deepLink: `/goals/${sourceGoal.id}`,
    });
  }

  return { createdGoals, sharedLinks: createdSharedLinks };
}

async function buildEscalations(goals: Goal[], approvals: Approval[], checkins: GoalCheckIn[], currentQuarterKey: string) {
  const approvalSlaDays = 3;
  const overdueCutoff = Date.now() - approvalSlaDays * 24 * 60 * 60 * 1000;

  const approvalEscalations = await Promise.all(
    approvals
      .filter((approval) => approval.status === "Pending")
      .map(async (approval) => {
        const requestedAtMs = new Date(approval.requestedAt).getTime();
        const isOverdue = Number.isFinite(requestedAtMs) && requestedAtMs <= overdueCutoff;
        const skipLevelOwner = isOverdue ? await getSkipLevelForUser(approval.requesterId) : undefined;

        return {
          id: `escalation-approval-${approval.id}`,
          goalId: approval.goalId,
          title: isOverdue ? "Skip-level approval escalation" : "Manager approval pending",
          owner: skipLevelOwner ?? approval.approverId ?? "Manager queue",
          reason: isOverdue
            ? "Direct manager has not responded within the approval SLA, so this is escalated to the skip-level manager."
            : "Manager review is still pending within the current approval window.",
          severity: "high" as const,
          status: "Open" as const,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString().slice(0, 10),
        };
      }),
  );

  const items = [
    ...approvalEscalations,
    ...goals
      .filter((goal) => !checkins.some((checkin) => checkin.goalId === goal.id && checkin.quarterKey === currentQuarterKey))
      .filter((goal) => goal.approvalStatus === "Approved")
      .map((goal) => ({
        id: `escalation-checkin-${goal.id}`,
        goalId: goal.id,
        title: "Quarterly check-in missing",
        owner: goal.owner,
        reason: `${getQuarterLabel()} update has not been submitted within the active window.`,
        severity: "medium" as const,
        status: "Watching" as const,
        dueDate: goal.nextCheckIn,
      })),
  ];

  return items.slice(0, 8);
}

function buildNotifications(
  approvals: Approval[],
  escalations: Awaited<ReturnType<typeof buildEscalations>>,
  currentQuarterKey: string,
) {
  return [
    {
      id: "notif-quarter-window",
      title: "Quarterly cycle is active",
      description: `${currentQuarterKey} submissions are open for employee updates and manager reviews.`,
      severity: "info" as const,
      audience: ["Employee", "Manager", "Admin"] as UserRole[],
      createdAt: new Date().toISOString(),
    },
    {
      id: "notif-approval-reminder",
      title: "Approval notification simulated",
      description: `${approvals.filter((item) => item.status === "Pending").length} pending approvals would trigger manager and Teams reminders.`,
      severity: "warning" as const,
      audience: ["Manager", "Admin"] as UserRole[],
      createdAt: new Date().toISOString(),
    },
    {
      id: "notif-escalation-summary",
      title: "Escalation engine evaluated",
      description: `${escalations.length} escalation item(s) are currently active for Admin oversight.`,
      severity: "success" as const,
      audience: ["Admin"] as UserRole[],
      createdAt: new Date().toISOString(),
    },
  ];
}

export async function createGoalsBatch(input: { goals: Goal[]; ownerId?: string; ownerName?: string; managerId?: string }) {
  const session = await getServerSession();
  const requesterId = input.ownerId ?? session?.userId ?? "emp-001";
  const ownerName = input.ownerName ?? session?.name ?? "Employee";
  const approverId = input.managerId ?? (await resolveApprover(requesterId)) ?? "mgr-001";

  if (!isSupabaseConfigured) {
    const store = getMemoryStore();
    const createdGoals = input.goals.map((goal) => ({
      ...goal,
      owner: ownerName,
      approvalStatus: "Pending" as const,
      managerId: approverId,
    }));

    mockGoals.splice(0, 0, ...createdGoals);
    store.approvals.unshift(
      ...createdGoals.map((goal) => ({
        id: randomUUID(),
        goalId: goal.id,
        requesterId,
        approverId,
        approverRole: "Manager" as const,
        status: "Pending" as const,
        comments: "Awaiting manager review",
        requestedAt: new Date().toISOString(),
      })),
    );

    for (const goal of createdGoals) {
      if (goal.sharedWith && goal.sharedWith.length > 0) {
        store.sharedGoals.unshift({
          id: randomUUID(),
          goalId: goal.id,
          sharedById: requesterId,
          sharedWithIds: goal.sharedWith,
          permission: "comment",
          sharedAt: new Date().toISOString(),
          note: "Shared during goal planning.",
        });
      }
      await emitGoalSubmissionNotifications(goal.id, approverId);
    }

    return createdGoals;
  }

  const created: Goal[] = [];
  for (const goal of input.goals) {
    const inserted = await createGoal(
      {
        id: goal.id,
        thrust_area: goal.thrustArea,
        title: goal.title,
        description: goal.description,
        uom_type: goal.uomType,
        target: goal.target,
        weightage: goal.weightage,
        progress: goal.progress,
        status: goal.status,
        owner_id: requesterId,
        owner: ownerName,
        due_date: goal.dueDate,
        next_check_in: goal.nextCheckIn,
        last_updated: goal.lastUpdated,
        approval_status: "Pending",
        is_locked: false,
      },
      { server: true },
    );

    created.push(inserted);

    const supabase = getSupabaseClient({ server: true });
    await supabase.from("goal_approvals").insert({
      goal_id: inserted.id,
      requester_id: requesterId,
      approver_id: approverId,
      approver_role: "Manager",
      status: "Pending",
      comments: "Awaiting manager review",
    });
    await emitGoalSubmissionNotifications(inserted.id, approverId);

    if (goal.sharedWith && goal.sharedWith.length > 0) {
      await supabase.from("shared_goals").insert({
        goal_id: inserted.id,
        shared_by_id: requesterId,
        shared_with_ids: goal.sharedWith,
        permission: "comment",
        note: "Shared during goal planning.",
      });
    }

    await logGoalUpdate({
      goalId: inserted.id,
      userId: requesterId,
      userName: ownerName,
      description: "Goal created and submitted for approval",
    });
  }

  return created;
}

export async function updateApproval(input: {
  approvalId: string;
  action: "approve" | "reject" | "return";
  comments?: string;
  target?: string;
  weightage?: number;
}) {
  const session = await getServerSession();
  const actorId = session?.userId ?? "mgr-001";
  const actorName = session?.name ?? "Manager";
  const actorRole = session?.role ?? "Manager";

  if (!isSupabaseConfigured) {
    const store = getMemoryStore();
    const approval = store.approvals.find((item) => item.id === input.approvalId);
    if (!approval) throw new Error("Approval not found");

    approval.status = input.action === "return" ? "Pending" : input.action === "approve" ? "Approved" : "Rejected";
    approval.comments = input.comments ?? approval.comments;
    approval.approverId = actorId;
    approval.approverRole = actorRole;
    approval.respondedAt = new Date().toISOString();

    const goal = mockGoals.find((item) => item.id === approval.goalId);
    if (goal) {
      if (input.target && goal.sharedEditMode !== "weightage-only") goal.target = input.target;
      if (typeof input.weightage === "number") goal.weightage = input.weightage;
      goal.approvalStatus = approval.status;
      goal.isLocked = approval.status === "Approved";
      goal.lastUpdated = new Date().toISOString().slice(0, 10);
    }
    await emitApprovalNotifications(approval.goalId, approval.requesterId, approval.status === "Approved");

    return { approval, goal };
  }

  const approvals = await fetchApprovals(true);
  const current = approvals.find((item) => item.id === input.approvalId);
  if (!current) throw new Error("Approval not found");

  const status: ApprovalStatus = input.action === "return" ? "Pending" : input.action === "approve" ? "Approved" : "Rejected";
  const supabase = getSupabaseClient({ server: true });
  const goalForRules = (await fetchGoals({ server: true })).find((item) => item.id === current.goalId);
  const normalizedTarget = goalForRules?.sharedEditMode === "weightage-only" ? undefined : input.target;

  const { data, error } = await supabase
    .from("goal_approvals")
    .update({
      status,
      comments: input.comments ?? current.comments ?? null,
      approver_id: actorId,
      approver_role: actorRole,
      responded_at: new Date().toISOString(),
    })
    .eq("id", input.approvalId)
    .select("*")
    .single();

  if (error) throw error;

  const goal = await updateGoal(
    current.goalId,
    {
      approval_status: status,
      is_locked: status === "Approved",
      target: normalizedTarget,
      weightage: input.weightage,
      last_updated: new Date().toISOString().slice(0, 10),
    },
    { server: true },
  );

  await logApprovalAction({
    approvalId: input.approvalId,
    userId: actorId,
    userName: actorName,
    action: input.action === "return" ? "create" : input.action === "approve" ? "approve" : "reject",
    description: input.comments,
  });
  await emitApprovalNotifications(current.goalId, current.requesterId, status === "Approved");

  return { approval: mapApproval(data as DbApprovalRow), goal };
}

export async function submitCheckin(input: {
  goalId: string;
  actualAchievement: number;
  status: GoalCheckIn["status"];
  comments: string;
}) {
  const session = await getServerSession();
  const currentQuarterKey = getQuarterKey();
  if (!isQuarterSubmissionOpen(currentQuarterKey)) {
    throw new Error("Quarterly submission window is closed");
  }

  const goals = await fetchGoals({ server: true });
  const goal = goals.find((item) => item.id === input.goalId) ?? mockGoals.find((item) => item.id === input.goalId);
  if (!goal) throw new Error("Goal not found");

  const target = Number.parseFloat(goal.target || "0");
  const progress = calculateGoalProgress({
    mode: goal.evaluationMode ?? "higher-is-better",
    achievement: input.actualAchievement,
    target,
    deadline: goal.dueDate,
    completedAt: new Date().toISOString(),
  });

  if (!isSupabaseConfigured) {
    const store = getMemoryStore();
    if (goal.sharedSourceGoalId) {
      throw new Error("Shared goal recipients cannot submit achievement updates directly. Updates sync from the primary owner.");
    }
    const checkin: GoalCheckIn = {
      id: randomUUID(),
      goalId: input.goalId,
      quarterKey: currentQuarterKey,
      actualAchievement: input.actualAchievement,
      plannedTarget: target,
      progress,
      status: input.status,
      comments: input.comments,
      createdBy: session?.name ?? "Employee",
      createdAt: new Date().toISOString(),
    };

    store.checkins.unshift(checkin);
    const fallbackGoal = mockGoals.find((item) => item.id === input.goalId);
    if (fallbackGoal) {
      fallbackGoal.actualAchievement = input.actualAchievement;
      fallbackGoal.progress = progress;
      fallbackGoal.status = deriveGoalStatus(progress);
    }
    syncSharedGoalProgress({
      rootGoalId: goal.sharedSourceGoalId ?? goal.id,
      actualAchievement: input.actualAchievement,
      progress,
      status: deriveGoalStatus(progress),
    });
    await emitCheckinNotifications(goal.id, goal.managerId ?? "mgr-001");

    return checkin;
  }

  const supabase = getSupabaseClient({ server: true });
  if (goal.sharedSourceGoalId) {
    throw new Error("Shared goal recipients cannot submit achievement updates directly. Updates sync from the primary owner.");
  }
  const { data, error } = await supabase
    .from("goal_checkins")
    .insert({
      goal_id: input.goalId,
      quarter_key: currentQuarterKey,
      actual_achievement: input.actualAchievement,
      planned_target: target,
      progress,
      status: input.status,
      comments: input.comments,
      created_by: session?.name ?? session?.userId ?? "Employee",
    })
    .select("*")
    .single();

  if (error) throw error;

  await updateGoal(
    input.goalId,
    {
      progress,
      status: deriveGoalStatus(progress),
      last_updated: new Date().toISOString().slice(0, 10),
    },
    { server: true },
  );

  await syncSharedGoalProgress({
    rootGoalId: goal.sharedSourceGoalId ?? goal.id,
    actualAchievement: input.actualAchievement,
    progress,
    status: deriveGoalStatus(progress),
  });

  await logCheckinUpdate({
    checkinId: (data as DbCheckinRow).id,
    goalId: input.goalId,
    userId: session?.userId,
    userName: session?.name,
    description: "Quarterly check-in submitted",
  });
  await emitCheckinNotifications(goal.id, goal.managerId ?? "mgr-001");

  return mapCheckin(data as DbCheckinRow);
}

async function syncSharedGoalProgress(input: {
  rootGoalId: string;
  actualAchievement: number;
  progress: number;
  status: GoalStatus;
}) {
  const rootId = input.rootGoalId;

  if (!isSupabaseConfigured) {
    for (const goal of mockGoals) {
      if (goal.sharedSourceGoalId === rootId && goal.id !== rootId) {
        goal.actualAchievement = input.actualAchievement;
        goal.progress = input.progress;
        goal.status = input.status;
        goal.lastUpdated = new Date().toISOString().slice(0, 10);
      }
    }
    return;
  }

  const supabase = getSupabaseClient({ server: true });
  const { data, error } = await supabase
    .from("goals")
    .select("id")
    .eq("shared_source_goal_id", rootId);

  if (error) throw error;

  const linkedGoals = ((data as Array<{ id: string }> | null) ?? []).map((item) => item.id);
  if (linkedGoals.length === 0) return;

  const { error: updateError } = await supabase
    .from("goals")
    .update({
      progress: input.progress,
      status: input.status,
      last_updated: new Date().toISOString().slice(0, 10),
    })
    .in("id", linkedGoals);

  if (updateError) throw updateError;
}

export async function reviewCheckin(input: { checkinId: string; managerComments: string }) {
  const session = await getServerSession();

  if (!isSupabaseConfigured) {
    const store = getMemoryStore();
    const checkin = store.checkins.find((item) => item.id === input.checkinId);
    if (!checkin) throw new Error("Check-in not found");
    checkin.reviewedBy = session?.name ?? "Manager";
    checkin.reviewedAt = new Date().toISOString();
    checkin.managerComments = input.managerComments;
    return checkin;
  }

  const supabase = getSupabaseClient({ server: true });
  const { data, error } = await supabase
    .from("goal_checkins")
    .update({
      reviewed_by: session?.name ?? session?.userId ?? "Manager",
      reviewed_at: new Date().toISOString(),
      manager_comments: input.managerComments,
    })
    .eq("id", input.checkinId)
    .select("*")
    .single();

  if (error) throw error;

  await logAudit({
    action: "update",
    entityType: "CheckInReview",
    entityId: input.checkinId,
    performedById: session?.userId,
    performedByName: session?.name,
    performedByRole: session?.role,
    details: { managerComments: input.managerComments },
  });
  const checkinGoalId = (data as DbCheckinRow).goal_id;
  await emitCheckinNotifications(checkinGoalId, session?.userId ?? session?.name ?? "Employee", true);

  return mapCheckin(data as DbCheckinRow);
}
