"use client";

import { CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ProgressPhase {
  quarter: string;
  status: "Not Started" | "On Track" | "Completed";
  progress: number;
  date: string;
  comments?: string;
}

const statusConfig = {
  "Not Started": {
    icon: AlertCircle,
    color: "text-slate-600",
    bgColor: "bg-slate-100",
    dotColor: "bg-slate-400",
  },
  "On Track": {
    icon: TrendingUp,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    dotColor: "bg-blue-500",
  },
  Completed: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    dotColor: "bg-emerald-500",
  },
};

export function ProgressTracker({
  phases,
  goalTitle,
}: {
  phases: ProgressPhase[];
  goalTitle: string;
}) {
  if (phases.length === 0) {
    return (
      <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        <CardHeader>
          <CardTitle className="text-base">Progress Timeline - {goalTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg bg-slate-50 py-8">
            <AlertCircle className="mb-3 h-8 w-8 text-slate-400" />
            <p className="text-sm text-slate-600">No check-ins submitted yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
      <CardHeader>
        <CardTitle className="text-base">Progress Timeline - {goalTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {phases.map((phase, index) => {
            const config = statusConfig[phase.status];
            const Icon = config.icon;
            const isLast = index === phases.length - 1;

            return (
              <div key={`${phase.quarter}-${index}`} className="flex gap-4">
                {/* Timeline Dot and Line */}
                <div className="flex flex-col items-center">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${config.bgColor}`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  {!isLast && <div className="mb-2 mt-2 h-8 w-0.5 bg-slate-200" />}
                </div>

                {/* Phase Info */}
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">{phase.quarter}</p>
                      <p className="text-xs text-slate-500">{phase.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-950">{phase.progress}%</p>
                      <p className="text-xs font-medium text-slate-600">{phase.status}</p>
                    </div>
                  </div>

                  {phase.comments && (
                    <p className="mt-2 border-l-2 border-slate-200 bg-slate-50 py-2 pl-3 text-xs leading-relaxed text-slate-700">
                      {phase.comments}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 flex gap-3 border-t border-slate-200 pt-4">
          <div className="flex-1">
            <p className="text-xs text-slate-600">Latest Progress</p>
            <p className="mt-1 text-xl font-bold text-slate-950">{phases[phases.length - 1]?.progress || 0}%</p>
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-600">Current Status</p>
            <p className={`mt-1 text-sm font-semibold ${statusConfig[phases[phases.length - 1]?.status || "Not Started"].color}`}>
              {phases[phases.length - 1]?.status || "Not Started"}
            </p>
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-600">Check-ins Submitted</p>
            <p className="mt-1 text-xl font-bold text-slate-950">{phases.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
