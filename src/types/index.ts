export type UserRole = "Employee" | "Manager" | "Admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
}

export type GoalStatus = "Not Started" | "On Track" | "At Risk" | "Completed";

export interface Goal {
  id: string;
  thrustArea: string;
  title: string;
  description: string;
  uomType: string;
  target: string;
  weightage: number;
  progress: number;
  status: GoalStatus;
  owner: string;
  dueDate: string;
  nextCheckIn: string;
  lastUpdated: string;
  isLocked?: boolean;
  approvalStatus?: ApprovalStatus;
  evaluationMode?: "higher-is-better" | "lower-is-better" | "zero-based" | "timeline";
  actualAchievement?: number;
}

export interface GoalUpdate {
  id: string;
  goalId: string;
  progress: number;
  notes: string;
  updatedBy: string;
  updatedAt: string;
}

export type CheckInStatus = "Not Started" | "On Track" | "Completed";

export interface GoalCheckIn {
  id: string;
  goalId: string;
  actualAchievement: number;
  plannedTarget: number;
  progress: number;
  status: CheckInStatus;
  comments: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdBy: string;
  createdAt: string;
}

/**
 * Approval workflow record for enterprise goal approvals
 */
export type ApprovalStatus = "Pending" | "Approved" | "Rejected";

export interface Approval {
  id: string;
  goalId: string;
  requesterId: string; // user who requested approval
  approverId?: string; // user who approved/rejected (optional until resolved)
  approverRole?: UserRole;
  status: ApprovalStatus;
  comments?: string;
  requestedAt: string; // ISO date
  respondedAt?: string; // ISO date when approved/rejected
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  tone: "blue" | "emerald" | "amber" | "slate";
}

export interface GoalTrendPoint {
  label: string;
  progress: number;
  target: number;
}

/**
 * A SharedGoal represents a goal shared across teams or users with permissions
 */
export type SharePermission = "view" | "comment" | "edit" | "owner";

export interface SharedGoal {
  id: string;
  goalId: string;
  sharedById: string;
  sharedWithIds: string[]; // user ids or team ids
  permission: SharePermission;
  sharedAt: string;
  expiresAt?: string;
  note?: string;
}

/**
 * Audit log entry for tracking changes and important events
 */
export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "approve"
  | "reject"
  | "lock"
  | "unlock"
  | "share"
  | "signin"
  | "signout";

export interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: string; // e.g. 'Goal', 'User', 'Approval'
  entityId: string;
  performedById?: string;
  performedByName?: string;
  performedByRole?: UserRole;
  timestamp: string; // ISO date
  details?: Record<string, unknown>;
}

export interface TeamMemberSummary {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  goalsAssigned: number;
  completionRate: number;
  pendingApprovals: number;
  nextCheckIn: string;
  lastActivity: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  trend?: string;
  tone?: "blue" | "emerald" | "amber" | "slate";
}