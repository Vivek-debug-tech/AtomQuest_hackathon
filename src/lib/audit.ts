import type { AuditLog, UserRole } from "@/types";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";

interface DbAuditRow {
  id: string;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  performed_by_id?: string | null;
  performed_by_name?: string | null;
  performed_by_role?: string | null;
  timestamp?: string | null;
  details?: Record<string, unknown> | null;
}

function dbRowToAudit(r: DbAuditRow): AuditLog {
  return {
    id: r.id,
    action: r.action as AuditLog["action"],
    entityType: r.entity_type,
    entityId: r.entity_id ?? "",
    performedById: r.performed_by_id ?? undefined,
    performedByName: r.performed_by_name ?? undefined,
    performedByRole: (r.performed_by_role as unknown as UserRole) ?? undefined,
    timestamp: r.timestamp ?? new Date().toISOString(),
    details: r.details ?? {},
  };
}

/**
 * Insert an audit log entry.
 * If Supabase isn't configured, falls back to console logging.
 */
export async function logAudit(entry: {
  action: string;
  entityType: string;
  entityId?: string;
  performedById?: string;
  performedByName?: string;
  performedByRole?: string;
  details?: Record<string, unknown>;
}) {
  if (!isSupabaseConfigured) {
    console.info("AUDIT (local):", { ...entry, timestamp: new Date().toISOString() });
    return null;
  }

  const supabase = getSupabaseClient({ server: true });
  const payload = {
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    performed_by_id: entry.performedById ?? null,
    performed_by_name: entry.performedByName ?? null,
    performed_by_role: entry.performedByRole ?? null,
    details: entry.details ?? {},
  };

  const { data, error } = await supabase.from("audit_logs").insert(payload).select().limit(1).single();
  if (error) {
    console.error("logAudit error", error);
    throw error;
  }
  return dbRowToAudit(data as DbAuditRow);
}

export async function fetchAuditLogs({ limit = 200, server = false }: { limit?: number; server?: boolean } = {}) {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured — fetchAuditLogs returning empty array");
    return [] as AuditLog[];
  }

  const supabase = getSupabaseClient({ server });
  const { data, error } = await supabase.from("audit_logs").select("*").order("timestamp", { ascending: false }).limit(limit);
  if (error) {
    console.error("fetchAuditLogs error", error);
    throw error;
  }

  return ((data as DbAuditRow[] | null) || []).map(dbRowToAudit);
}

/* Convenience wrappers for common events */
export async function logGoalUpdate(opts: { goalId: string; userId?: string; userName?: string; description?: string }) {
  return logAudit({
    action: "update",
    entityType: "Goal",
    entityId: opts.goalId,
    performedById: opts.userId,
    performedByName: opts.userName,
    details: { description: opts.description ?? "Goal updated" },
  });
}

export async function logApprovalAction(opts: { approvalId: string; userId?: string; userName?: string; action: "approve" | "reject" | "create"; description?: string }) {
  return logAudit({
    action: opts.action,
    entityType: "Approval",
    entityId: opts.approvalId,
    performedById: opts.userId,
    performedByName: opts.userName,
    details: { description: opts.description ?? `${opts.action} approval` },
  });
}

export async function logUnlockAction(opts: { goalId: string; userId?: string; userName?: string; reason?: string }) {
  return logAudit({
    action: "unlock",
    entityType: "Goal",
    entityId: opts.goalId,
    performedById: opts.userId,
    performedByName: opts.userName,
    details: { reason: opts.reason ?? "Unlocked by admin" },
  });
}

export async function logGoalLock(opts: { goalId: string; userId?: string; userName?: string; reason?: string }) {
  return logAudit({
    action: "lock",
    entityType: "Goal",
    entityId: opts.goalId,
    performedById: opts.userId,
    performedByName: opts.userName,
    details: { reason: opts.reason ?? "Locked after approval" },
  });
}

export async function logCheckinUpdate(opts: { checkinId: string; goalId?: string; userId?: string; userName?: string; description?: string }) {
  return logAudit({
    action: "update",
    entityType: "CheckIn",
    entityId: opts.checkinId,
    performedById: opts.userId,
    performedByName: opts.userName,
    details: { description: opts.description ?? "Check-in updated", goalId: opts.goalId },
  });
}

const auditApi = {
  logAudit,
  fetchAuditLogs,
  logGoalUpdate,
  logApprovalAction,
  logGoalLock,
  logUnlockAction,
  logCheckinUpdate,
};

export default auditApi;
