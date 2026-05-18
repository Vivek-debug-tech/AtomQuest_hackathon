"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Goal, CheckInStatus } from "@/types";

const checkinSchema = z.object({
  actualAchievement: z.number().min(0, "Actual achievement must be 0 or greater").max(999999, "Please enter a valid number"),
  status: z.enum(["Not Started", "On Track", "Completed"] as const),
  comments: z.string().min(8, "Add at least 8 characters for your quarterly comments").max(500, "Keep comments under 500 characters"),
});

type CheckinFormValues = z.infer<typeof checkinSchema>;

export function CheckinForm({
  goal,
  onSubmit,
  isLoading = false,
}: {
  goal: Goal;
  onSubmit: (data: CheckinFormValues) => void;
  isLoading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckinFormValues>({
    resolver: zodResolver(checkinSchema),
    defaultValues: {
      actualAchievement: 0,
      status: "On Track",
      comments: "",
    },
  });

  const selectedStatus = watch("status");
  const actualAchievement = watch("actualAchievement");

  // Calculate progress percentage
  const targetNum = parseFloat(goal.target) || 1;
  const progressPercent = Math.round((actualAchievement / targetNum) * 100);

  const statusConfig: Record<CheckInStatus, { color: string; bgColor: string; icon: React.ReactNode }> = {
    "Not Started": {
      color: "text-slate-600",
      bgColor: "bg-slate-50 border-slate-200",
      icon: <AlertCircle className="h-5 w-5" />,
    },
    "On Track": {
      color: "text-blue-600",
      bgColor: "bg-blue-50 border-blue-200",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    Completed: {
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 border-emerald-200",
      icon: <CheckCircle2 className="h-5 w-5" />,
    },
  };

  const config = statusConfig[selectedStatus];

  return (
    <Card className="border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{goal.title}</CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800">{goal.thrustArea}</span>
              <span className="text-slate-800">Target: {goal.target}</span>
            </CardDescription>
            {goal.isLocked ? (
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">
                <p>
                  This goal is locked for edits after manager approval, but achievement check-ins are still open.
                </p>
              </div>
            ) : null}
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Weightage</p>
            <p className="text-2xl font-bold text-slate-800">{goal.weightage}%</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Planned Target Info */}
            <div className={`rounded-lg border p-4 ${config.bgColor} ${config.color}`}>
              <p className="text-sm font-medium">
              Planned Target: <span className="font-bold">{goal.target}</span> | Unit: <span className="font-bold">{goal.uomType}</span>
              </p>
            </div>

          {/* Actual Achievement */}
          <div className="space-y-3">
            <label className="font-semibold text-slate-800">Actual Achievement</label>
            <div className="relative">
              <Input
                type="number"
                placeholder="Enter achieved value"
                {...register("actualAchievement")}
                className="pr-12 text-lg border-slate-200 bg-white text-slate-800"
                step="0.01"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 transform text-sm text-slate-500">{goal.uomType}</span>
            </div>
            {errors.actualAchievement && (
              <p className="text-xs text-red-600">{errors.actualAchievement.message}</p>
            )}

            {/* Progress Indicator */}
            {actualAchievement > 0 && (
              <div className="mt-3 rounded-lg bg-slate-50 p-3">
                <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-2">
                  <span>Progress</span>
                  <span className="text-base font-bold text-slate-950">{progressPercent}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full transition-all ${
                      progressPercent >= 100 ? "bg-emerald-500" : progressPercent >= 75 ? "bg-blue-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Status Selection */}
          <div className="space-y-3">
            <label className="font-semibold text-slate-800">Progress Status</label>
            <Select onValueChange={(value) => setValue("status", value as CheckInStatus)}>
              <SelectTrigger className="border-slate-200 bg-white text-slate-800">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Not Started">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-slate-600" />
                    Not Started
                  </div>
                </SelectItem>
                <SelectItem value="On Track">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    On Track
                  </div>
                </SelectItem>
                <SelectItem value="Completed">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Completed
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-xs text-red-600">{errors.status.message}</p>}
          </div>

          {/* Status Alert Card */}
            <div className={`rounded-lg border-2 ${config.bgColor} p-4`}>
            <div className={`flex items-center gap-3 ${config.color}`}>
              {config.icon}
              <div>
                <p className="font-semibold text-sm">{selectedStatus}</p>
                <p className="text-xs opacity-75">
                  {selectedStatus === "Not Started"
                    ? "No progress yet on this goal"
                    : selectedStatus === "On Track"
                      ? "Making good progress towards the target"
                      : "Goal successfully completed"}
                </p>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-3">
            <label className="font-semibold text-slate-800">Quarterly Comments</label>
            <Textarea
              placeholder="Share your progress updates, blockers, or achievements... (minimum 8 characters)"
              {...register("comments")}
              className="min-h-32 resize-none border-slate-200 bg-white text-slate-800"
            />
            {errors.comments && <p className="text-xs text-red-600">{errors.comments.message}</p>}
            <p className="text-xs text-slate-500">
              {(watch("comments") || "").length} / 500 characters
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 text-white hover:bg-blue-700">
              {isLoading ? "Submitting..." : "Submit Check-in"}
            </Button>
            <Button variant="outline" type="button" disabled={isLoading} className="border-slate-200 bg-white text-slate-800 hover:bg-slate-50">
              Save Draft
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
