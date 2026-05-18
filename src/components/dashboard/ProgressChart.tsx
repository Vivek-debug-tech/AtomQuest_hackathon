"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GoalTrendPoint } from "@/types";

export function ProgressChart({ data }: { data: GoalTrendPoint[] }) {
  return (
    <Card className="border-slate-200/60 bg-white/60 backdrop-blur-sm shadow-[0_4px_12px_rgba(15,23,42,0.08)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)] transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-slate-950">Goal Progress Trend</CardTitle>
      </CardHeader>
      <CardContent className="h-80 sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="goalProgress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                boxShadow: "0 12px 32px rgba(15, 23, 42, 0.12)",
              }}
            />
            <Area type="monotone" dataKey="progress" stroke="#2563eb" fill="url(#goalProgress)" strokeWidth={3} />
            <Area type="monotone" dataKey="target" stroke="#bfdbfe" fill="transparent" strokeWidth={2} strokeDasharray="5 4" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}