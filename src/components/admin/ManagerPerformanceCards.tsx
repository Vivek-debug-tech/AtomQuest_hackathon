"use client";

import { Users, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { TeamMemberSummary } from "@/types";

export function ManagerPerformanceCards({
  managers,
}: {
  managers: Array<TeamMemberSummary & { departmentCount?: number; totalApprovals?: number }>;
}) {
  if (managers.length === 0) {
    return (
      <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="mb-3 h-8 w-8 text-slate-400" />
          <p className="text-sm text-slate-600">No managers found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {managers.map((manager) => (
          <Card key={manager.id} className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <CardTitle className="text-base">{manager.name}</CardTitle>
                  <p className="mt-1 text-xs text-slate-500">
                    {manager.departmentCount || 0} direct reports
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Completion Rate */}
              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">Team Completion</span>
                  <span className="font-bold text-slate-950">{manager.completionRate}%</span>
                </div>
                <Progress value={manager.completionRate} className="h-2" />
              </div>

              {/* Next Check-in */}
              <div>
                <p className="text-xs font-medium text-slate-600">Next Check-in</p>
                <p className="mt-1 text-sm text-slate-700">
                  {manager.nextCheckIn ? new Date(manager.nextCheckIn).toLocaleDateString() : "—"}
                </p>
              </div>

              {/* Stats Row */}
              <div className="flex gap-2 border-t border-slate-100 pt-3">
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Goals Assigned</p>
                  <p className="mt-0.5 text-lg font-semibold text-slate-950">{manager.goalsAssigned}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Pending Approvals</p>
                  <Badge
                    variant="outline"
                    className={`mt-0.5 ${
                      manager.pendingApprovals > 0
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {manager.pendingApprovals}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-slate-500">Total Managers</p>
              <p className="mt-1 text-3xl font-semibold text-slate-950">{managers.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-slate-500">Avg Team Completion</p>
              <p className="mt-1 text-3xl font-semibold text-slate-950">
                {Math.round(managers.reduce((sum, m) => sum + m.completionRate, 0) / managers.length)}%
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-slate-500">Total Pending Approvals</p>
              <p className="mt-1 text-3xl font-semibold text-slate-950">
                {managers.reduce((sum, m) => sum + m.pendingApprovals, 0)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-slate-500">Total Direct Reports</p>
              <p className="mt-1 text-3xl font-semibold text-slate-950">
                {managers.reduce((sum, m) => sum + (m.departmentCount || 0), 0)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
