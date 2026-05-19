"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { GoalInputRow } from "@/components/forms/GoalInputRow";
import { createGoalSchema, type GoalFormInput, type GoalFormValues } from "@/lib/validations";
import { getTotalWeightage, getWeightageBalance } from "@/lib/calculations";
import type { Goal } from "@/types";

const defaultValues: GoalFormInput = {
  thrustArea: "",
  title: "",
  description: "",
  uomType: "Percentage",
  evaluationMode: "higher-is-better",
  target: "",
  weightage: 10,
};

export function GoalForm({
  existingGoals,
  onSubmit,
}: {
  existingGoals: Goal[];
  onSubmit: (goal: Goal) => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<GoalFormInput, undefined, GoalFormValues>({
    resolver: zodResolver(createGoalSchema(existingGoals)),
    defaultValues,
  });

  const totalWeightage = getTotalWeightage(existingGoals);
  const remainingWeightage = getWeightageBalance(existingGoals);

  const handleSubmit = form.handleSubmit((values) => {
    const nextGoal: Goal = {
      id: `goal-${Date.now()}`,
      thrustArea: values.thrustArea,
      title: values.title,
      description: values.description,
      uomType: values.uomType,
      target: values.target,
      weightage: values.weightage,
      progress: 0,
      status: "Not Started",
      owner: "Avery Kumar",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString().slice(0, 10),
      nextCheckIn: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().slice(0, 10),
      lastUpdated: new Date().toISOString().slice(0, 10),
    };

    onSubmit(nextGoal);
    setSubmitted(true);
    form.reset(defaultValues);
  });

  return (
    <Card className="border-slate-200/60 bg-white/60 backdrop-blur-sm shadow-[0_4px_12px_rgba(15,23,42,0.08)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)] transition-all duration-300">
      <CardHeader className="pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-slate-950">Create Goal</CardTitle>
            <p className="mt-2 text-sm text-slate-600">Build an aligned goal with validation for enterprise planning.</p>
          </div>
          <div className="rounded-lg bg-blue-100 px-4 py-2 text-sm font-bold text-blue-900 whitespace-nowrap">
            {totalWeightage}% planned
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-4 border border-slate-200/50">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Goals created</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{existingGoals.length}<span className="text-lg text-slate-600">/8</span></p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 border border-blue-200/50">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Total weightage</p>
            <p className="mt-3 text-3xl font-bold text-blue-900">{totalWeightage}%</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 border border-emerald-200/50">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Remaining</p>
            <p className="mt-3 text-3xl font-bold text-emerald-900">{remainingWeightage}%</p>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <GoalInputRow label="Thrust Area" description="Choose the strategic pillar the goal supports.">
            <Input placeholder="e.g. Leadership Development" {...form.register("thrustArea")} className="h-11 border-slate-200 focus:border-blue-400 focus:bg-white" />
            {form.formState.errors.thrustArea ? (
              <p className="mt-2 text-sm font-medium text-red-600">{form.formState.errors.thrustArea.message}</p>
            ) : null}
          </GoalInputRow>

          <GoalInputRow label="Goal Title" description="Write a concise outcome-focused goal title.">
            <Input placeholder="e.g. Improve manager feedback quality" {...form.register("title")} />
            {form.formState.errors.title ? (
              <p className="mt-2 text-sm text-rose-600">{form.formState.errors.title.message}</p>
            ) : null}
          </GoalInputRow>

          <GoalInputRow label="Description" description="Add context and expected business impact.">
            <Textarea placeholder="Describe the goal and what success looks like." {...form.register("description")} />
            {form.formState.errors.description ? (
              <p className="mt-2 text-sm text-rose-600">{form.formState.errors.description.message}</p>
            ) : null}
          </GoalInputRow>

          <GoalInputRow label="UoM Type" description="Pick the unit used to measure the goal.">
            <NativeSelect {...form.register("uomType")}>
              <option value="Percentage">Percentage</option>
              <option value="Count">Count</option>
              <option value="Milestone">Milestone</option>
              <option value="Report">Report</option>
            </NativeSelect>
          </GoalInputRow>

          <GoalInputRow label="Target" description="Define the measurable target for the period.">
            <Input placeholder="e.g. 95% completion" {...form.register("target")} />
            {form.formState.errors.target ? (
              <p className="mt-2 text-sm text-rose-600">{form.formState.errors.target.message}</p>
            ) : null}
          </GoalInputRow>

          <GoalInputRow label="Weightage" description="Each goal must be at least 10 and total should stay within 100.">
            <Input type="number" min={10} max={100} {...form.register("weightage", { valueAsNumber: true })} />
            {form.formState.errors.weightage ? (
              <p className="mt-2 text-sm text-rose-600">{form.formState.errors.weightage.message}</p>
            ) : null}
          </GoalInputRow>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
            <Button type="submit">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Sparkles className="h-4 w-4 text-blue-600" />
              {submitted ? "Goal saved locally for the current session." : "Validation updates instantly as you edit."}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
