"use client";

import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Legend } from "recharts";
import ChartCard from "./ChartCard";
import type { TeamMemberSummary } from "@/types";

export function TeamCompletionBar({ title, team }: { title: string; team: TeamMemberSummary[] }) {
  const data = team.map((m) => ({ name: m.name, completion: Math.round(m.completionRate) }));

  return (
    <ChartCard title={title}>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis unit="%" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 14, borderColor: "#e2e8f0" }} />
            <Legend verticalAlign="top" align="right" iconType="square" wrapperStyle={{ paddingBottom: 8 }} />
            <Bar dataKey="completion" fill="#3b82f6" radius={[6, 6, 6, 6]}>
              {data.map((entry) => (
                <Cell key={`cell-${entry.name}`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export default TeamCompletionBar;
