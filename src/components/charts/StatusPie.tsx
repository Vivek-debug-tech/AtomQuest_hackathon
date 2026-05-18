"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import ChartCard from "./ChartCard";

export type PieDatum = { name: string; value: number };

export function StatusPie({ title, data, colors }: { title: string; data: PieDatum[]; colors?: Record<string, string> }) {
  const defaultColors = ["#94a3b8", "#3b82f6", "#f59e0b", "#10b981", "#8b5cf6"];

  return (
    <ChartCard title={title}>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={52}
              paddingAngle={3}
              labelLine={false}
              label={(entry) => `${entry.name}: ${entry.value}`}
            >
              {data.map((entry, i) => (
                <Cell key={`cell-${entry.name}`} fill={(colors && colors[entry.name]) || defaultColors[i % defaultColors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 14, borderColor: "#e2e8f0" }} />
            <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ paddingTop: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export default StatusPie;
