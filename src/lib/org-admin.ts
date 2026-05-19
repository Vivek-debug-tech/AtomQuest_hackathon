import { randomUUID } from "crypto";

import { DEFAULT_USERS } from "@/lib/auth/session";
import { getBrdCycleWindows } from "@/lib/quarters";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import type { UserRole } from "@/types";

export interface AdminCycleWindow {
  id: string;
  key: string;
  label: string;
  opensOn: string;
  closesOn?: string;
  action: string;
  isActive: boolean;
  updatedAt: string;
}

export interface OrgHierarchyMember {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  department: string;
  managerId?: string;
  skipLevelManagerId?: string;
  isActive: boolean;
  createdAt: string;
}

type DbCycleRow = {
  id: string;
  key: string;
  label: string;
  opens_on: string;
  closes_on?: string | null;
  action: string;
  is_active?: boolean | null;
  updated_at?: string | null;
};

type DbHierarchyRow = {
  id: string;
  user_id: string;
  user_name: string;
  role: string;
  department: string;
  manager_id?: string | null;
  skip_level_manager_id?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
};

type AdminStore = {
  cycles: AdminCycleWindow[];
  hierarchy: OrgHierarchyMember[];
};

declare global {
  var __goalflowAdminStore: AdminStore | undefined;
}

