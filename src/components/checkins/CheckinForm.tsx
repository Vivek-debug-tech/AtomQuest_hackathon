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
import type { CheckInStatus, Goal } from "@/types";

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
  const targetNum = parseFloat(goal.target) || 1;
  const progressPercent = Math.round((actualAchievement / targetNum) * 100);

  const statusConfig: Record<CheckInStatus, { color: string; bgColor: string; icon: React.ReactNode; copy: string }> = {
    "Not Started": {
      color: "text-slate-700",
      bgColor: "border-slate-200 bg-slate-50",
      icon: <AlertCircle className="h-5 w-5" />,
      copy: "No progress has been recorded yet for this cycle.",
    },
    "On Track": {
      color: "text-blue-700",
      bgColor: "border-blue-200 bg-blue-50",
      icon: <TrendingUp className="h-5 w-5" />,
      copy: "Execution is moving in line with the target trajectory.",
    },
    Completed: {
      color: "text-emerald-700",
      bgColor: "border-emerald-200 bg-emerald-50",
      icon: <CheckCircle2 className="h-5 w-5" />,
      copy: "The goal has reached completion for the reported quarter.",
    },
  };

  const config = statusConfig[selectedStatus];

  return (
    <Card className="overflow-hidden border-white/70 bg-white/78 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
      <CardHeader className="pb-0">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <CardTitle className="text-xl">{goal.title}</CardTitle>
            <CardDescription className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-blue-700">
                {goal.thrustArea}
              </span>
              <span className="rounded-full border border-white/70 bg-white/78 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Target {goal.target}
              </span>
            </CardDescription>
          </div>
          <div className="rounded-[22px] bg-[linear-gradient(135deg,#0f2858_0%,#2563eb_100%)] px-4 py-3 text-white shadow-[0_16px_32px_rgba(29,78,216,0.2)]">
            <p className="text-xs uppercase tracking-[0.16em] text-blue-100">Weightage</p>
            <p className="mt-1 font-heading text-2xl font-semibold">{goal.weightage}%</p>
          </div>
        </div>
        {goal.isLocked ? (
          <div className="mt-4 rounded-[22px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            This goal is locked for edits after approval, but quarterly achievement check-ins remain open.
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6 pt-5">
        <div className="rounded-[26px] bg-slate-950 p-5 text-white shadow-[0_20px_42px_rgba(15,23,42,0.18)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Planned target</p>
              <p className="mt-2 text-lg font-semibold">{goal.target}</p>
              <p className="mt-1 text-sm text-slate-400">Unit of measure: {goal.uomType}</p>
            </div>
            <div className="rounded-[20px] bg-white/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Live progress</p>
              <p className="mt-1 font-heading text-3xl font-semibold">{Math.max(progressPercent, 0)}%</p>
            </div>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/12">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#f8fbff_0%,#bae6fd_100%)]"
              style={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-800">Actual achievement</label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="Enter achieved value"
                  {...register("actualAchievement")}
                  className="pr-24 text-base"
                  step="0.01"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {goal.uomType}
                </span>
              </div>
              {errors.actualAchievement ? <p className="text-xs text-red-600">{errors.actualAchievement.message}</p> : null}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-800">Progress status</label>
              <Select onValueChange={(value) => setValue("status", value as CheckInStatus)} defaultValue={selectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="On Track">On Track</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              {errors.status ? <p className="text-xs text-red-600">{errors.status.message}</p> : null}
            </div>
          </div>

          <div className={`rounded-[24px] border p-4 ${config.bgColor}`}>
            <div className={`flex items-start gap-3 ${config.color}`}>
              {config.icon}
              <div>
                <p className="text-sm font-semibold">{selectedStatus}</p>
                <p className="mt-1 text-sm leading-6 opacity-90">{config.copy}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-800">Quarterly comments</label>
            <Textarea
              placeholder="Share wins, blockers, dependencies, or manager asks for this quarter."
              {...register("comments")}
              className="min-h-32 resize-none"
            />
            {errors.comments ? <p className="text-xs text-red-600">{errors.comments.message}</p> : null}
            <p className="text-xs text-slate-500">{(watch("comments") || "").length} / 500 characters</p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Check-in"}
            </Button>
            <Button variant="outline" type="button" disabled={isLoading}>
              Save Draft
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
