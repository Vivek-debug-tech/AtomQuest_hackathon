import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { ApprovalStatus, Goal, GoalStatus } from "@/types";

/**
 * Required environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
 * - (optional for server): SUPABASE_SERVICE_ROLE_KEY
 */

const PUBLIC_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const PUBLIC_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const isSupabaseConfigured = Boolean(PUBLIC_URL && (PUBLIC_ANON_KEY || SERVICE_ROLE_KEY));

function createPublicClient(): SupabaseClient {
  if (!PUBLIC_URL || !PUBLIC_ANON_KEY) {
    throw new Error("Supabase public client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).");
  }
  return createClient(PUBLIC_URL, PUBLIC_ANON_KEY, {
    auth: { persistSession: false },
  });
}

function createServerClient(): SupabaseClient {
  if (!PUBLIC_URL || !SERVICE_ROLE_KEY) {
    throw new Error("Supabase server client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  return createClient(PUBLIC_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

/**
 * Helper: return appropriate client for environment. Prefer server client when available.
 */
export function getSupabaseClient({ server = false }: { server?: boolean } = {}) {
  if (server && SERVICE_ROLE_KEY) return createServerClient();
  return createPublicClient();
}

/* --- Database types & mappers --- */

interface DbGoalRow {
  id: string;
  thrust_area: string;
  title: string;
  description: string;
  uom_type: string;
  target: string;
  weightage: number;
  progress: number;
  status: string;
  owner_id?: string | null;
  owner?: string | null;
  due_date?: string | null;
  next_check_in?: string | null;
  last_updated?: string | null;
  is_locked?: boolean | null;
  approval_status?: string | null;
  shared_source_goal_id?: string | null;
  shared_edit_mode?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

function toErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

function toGoalStatus(value: string): GoalStatus {
  const allowed: GoalStatus[] = ["Not Started", "On Track", "At Risk", "Completed"];
  return allowed.includes(value as GoalStatus) ? (value as GoalStatus) : "Not Started";
}

function toApprovalStatus(value?: string | null): ApprovalStatus | undefined {
  const allowed = ["Pending", "Approved", "Rejected"] as const;
  return allowed.includes(value as (typeof allowed)[number]) ? (value as ApprovalStatus) : undefined;
}

function dbRowToGoal(r: DbGoalRow): Goal {
  return {
    id: r.id,
    thrustArea: r.thrust_area,
    title: r.title,
    description: r.description,
    uomType: r.uom_type,
    target: r.target,
    weightage: r.weightage,
    progress: r.progress,
    status: toGoalStatus(r.status || "Not Started"),
    owner: r.owner ?? r.owner_id ?? "",
    dueDate: r.due_date ?? "",
    nextCheckIn: r.next_check_in ?? "",
    lastUpdated: r.last_updated ?? r.updated_at ?? r.created_at ?? "",
    isLocked: r.is_locked ?? false,
    approvalStatus: toApprovalStatus(r.approval_status),
    sharedSourceGoalId: r.shared_source_goal_id ?? undefined,
    sharedEditMode:
      r.shared_edit_mode === "weightage-only" || r.shared_edit_mode === "full"
        ? r.shared_edit_mode
        : undefined,
  };
}

/* --- CRUD helpers for goals --- */

export async function fetchGoals({ server = false, ownerId }: { server?: boolean; ownerId?: string } = {}) {
  const supabase = getSupabaseClient({ server });
  try {
    let query = supabase.from("goals").select("*");
    if (ownerId) query = query.eq("owner_id", ownerId);
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return ((data as DbGoalRow[] | null) || []).map(dbRowToGoal);
  } catch (err: unknown) {
    console.error("fetchGoals error", err);
    throw new Error(toErrorMessage(err, "Failed to fetch goals"));
  }
}

export async function getGoalById(id: string, { server = false }: { server?: boolean } = {}) {
  const supabase = getSupabaseClient({ server });
  try {
    const { data, error } = await supabase.from("goals").select("*").eq("id", id).limit(1).single();
    if (error) throw error;
    return dbRowToGoal(data as DbGoalRow);
  } catch (err: unknown) {
    console.error("getGoalById error", err);
    throw new Error(toErrorMessage(err, "Failed to get goal"));
  }
}

export async function createGoal(payload: Partial<DbGoalRow> & { owner_id?: string }, { server = true }: { server?: boolean } = { server: true }) {
  const supabase = getSupabaseClient({ server });
  try {
    const { data, error } = await supabase.from("goals").insert(payload).select().limit(1).single();
    if (error) throw error;
    return dbRowToGoal(data as DbGoalRow);
  } catch (err: unknown) {
    console.error("createGoal error", err);
    throw new Error(toErrorMessage(err, "Failed to create goal"));
  }
}

export async function updateGoal(id: string, updates: Partial<DbGoalRow>, { server = true }: { server?: boolean } = { server: true }) {
  const supabase = getSupabaseClient({ server });
  try {
    const { data, error } = await supabase.from("goals").update(updates).eq("id", id).select().limit(1).single();
    if (error) throw error;
    return dbRowToGoal(data as DbGoalRow);
  } catch (err: unknown) {
    console.error("updateGoal error", err);
    throw new Error(toErrorMessage(err, "Failed to update goal"));
  }
}

export async function deleteGoal(id: string, { server = true }: { server?: boolean } = { server: true }) {
  const supabase = getSupabaseClient({ server });
  try {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (err: unknown) {
    console.error("deleteGoal error", err);
    throw new Error(toErrorMessage(err, "Failed to delete goal"));
  }
}

export async function upsertGoals(rows: Partial<DbGoalRow>[], { server = true }: { server?: boolean } = { server: true }) {
  const supabase = getSupabaseClient({ server });
  try {
    const { data, error } = await supabase.from("goals").upsert(rows, { onConflict: "id" }).select();
    if (error) throw error;
    return ((data as DbGoalRow[] | null) || []).map(dbRowToGoal);
  } catch (err: unknown) {
    console.error("upsertGoals error", err);
    throw new Error(toErrorMessage(err, "Failed to upsert goals"));
  }
}

const supabaseApi = {
  getSupabaseClient,
  fetchGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  upsertGoals,
};

export default supabaseApi;
