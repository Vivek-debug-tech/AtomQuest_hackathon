"use client";

import { AlertCircle, Calendar, CheckCircle2, MessageSquare, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CheckInStatus, GoalCheckIn } from "@/types";

const statusConfig: Record<CheckInStatus, { icon: React.ReactNode; color: string }> = {
  "Not Started": {
    icon: <AlertCircle className="h-4 w-4" />,
    color: "text-slate-700",
  },
  "On Track": {
    icon: <TrendingUp className="h-4 w-4" />,
    color: "text-blue-700",
  },
  Completed: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "text-emerald-700",
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
    <Card className="overflow-hidden border-white/70 bg-white/78 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl">{goalTitle}</CardTitle>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                {goalThrust}
              </Badge>
              <Badge variant="outline">Weightage {goalWeightage}%</Badge>
            </div>
          </div>
          <div className="rounded-[20px] bg-[linear-gradient(135deg,#eff6ff_0%,#dbeafe_100%)] p-3 text-blue-700 shadow-[0_12px_28px_rgba(59,130,246,0.12)]">
            {statusConfig[checkin.status].icon}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        <div className="rounded-[24px] bg-slate-950 p-5 text-white shadow-[0_20px_42px_rgba(15,23,42,0.18)]">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Planned target</p>
              <p className="mt-2 text-lg font-semibold">{checkin.plannedTarget}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Actual achievement</p>
              <p className="mt-2 text-lg font-semibold">{checkin.actualAchievement}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Progress</p>
              <p className="mt-2 font-heading text-3xl font-semibold">{checkin.progress}%</p>
            </div>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/12">
            <Progress value={checkin.progress} className="bg-white/12" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-[22px] border border-white/70 bg-white/75 px-4 py-3">
          <span className="text-sm font-medium text-slate-600">Status</span>
          <Badge className="border-blue-200 bg-blue-50 text-blue-700">
            <span className={statusConfig[checkin.status].color}>{statusConfig[checkin.status].icon}</span>
            {checkin.status}
          </Badge>
        </div>

        <div className="rounded-[22px] border border-white/70 bg-white/75 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Calendar className="h-4 w-4 text-blue-600" />
            Submitted on {submittedDate}
          </div>
          {hasFeedback ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              Reviewed on {reviewedDate} by {checkin.reviewedBy}
            </div>
          ) : null}
        </div>

        {checkin.comments ? (
          <div className="rounded-[22px] border border-white/70 bg-white/75 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Employee comments</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">{checkin.comments}</p>
          </div>
        ) : null}

        {hasFeedback && onViewFeedback ? (
          <Button variant="outline" size="sm" onClick={onViewFeedback} className="w-full">
            <MessageSquare className="mr-2 h-4 w-4" />
            View Manager Feedback
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
