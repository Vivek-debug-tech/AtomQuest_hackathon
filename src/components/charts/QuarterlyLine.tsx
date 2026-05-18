"use client";

import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import ChartCard from "./ChartCard";
import type { GoalTrendPoint } from "@/types";

export function QuarterlyLine({ title, points }: { title: string; points: GoalTrendPoint[] }) {
  return (
    <ChartCard title={title}>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} width={32} />
            <Tooltip contentStyle={{ borderRadius: 14, borderColor: "#e2e8f0" }} />
            <Legend verticalAlign="top" align="right" iconType="plainline" />
            <Line type="monotone" dataKey="progress" name="Progress %" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="target" name="Target %" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} strokeDasharray="4 6" activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export default QuarterlyLine;
