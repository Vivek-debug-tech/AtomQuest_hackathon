import {
  mockActivities,
  mockApprovals,
  mockAuditLogs,
  mockCheckIns,
  mockGoals,
  mockMetrics,
  mockTeam,
  mockTrend,
  mockUser,
} from "@/data/mockData";
import { calculateGoalProgress, getAverageProgress, getTotalWeightage } from "@/lib/calculations";
import type {
  Approval,
  AuditLog,
  Goal,
  GoalCheckIn,
  GoalStatus,
  SharedGoal,
  TeamMemberSummary,
  UserRole,
} from "@/types";
import { getBrdCycleWindows, getQuarterKey, getQuarterLabel, getQuarterWindows, isQuarterSubmissionOpen } from "@/lib/quarters";
import type { AppSession } from "@/lib/auth/session";

export interface PortalNotification {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "success";
  audience: UserRole[];
  createdAt: string;
  channel?: "email" | "teams" | "system";
  deepLink?: string;
}

export interface EscalationRecord {
  id: string;
  title: string;
  owner: string;
  reason: string;
  severity: "medium" | "high";
  status: "Open" | "Watching" | "Resolved";
  dueDate: string;
}

export interface PortalSnapshot {
  currentUser: AppSession;
  goals: Goal[];
  approvals: Approval[];
  checkIns: GoalCheckIn[];
  auditLogs: AuditLog[];
  notifications: PortalNotification[];
  escalations: EscalationRecord[];
  sharedGoals: SharedGoal[];
  team: TeamMemberSummary[];
  quarterKey: string;
  quarterLabel: string;
  quarterWindows: ReturnType<typeof getQuarterWindows>;
  cycleWindows: ReturnType<typeof getBrdCycleWindows>;
  metrics: typeof mockMetrics;
  trend: typeof mockTrend;
  activities: typeof mockActivities;
}

const sharedGoals: SharedGoal[] = [
  {
    id: "share-001",
    goalId: "goal-001",
    sharedById: "mgr-001",
    sharedWithIds: ["user-002", "user-003"],
    permission: "comment",
    sharedAt: "2026-05-15T10:30:00Z",
    note: "Shared as a benchmark goal for similar people-ops initiatives.",
  },
  {
    id: "share-002",
    goalId: "goal-002",
    sharedById: "mgr-001",
    sharedWithIds: ["team-people-ops"],
    permission: "view",
    sharedAt: "2026-05-11T09:00:00Z",
    note: "Visible across the people operations team.",
  },
];

const notifications: PortalNotification[] = [
  {
    id: "notif-001",
    title: "Quarterly submission window is open",
    description: "Employees can submit only the active quarter check-in to maintain governance.",
    severity: "info",
    audience: ["Employee", "Manager", "Admin"],
    createdAt: "2026-05-19T08:00:00Z",
  },
  {
    id: "notif-002",
    title: "Email simulation queued",
    description: "Manager approval reminders are being simulated for overdue goal approvals.",
    severity: "warning",
    audience: ["Manager", "Admin"],
    createdAt: "2026-05-19T08:30:00Z",
  },
  {
    id: "notif-003",
    title: "Goal governance passed",
    description: "Latest goal plan meets the 100% weightage rule and lock-state audit policy.",
    severity: "success",
    audience: ["Employee", "Admin"],
    createdAt: "2026-05-19T09:00:00Z",
  },
];

function deriveEscalations(goals: Goal[], approvals: Approval[]) {
  const openApprovals = approvals.filter((approval) => approval.status === "Pending");
  const atRiskGoals = goals.filter((goal) => goal.status === "At Risk");

  return [
    ...openApprovals.map<EscalationRecord>((approval, index) => ({
      id: `esc-approval-${approval.id}`,
      title: `Pending approval ${index + 1}`,
      owner: approval.approverId ?? "Manager queue",
      reason: "Goal approval is pending beyond the ideal turnaround SLA.",
      severity: "high",
      status: "Open",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString().slice(0, 10),
    })),
    ...atRiskGoals.map<EscalationRecord>((goal) => ({
      id: `esc-goal-${goal.id}`,
      title: goal.title,
      owner: goal.owner,
      reason: "Goal is at risk and needs manager intervention or target recalibration.",
      severity: "medium",
      status: "Watching",
      dueDate: goal.nextCheckIn,
    })),
  ].slice(0, 6);
}

