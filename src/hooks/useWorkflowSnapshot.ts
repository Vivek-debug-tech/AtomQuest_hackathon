"use client";

import { useEffect, useState } from "react";

import { buildPortalSnapshot } from "@/lib/portal-data";

type WorkflowSnapshot = Awaited<ReturnType<typeof buildPortalSnapshot>>;

export function useWorkflowSnapshot() {
  const [snapshot, setSnapshot] = useState<WorkflowSnapshot>(buildPortalSnapshot());
  const [isLoading, setIsLoading] = useState(true);

  const reload = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/workflows/snapshot", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to load workflow snapshot");
      const data = (await response.json()) as WorkflowSnapshot;
      setSnapshot(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  return { snapshot, isLoading, reload, setSnapshot };
}
