"use client";

import { useEffect, useState } from "react";

import type { CycleConfig, HierarchyNode } from "@/lib/admin-config";

export function useAdminConfig() {
  const [cycles, setCycles] = useState<CycleConfig[]>([]);
  const [hierarchy, setHierarchy] = useState<HierarchyNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = async () => {
    setIsLoading(true);
    try {
      const [cycleRes, hierarchyRes] = await Promise.all([
        fetch("/api/admin/cycles", { cache: "no-store" }),
        fetch("/api/admin/hierarchy", { cache: "no-store" }),
      ]);
      const cycleData = (await cycleRes.json()) as { cycles?: CycleConfig[] };
      const hierarchyData = (await hierarchyRes.json()) as { hierarchy?: HierarchyNode[] };
      setCycles(cycleData.cycles ?? []);
      setHierarchy(hierarchyData.hierarchy ?? []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  return { cycles, hierarchy, isLoading, reload, setCycles, setHierarchy };
}