function enrichCheckins(goals: Goal[], checkins: GoalCheckIn[]) {
  return checkins.map((checkin) => {
    const goal = goals.find((item) => item.id === checkin.goalId);
    const target = Number.parseFloat(goal?.target ?? "0");
    const mode = goal?.evaluationMode ?? "higher-is-better";
    const progress = calculateGoalProgress({
      mode,
      achievement: checkin.actualAchievement,
      target,
      deadline: goal?.dueDate,
      completedAt: checkin.createdAt,
    });

    return {
      ...checkin,
      progress,
      reviewedBy: checkin.reviewedBy,
    };
  });
}

export function buildPortalSnapshot(session?: AppSession | null): PortalSnapshot {
  const currentUser = session ?? {
    userId: mockUser.id,
    name: mockUser.name,
    email: mockUser.email,
    role: mockUser.role,
    department: mockUser.department,
    avatarUrl: mockUser.avatarUrl,
  };

  const goals = mockGoals.map((goal) => ({
    ...goal,
    owner: currentUser.role === "Employee" ? currentUser.name : goal.owner,
  }));
  const approvals = mockApprovals.map((approval) => ({ ...approval }));
  const checkIns = enrichCheckins(goals, mockCheckIns);
  const auditLogs = mockAuditLogs.map((log) => ({ ...log }));

  return {
    currentUser,
    goals,
    approvals,
    checkIns,
    auditLogs,
    notifications,
    escalations: deriveEscalations(goals, approvals),
    sharedGoals,
    team: mockTeam,
    quarterKey: getQuarterKey(),
    quarterLabel: getQuarterLabel(),
    quarterWindows: getQuarterWindows(),
    cycleWindows: getBrdCycleWindows(),
    metrics: mockMetrics,
    trend: mockTrend,
    activities: mockActivities,
  };
}

export function getGoalStatusBreakdown(goals: Goal[]) {
  return (["Not Started", "On Track", "At Risk", "Completed"] as GoalStatus[]).map((status) => ({
    name: status,
    value: goals.filter((goal) => goal.status === status).length,
  }));
}

export function getGoalDistribution(goals: Goal[]) {
  return goals.map((goal) => ({
    name: goal.title.length > 20 ? `${goal.title.slice(0, 20)}...` : goal.title,
    weightage: goal.weightage,
    progress: goal.progress,
  }));
}

export function getCheckinCompletion(goals: Goal[], checkins: GoalCheckIn[]) {
  return goals.map((goal) => ({
    goalId: goal.id,
    goalTitle: goal.title,
    submitted: checkins.filter((checkin) => checkin.goalId === goal.id).length,
    progress: goal.progress,
  }));
}

export function getGoalGovernanceSummary(goals: Goal[]) {
  const totalWeightage = getTotalWeightage(goals);
  const validationIssues: string[] = [];

  if (totalWeightage !== 100) {
    validationIssues.push("Current goal plan does not meet the full 100% weightage planning rule.");
  }

  if (goals.length > 8) {
    validationIssues.push("More than 8 goals are assigned.");
  }

  if (goals.some((goal) => goal.weightage < 10)) {
    validationIssues.push("One or more goals are below the 10% minimum weightage.");
  }

  return {
    totalWeightage,
    averageProgress: getAverageProgress(goals),
    isQuarterOpen: isQuarterSubmissionOpen(getQuarterKey()),
    validationIssues,
  };
}