function mapCycle(row: DbCycleRow): AdminCycleWindow {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    opensOn: row.opens_on,
    closesOn: row.closes_on ?? undefined,
    action: row.action,
    isActive: row.is_active ?? true,
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

function mapHierarchy(row: DbHierarchyRow): OrgHierarchyMember {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    role: row.role as UserRole,
    department: row.department,
    managerId: row.manager_id ?? undefined,
    skipLevelManagerId: row.skip_level_manager_id ?? undefined,
    isActive: row.is_active ?? true,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

function createMemoryStore(): AdminStore {
  const now = new Date().toISOString();
  const cycles = getBrdCycleWindows().map((cycle) => ({
    id: randomUUID(),
    key: cycle.key,
    label: cycle.label,
    opensOn: cycle.opensOn,
    closesOn: undefined,
    action: cycle.action,
    isActive: true,
    updatedAt: now,
  }));

  const hierarchy: OrgHierarchyMember[] = [
    {
      id: randomUUID(),
      userId: DEFAULT_USERS.Admin.userId,
      userName: DEFAULT_USERS.Admin.name,
      role: "Admin",
      department: DEFAULT_USERS.Admin.department,
      isActive: true,
      createdAt: now,
    },
    {
      id: randomUUID(),
      userId: DEFAULT_USERS.Manager.userId,
      userName: DEFAULT_USERS.Manager.name,
      role: "Manager",
      department: DEFAULT_USERS.Manager.department,
      managerId: DEFAULT_USERS.Admin.userId,
      skipLevelManagerId: DEFAULT_USERS.Admin.userId,
      isActive: true,
      createdAt: now,
    },
    {
      id: randomUUID(),
      userId: DEFAULT_USERS.Employee.userId,
      userName: DEFAULT_USERS.Employee.name,
      role: "Employee",
      department: DEFAULT_USERS.Employee.department,
      managerId: DEFAULT_USERS.Manager.userId,
      skipLevelManagerId: DEFAULT_USERS.Admin.userId,
      isActive: true,
      createdAt: now,
    },
  ];

  return { cycles, hierarchy };
}

function getMemoryStore() {
  if (!global.__goalflowAdminStore) {
    global.__goalflowAdminStore = createMemoryStore();
  }
  return global.__goalflowAdminStore;
}

function validateCycleDates(opensOn: string, closesOn?: string) {
  if (!closesOn) return;
  if (new Date(closesOn).getTime() < new Date(opensOn).getTime()) {
    throw new Error("Cycle close date must be on or after open date");
  }
}

function assertNoHierarchyCycle(inputUserId: string, managerId: string | undefined, members: OrgHierarchyMember[]) {
  if (!managerId) return;
  if (inputUserId === managerId) {
    throw new Error("A user cannot report to themselves");
  }

  let cursor: string | undefined = managerId;
  const visited = new Set<string>();

  while (cursor) {
    if (cursor === inputUserId) {
      throw new Error("Hierarchy update creates a circular manager chain");
    }
    if (visited.has(cursor)) {
      throw new Error("Hierarchy chain is invalid");
    }

    visited.add(cursor);
    cursor = members.find((item) => item.userId === cursor)?.managerId;
  }
}

export async function fetchAdminCycles(server = true) {
  if (!isSupabaseConfigured) {
    return getMemoryStore().cycles.map((item) => ({ ...item }));
  }

  const supabase = getSupabaseClient({ server });
  const { data, error } = await supabase
    .from("cycle_management")
    .select("*")
    .order("opens_on", { ascending: true });

  if (error) throw error;
  return ((data as DbCycleRow[] | null) ?? []).map(mapCycle);
}

export async function createAdminCycle(input: {
  key: string;
  label: string;
  opensOn: string;
  closesOn?: string;
  action: string;
  isActive?: boolean;
}) {
  validateCycleDates(input.opensOn, input.closesOn);

  if (!isSupabaseConfigured) {
    const cycle: AdminCycleWindow = {
      id: randomUUID(),
      key: input.key,
      label: input.label,
      opensOn: input.opensOn,
      closesOn: input.closesOn,
      action: input.action,
      isActive: input.isActive ?? true,
      updatedAt: new Date().toISOString(),
    };
    getMemoryStore().cycles.push(cycle);
    return cycle;
  }

  const supabase = getSupabaseClient({ server: true });
  const { data, error } = await supabase
    .from("cycle_management")
    .insert({
      key: input.key,
      label: input.label,
      opens_on: input.opensOn,
      closes_on: input.closesOn ?? null,
      action: input.action,
      is_active: input.isActive ?? true,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapCycle(data as DbCycleRow);
}

export async function updateAdminCycle(
  id: string,
  input: Partial<{
    key: string;
    label: string;
    opensOn: string;
    closesOn: string;
    action: string;
    isActive: boolean;
  }>,
) {
  if (!isSupabaseConfigured) {
    const store = getMemoryStore();
    const existing = store.cycles.find((item) => item.id === id);
    if (!existing) throw new Error("Cycle not found");

    const nextOpen = input.opensOn ?? existing.opensOn;
    const nextClose = input.closesOn ?? existing.closesOn;
    validateCycleDates(nextOpen, nextClose);

    Object.assign(existing, {
      key: input.key ?? existing.key,
      label: input.label ?? existing.label,
      opensOn: nextOpen,
      closesOn: nextClose,
      action: input.action ?? existing.action,
      isActive: input.isActive ?? existing.isActive,
      updatedAt: new Date().toISOString(),
    });

    return { ...existing };
  }

  const supabase = getSupabaseClient({ server: true });
  const { data: existingRow, error: existingError } = await supabase
    .from("cycle_management")
    .select("*")
    .eq("id", id)
    .single();

  if (existingError) throw existingError;
  const existing = mapCycle(existingRow as DbCycleRow);

  const nextOpen = input.opensOn ?? existing.opensOn;
  const nextClose = input.closesOn ?? existing.closesOn;
  validateCycleDates(nextOpen, nextClose);

  const { data, error } = await supabase
    .from("cycle_management")
    .update({
      key: input.key,
      label: input.label,
      opens_on: input.opensOn,
      closes_on: input.closesOn,
      action: input.action,
      is_active: input.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapCycle(data as DbCycleRow);
}

export async function deleteAdminCycle(id: string) {
  if (!isSupabaseConfigured) {
    const store = getMemoryStore();
    const initialLength = store.cycles.length;
    store.cycles = store.cycles.filter((item) => item.id !== id);
    return store.cycles.length < initialLength;
  }

  const supabase = getSupabaseClient({ server: true });
  const { error } = await supabase.from("cycle_management").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function fetchOrgHierarchy(server = true) {
  if (!isSupabaseConfigured) {
    return getMemoryStore().hierarchy.map((item) => ({ ...item }));
  }

  const supabase = getSupabaseClient({ server });
  const { data, error } = await supabase
    .from("org_hierarchy")
    .select("*")
    .order("user_name", { ascending: true });

  if (error) throw error;
  return ((data as DbHierarchyRow[] | null) ?? []).map(mapHierarchy);
}

/**
 * Resolve the direct manager for a given user id (returns userId of manager or undefined)
 */
export async function getManagerForUser(userId: string) {
  const members = await fetchOrgHierarchy(true);
  return members.find((m) => m.userId === userId)?.managerId;
}

/**
 * Resolve skip-level manager (manager's manager) for a given user id.
 */
export async function getSkipLevelForUser(userId: string) {
  const members = await fetchOrgHierarchy(true);
  const managerId = members.find((m) => m.userId === userId)?.managerId;
  if (!managerId) return undefined;
  return members.find((m) => m.userId === managerId)?.managerId;
}

/**
 * Resolve the most appropriate approver for a user: direct manager if available.
 */
export async function resolveApprover(userId: string) {
  return (await getManagerForUser(userId)) ?? undefined;
}

export async function upsertOrgMember(
  userId: string,
  input: {
    userName: string;
    role: UserRole;
    department: string;
    managerId?: string;
    skipLevelManagerId?: string;
    isActive?: boolean;
  },
) {
  const allMembers = await fetchOrgHierarchy(true);
  assertNoHierarchyCycle(userId, input.managerId, allMembers);

  if (!isSupabaseConfigured) {
    const store = getMemoryStore();
    const existing = store.hierarchy.find((item) => item.userId === userId);

    if (existing) {
      existing.userName = input.userName;
      existing.role = input.role;
      existing.department = input.department;
      existing.managerId = input.managerId;
      existing.skipLevelManagerId = input.skipLevelManagerId;
      existing.isActive = input.isActive ?? existing.isActive;
      return { ...existing };
    }

    const member: OrgHierarchyMember = {
      id: randomUUID(),
      userId,
      userName: input.userName,
      role: input.role,
      department: input.department,
      managerId: input.managerId,
      skipLevelManagerId: input.skipLevelManagerId,
      isActive: input.isActive ?? true,
      createdAt: new Date().toISOString(),
    };
    store.hierarchy.push(member);
    return member;
  }

  const supabase = getSupabaseClient({ server: true });
  const { data, error } = await supabase
    .from("org_hierarchy")
    .upsert(
      {
        user_id: userId,
        user_name: input.userName,
        role: input.role,
        department: input.department,
        manager_id: input.managerId ?? null,
        skip_level_manager_id: input.skipLevelManagerId ?? null,
        is_active: input.isActive ?? true,
      },
      { onConflict: "user_id" },
    )
    .select("*")
    .single();

  if (error) throw error;
  return mapHierarchy(data as DbHierarchyRow);
}

export async function removeOrgMember(userId: string) {
  const allMembers = await fetchOrgHierarchy(true);
  if (allMembers.some((item) => item.managerId === userId || item.skipLevelManagerId === userId)) {
    throw new Error("Cannot delete member while they are assigned as manager or skip-level manager");
  }

  if (!isSupabaseConfigured) {
    const store = getMemoryStore();
    const initialLength = store.hierarchy.length;
    store.hierarchy = store.hierarchy.filter((item) => item.userId !== userId);
    return store.hierarchy.length < initialLength;
  }

  const supabase = getSupabaseClient({ server: true });
  const { error } = await supabase.from("org_hierarchy").delete().eq("user_id", userId);
  if (error) throw error;
  return true;
}
