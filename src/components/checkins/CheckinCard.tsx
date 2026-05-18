"use client";

import { CheckCircle2, AlertCircle, TrendingUp, MessageSquare, Calendar } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { GoalCheckIn, CheckInStatus } from "@/types";

const statusConfig: Record<CheckInStatus, { icon: React.ReactNode; color: string; label: string }> = {
  "Not Started": {
    icon: <AlertCircle className="h-4 w-4" />,
    color: "text-slate-600",
    label: "Not Started",
  },
  "On Track": {
    icon: <TrendingUp className="h-4 w-4" />,
    color: "text-blue-600",
    label: "On Track",
  },
  Completed: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "text-emerald-600",
    label: "Completed",
  },
};

export function CheckinCard({
  checkin,
  goalTitle,
  goalThrust,
  goalWeightage,
  onViewFeedback,
}: {
  checkin: GoalCheckIn;
  goalTitle: string;
  goalThrust: string;
  goalWeightage: number;
  onViewFeedback?: () => void;
}) {
  const statusConfig_ = statusConfig[checkin.status];
  const hasFeedback = checkin.reviewedBy && checkin.reviewedAt;
  const submittedDate = new Date(checkin.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const reviewedDate = checkin.reviewedAt
    ? new Date(checkin.reviewedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <Card className="border-slate-200/60 bg-white/60 backdrop-blur-sm shadow-[0_4px_12px_rgba(15,23,42,0.08)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)] transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold">{goalTitle}</CardTitle>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold text-xs">
                {goalThrust}
              </Badge>
              <span className="text-xs font-medium text-slate-600">Weightage: {goalWeightage}%</span>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 font-semibold">
            <span className={statusConfig_.color}>{statusConfig_.icon}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Check-in Stats */}
        <div className="grid gap-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:grid-cols-3 border border-slate-200/50">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Planned Target</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">{checkin.plannedTarget}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600">Actual Achievement</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">{checkin.actualAchievement}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600">Progress</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">{checkin.progress}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700">Achievement Progress</span>
            <span className="font-bold text-slate-950">{checkin.progress}%</span>
          </div>
          <Progress value={checkin.progress} className="h-2" />
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">Status</span>
          <Badge
            variant={checkin.status === "Completed" ? "default" : checkin.status === "On Track" ? "secondary" : "outline"}
            className="flex items-center gap-1"
          >
            {statusConfig_.icon}
            {checkin.status}
          </Badge>
        </div>

        {/* Submission Timeline */}
        <div className="space-y-2 rounded-lg bg-blue-50 p-3 text-sm">
          <div className="flex items-center gap-2 text-blue-700">
            <Calendar className="h-4 w-4" />
            <span>
              <span className="font-medium">Submitted</span> on {submittedDate}
            </span>
          </div>
          {hasFeedback && (
            <div className="flex items-center gap-2 text-blue-700">
              <MessageSquare className="h-4 w-4" />
              <span>
                <span className="font-medium">Reviewed</span> on {reviewedDate} by {checkin.reviewedBy}
              </span>
            </div>
          )}
        </div>

        {/* Comments */}
        {checkin.comments && (
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-medium text-slate-600">Employee Comments</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{checkin.comments}</p>
          </div>
        )}

        {/* View Feedback Button */}
        {hasFeedback && onViewFeedback && (
          <Button variant="outline" size="sm" onClick={onViewFeedback} className="w-full">
            <MessageSquare className="mr-2 h-4 w-4" />
            View Manager Feedback
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
