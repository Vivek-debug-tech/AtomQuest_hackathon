"use client";

import dynamic from "next/dynamic";

import { ChartLoader } from "@/components/shared/loading-skeletons";
import type { GoalTrendPoint } from "@/types";

const ProgressChart = dynamic(() => import("@/components/dashboard/ProgressChart").then((mod) => mod.ProgressChart), {
  ssr: false,
  loading: () => <ChartLoader />,
});

export function ProgressChartClient({ data }: { data: GoalTrendPoint[] }) {
  return <ProgressChart data={data} />;
}
