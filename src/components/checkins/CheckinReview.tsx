"use client";

import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import type { GoalCheckIn } from "@/types";

export function CheckinReview({
  checkin,
  goalTitle,
  goalThrust,
  employeeName,
  onSubmitFeedback,
  isLoading = false,
}: {
  checkin: GoalCheckIn;
  goalTitle: string;
  goalThrust: string;
  employeeName: string;
  onSubmitFeedback?: (feedback: string) => void;
  isLoading?: boolean;
}) {
  const [feedback, setFeedback] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = () => {
    if (feedback.trim() && onSubmitFeedback) {
      onSubmitFeedback(feedback);
      setFeedback("");
      setIsExpanded(false);
    }
  };

  const submittedDate = new Date(checkin.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  const statusBadgeVariant =
    checkin.status === "Completed" ? "default" : checkin.status === "On Track" ? "secondary" : "outline";

  return (
    <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
      <CardHeader>
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base">{goalTitle}</CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                Check-in submitted by <span className="font-medium text-slate-950">{employeeName}</span>
              </p>
            </div>
            <Badge variant={statusBadgeVariant}>{checkin.status}</Badge>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="inline-block rounded bg-slate-100 px-2 py-1 font-medium">{goalThrust}</span>
            <span>Submitted {submittedDate}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Achievement Summary */}
        <div className="grid gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-600">Planned Target</p>
            <p className="mt-1 font-semibold text-slate-950">{checkin.plannedTarget}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600">Actual Achievement</p>
            <p className="mt-1 font-semibold text-slate-950">{checkin.actualAchievement}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600">Progress</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">{checkin.progress}%</p>
          </div>
        </div>

        {/* Progress Visualization */}
        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-medium">
            <span className="text-slate-700">Achievement Progress</span>
            <span className="text-slate-600">{checkin.progress}%</span>
          </div>
          <Progress
            value={checkin.progress}
            className="h-3"
          />
        </div>

        {/* Employee Comments */}
        {checkin.comments && (
          <div className="rounded-lg border-l-4 border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-semibold text-blue-900 mb-2">Employee&apos;s Quarterly Comments</p>
            <p className="text-sm text-blue-800 leading-relaxed">{checkin.comments}</p>
          </div>
        )}

        {/* Manager Feedback Section */}
        <div className="space-y-3 border-t border-slate-200 pt-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-slate-600" />
            <p className="font-medium text-slate-950">Manager Feedback</p>
          </div>

          {!isExpanded ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="w-full justify-start text-slate-600"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Add feedback comments
            </Button>
          ) : (
            <div className="space-y-3 rounded-lg bg-slate-50 p-4">
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share structured feedback on the check-in, progress assessment, next steps, or areas for improvement..."
                className="min-h-28 resize-none border-slate-200 bg-white"
                autoFocus
              />

              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">{feedback.length} / 500 characters</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsExpanded(false);
                      setFeedback("");
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!feedback.trim() || isLoading}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isLoading ? "Sending..." : "Send Feedback"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reviewed Badge */}
        {checkin.reviewedBy && checkin.reviewedAt && (
          <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 border border-emerald-200">
            <p className="font-medium">✓ Reviewed by {checkin.reviewedBy}</p>
            <p className="text-xs opacity-75 mt-1">
              {new Date(checkin.reviewedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
