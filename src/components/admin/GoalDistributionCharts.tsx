"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import type { Goal } from "@/types";

const COLORS_PIE = {
  "Not Started": "#94a3b8",
  "On Track": "#3b82f6",
  "At Risk": "#f59e0b",
  Completed: "#10b981",
};

export function GoalDistributionCharts({ goals }: { goals: Goal[] }) {
  // Goal Status Distribution
  const statusData = [
    {
      name: "Not Started",
      value: goals.filter((g) => g.status === "Not Started").length,
    },
    {
      name: "On Track",
      value: goals.filter((g) => g.status === "On Track").length,
    },
    {
      name: "At Risk",
      value: goals.filter((g) => g.status === "At Risk").length,
    },
    {
      name: "Completed",
      value: goals.filter((g) => g.status === "Completed").length,
    },
  ].filter((item) => item.value > 0);

  // Goal Distribution by Thrust Area
  const thrustData = Object.entries(
    goals.reduce(
      (acc, goal) => ({
        ...acc,
        [goal.thrustArea]: (acc[goal.thrustArea] || 0) + 1,
      }),
      {} as Record<string, number>,
    ),
  )
    .map(([thrust, count]) => ({
      name: thrust,
      goals: count,
    }))
    .sort((a, b) => b.goals - a.goals);

  // Weightage Distribution by Status
  const weightageByStatus = [
    {
      name: "Not Started",
      weightage: goals
        .filter((g) => g.status === "Not Started")
        .reduce((sum, g) => sum + g.weightage, 0),
    },
    {
      name: "On Track",
      weightage: goals.filter((g) => g.status === "On Track").reduce((sum, g) => sum + g.weightage, 0),
    },
    {
      name: "At Risk",
      weightage: goals.filter((g) => g.status === "At Risk").reduce((sum, g) => sum + g.weightage, 0),
    },
    {
      name: "Completed",
      weightage: goals.filter((g) => g.status === "Completed").reduce((sum, g) => sum + g.weightage, 0),
    },
  ].filter((item) => item.weightage > 0);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: unknown[] }) => {
    if (active && payload && Array.isArray(payload) && payload.length > 0) {
      const item = payload[0] as unknown;
      const data = (item && typeof item === 'object' && 'payload' in item) ? (item as { payload: Record<string, unknown> }).payload : {};
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="text-sm font-semibold text-slate-950">{String(data.name || "")}</p>
          <p className="text-sm text-slate-600">{String(data.value || data.goals || data.weightage || "")}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Goal Status Distribution */}
      <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        <CardHeader>
          <CardTitle className="text-base">Goal Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={COLORS_PIE[entry.name as keyof typeof COLORS_PIE]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Goals by Thrust Area */}
      <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        <CardHeader>
          <CardTitle className="text-base">Goals by Thrust Area</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={thrustData} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={110} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="goals"
                fill="#3b82f6"
                radius={[0, 8, 8, 0]}
                onMouseEnter={() => {}}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Weightage Distribution */}
      <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)] lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Weightage Distribution by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weightageByStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="weightage" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
