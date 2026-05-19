import type { AuditLog, Goal, GoalCheckIn } from "@/types";

export function buildGoalExportRows(goals: Goal[]) {
  return goals.map((goal) => ({
    owner: goal.owner,
    title: goal.title,
    weightage: goal.weightage,
    plannedTarget: goal.target,
    progress: `${goal.progress}%`,
    status: goal.status,
    approvalStatus: goal.approvalStatus ?? "Pending",
    locked: goal.isLocked ? "Yes" : "No",
  }));
}

export function buildCheckinExportRows(checkIns: GoalCheckIn[]) {
  return checkIns.map((checkIn) => ({
    goalId: checkIn.goalId,
    actualAchievement: checkIn.actualAchievement,
    plannedTarget: checkIn.plannedTarget,
    progress: `${checkIn.progress}%`,
    status: checkIn.status,
    reviewedBy: checkIn.reviewedBy ?? "Pending",
    createdAt: checkIn.createdAt,
  }));
}

export function buildAuditExportRows(auditLogs: AuditLog[]) {
  return auditLogs.map((audit) => ({
    action: audit.action,
    entityType: audit.entityType,
    entityId: audit.entityId,
    performedBy: audit.performedByName ?? audit.performedByRole ?? "System",
    timestamp: audit.timestamp,
  }));
}
