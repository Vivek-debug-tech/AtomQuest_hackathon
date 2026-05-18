"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form";
import { multiGoalsSchema, type MultiGoalsInput } from "@/lib/validations";
import type { Goal } from "@/types";

const DEFAULT_ROW = {
  thrustArea: "",
  title: "",
  description: "",
  uomType: "Percentage",
  target: "",
  weightage: 10,
};

export function MultiGoalForm({ onSubmit, existingCount = 0 }: { onSubmit: (goals: Goal[]) => void; existingCount?: number }) {
  const form = useForm<MultiGoalsInput>({
    resolver: zodResolver(multiGoalsSchema),
    defaultValues: { goals: [DEFAULT_ROW] },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "goals" });

  const watchedGoals = form.watch("goals");
  const total = (watchedGoals || []).reduce((s, g) => s + Number(g.weightage || 0), 0);

  const handleAdd = () => {
    if (fields.length + existingCount >= 8) return;
    append(DEFAULT_ROW);
  };

  const onFormSubmit = (values: MultiGoalsInput) => {
    const created: Goal[] = values.goals.map((v) => ({
      id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      thrustArea: v.thrustArea,
      title: v.title,
      description: v.description,
      uomType: v.uomType,
      target: v.target,
      weightage: Number(v.weightage),
      progress: 0,
      status: "Not Started",
      owner: "Avery Kumar",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString().slice(0, 10),
      nextCheckIn: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().slice(0, 10),
      lastUpdated: new Date().toISOString().slice(0, 10),
    }));

    onSubmit(created);
    form.reset({ goals: [DEFAULT_ROW] });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Batch Create Goals</CardTitle>
            <p className="mt-1 text-sm text-slate-500">Add multiple goals (max 8). Total weightage must equal 100.</p>
          </div>

          <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">{existingCount + fields.length}/8</div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-3">
            {fields.map((field, idx) => (
              <div key={field.id} className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm font-medium">Goal {idx + 1}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Min 10%</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => remove(idx)}
                      aria-label={`Remove goal ${idx + 1}`}
                    >
                      <Trash2 className="h-4 w-4 text-rose-600" />
                    </Button>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <FormField label="Thrust Area">
                    <Input {...form.register(`goals.${idx}.thrustArea` as const)} placeholder="e.g. Employee Experience" />
                    {form.formState.errors.goals?.[idx]?.thrustArea ? (
                      <p className="mt-2 text-sm text-rose-600">{String(form.formState.errors.goals?.[idx]?.thrustArea?.message)}</p>
                    ) : null}
                  </FormField>

                  <FormField label="Goal Title">
                    <Input {...form.register(`goals.${idx}.title` as const)} placeholder="Concise goal title" />
                    {form.formState.errors.goals?.[idx]?.title ? (
                      <p className="mt-2 text-sm text-rose-600">{String(form.formState.errors.goals?.[idx]?.title?.message)}</p>
                    ) : null}
                  </FormField>

                  <FormField label="UoM Type">
                    <Select {...form.register(`goals.${idx}.uomType` as const)}>
                      <option value="Numeric">Numeric</option>
                      <option value="Percentage">Percentage</option>
                      <option value="Timeline">Timeline</option>
                      <option value="Zero-based">Zero-based</option>
                    </Select>
                  </FormField>

                  <FormField label="Weightage (%)">
                    <Input type="number" {...form.register(`goals.${idx}.weightage` as const, { valueAsNumber: true })} min={10} />
                    {form.formState.errors.goals?.[idx]?.weightage ? (
                      <p className="mt-2 text-sm text-rose-600">{String(form.formState.errors.goals?.[idx]?.weightage?.message)}</p>
                    ) : null}
                  </FormField>

                  <div className="sm:col-span-2">
                    <FormField label="Description">
                      <Textarea {...form.register(`goals.${idx}.description` as const)} placeholder="Short description and success criteria" />
                      {form.formState.errors.goals?.[idx]?.description ? (
                        <p className="mt-2 text-sm text-rose-600">{String(form.formState.errors.goals?.[idx]?.description?.message)}</p>
                      ) : null}
                    </FormField>
                  </div>

                  <div className="sm:col-span-2">
                    <FormField label="Target">
                      <Input {...form.register(`goals.${idx}.target` as const)} placeholder="e.g. 95% response" />
                      {form.formState.errors.goals?.[idx]?.target ? (
                        <p className="mt-2 text-sm text-rose-600">{String(form.formState.errors.goals?.[idx]?.target?.message)}</p>
                      ) : null}
                    </FormField>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button type="button" variant="outline" onClick={handleAdd} disabled={fields.length + existingCount >= 8}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add another goal
              </Button>
              <div className="text-sm text-slate-600">Current total: <span className="font-semibold text-slate-900">{total}%</span></div>
            </div>

            <div className="flex items-center gap-3">
              {typeof form.formState.errors.goals?.message === "string" ? (
                <p className="text-sm text-rose-600">{form.formState.errors.goals.message}</p>
              ) : null}
              <Button type="submit">Create Goals</Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default MultiGoalForm;
