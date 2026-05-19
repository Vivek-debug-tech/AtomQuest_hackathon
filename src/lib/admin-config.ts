import { randomUUID } from "crypto";

import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { getBrdCycleWindows } from "@/lib/quarters";
import type { UserRole } from "@/types";

export interface CycleConfig {
  id: string;
  cycleKey: string;
  label: string;
  opensOn: string;
  closesOn?: string;
  action: string;
  isActive: boolean;
}

export interface HierarchyNode {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  department: string;
  managerId?: string;
  managerName?: string;
  skipLevelId?: string;
  skipLevelName?: string;
  source: "manual" | "entra-sync";
}

type DbCycleRow = {
  id: string;
  cycle_key: string;
  label: string;
  opens_on: string;
  closes_on?: string | null;
  action: string;
  is_active: boolean;
};

type DbHierarchyRow = {
  id: string;
  user_id: string;
  user_name: string;
  role: string;
  department: string;
  manager_id?: string | null;
  manager_name?: string | null;
  skip_level_id?: string | null;
  skip_level_name?: string | null;
  source: string;
};

declare global {
  var __goalflowCycles: CycleConfig[] | undefined;
  var __goalflowHierarchy: HierarchyNode[] | undefined;
}

function mapCycle(row: DbCycleRow): CycleConfig {
  return {
    id: row.id,
    cycleKey: row.cycle_key,
    label: row.label,
    opensOn: row.opens_on,
    closesOn: row.closes_on ?? undefined,
    action: row.action,
    isActive: row.is_active,
  };
}

function mapHierarchy(row: DbHierarchyRow): HierarchyNode {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    role: row.role as UserRole,
    department: row.department,
    managerId: row.manager_id ?? undefined,
    managerName: row.manager_name ?? undefined,
    skipLevelId: row.skip_level_id ?? undefined,
    skipLevelName: row.skip_level_name ?? undefined,
    source: row.source === "entra-sync" ? "entra-sync" : "manual",
  };
}

function getMemoryCycles() {
  if (!global.__goalflowCycles) {
    global.__goalflowCycles = getBrdCycleWindows().map((cycle) => ({
      id: randomUUID(),
      cycleKey: cycle.key,
      label: cycle.label,
      opensOn: cycle.opensOn,
      closesOn: undefined,
      action: cycle.action,
      isActive: true,
    }));
  }
  return global.__goalflowCycles;
}

function getMemoryHierarchy() {
  if (!global.__goalflowHierarchy) {
    global.__goalflowHierarchy = [
      {
        id: randomUUID(),
        userId: "adm-001",
        userName: "Jordan Patel",
        role: "Admin",
        department: "HR Systems",
        source: "manual",
      },
      {
        id: randomUUID(),
        userId: "mgr-001",
        userName: "Manager Lee",
        role: "Manager",
        department: "People Operations",
        skipLevelId: "adm-001",
        skipLevelName: "Jordan Patel",
        source: "manual",
      },
      {
        id: randomUUID(),
        userId: "emp-001",
        userName: "Avery Kumar",
        role: "Employee",
        department: "People Operations",
        managerId: "mgr-001",
        managerName: "Manager Lee",
        skipLevelId: "adm-001",
        skipLevelName: "Jordan Patel",
        source: "manual",
      },
      {
        id: randomUUID(),
        userId: "user-002",
        userName: "Nina Shah",
        role: "Employee",
        department: "Talent Acquisition",
        managerId: "mgr-001",
        managerName: "Manager Lee",
        skipLevelId: "adm-001",
        skipLevelName: "Jordan Patel",
        source: "manual",
      },
    ];
  }
  return global.__goalflowHierarchy;
}

export async function fetchCycleConfigs() {
  if (!isSupabaseConfigured) {
    return getMemoryCycles();
  }
  const supabase = getSupabaseClient({ server: true });
  const { data, error } = await supabase.from("cycle_windows").select("*").order("opens_on", { ascending: true });
  if (error) throw error;
  return ((data as DbCycleRow[] | null) ?? []).map(mapCycle);
}

export async function upsertCycleConfig(input: Omit<CycleConfig, "id"> & { id?: string }) {
  if (!isSupabaseConfigured) {
    const store = getMemoryCycles();
    const index = store.findIndex((item) => item.cycleKey === input.cycleKey || item.id === input.id);
    const next: CycleConfig = {
      id: input.id ?? randomUUID(),
      cycleKey: input.cycleKey,
      label: input.label,
      opensOn: input.opensOn,
      closesOn: input.closesOn,
      action: input.action,
      isActive: input.isActive,
    };
    if (index >= 0) store[index] = next;
    else store.push(next);
    return next;
  }
  const supabase = getSupabaseClient({ server: true });
  const { data, error } = await supabase
    .from("cycle_windows")
    .upsert({
      id: input.id,
      cycle_key: input.cycleKey,
      label: input.label,
      opens_on: input.opensOn,
      closes_on: input.closesOn ?? null,
      action: input.action,
      is_active: input.isActive,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapCycle(data as DbCycleRow);
}

export async function fetchHierarchy() {
  if (!isSupabaseConfigured) {
    return getMemoryHierarchy();
  }
  const supabase = getSupabaseClient({ server: true });
  const { data, error } = await supabase.from("org_hierarchy").select("*").order("role", { ascending: false });
  if (error) throw error;
  return ((data as DbHierarchyRow[] | null) ?? []).map(mapHierarchy);
}

export async function upsertHierarchyNode(input: Omit<HierarchyNode, "id"> & { id?: string }) {
  if (!isSupabaseConfigured) {
    const store = getMemoryHierarchy();
    const index = store.findIndex((item) => item.userId === input.userId || item.id === input.id);
    const next: HierarchyNode = {
      id: input.id ?? randomUUID(),
      userId: input.userId,
      userName: input.userName,
      role: input.role,
      department: input.department,
      managerId: input.managerId,
      managerName: input.managerName,
      skipLevelId: input.skipLevelId,
      skipLevelName: input.skipLevelName,
      source: input.source,
    };
    if (index >= 0) store[index] = next;
    else store.push(next);
    return next;
  }
  const supabase = getSupabaseClient({ server: true });
  const { data, error } = await supabase
    .from("org_hierarchy")
    .upsert({
      id: input.id,
      user_id: input.userId,
      user_name: input.userName,
      role: input.role,
      department: input.department,
      manager_id: input.managerId ?? null,
      manager_name: input.managerName ?? null,
      skip_level_id: input.skipLevelId ?? null,
      skip_level_name: input.skipLevelName ?? null,
      source: input.source,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapHierarchy(data as DbHierarchyRow);
}
