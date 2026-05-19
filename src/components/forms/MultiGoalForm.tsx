"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Trash2 } from "lucide-react";

import { FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { multiGoalsSchema, type MultiGoalsInput } from "@/lib/validations";
import type { Goal } from "@/types";

function createDefaultRow(): MultiGoalsInput["goals"][number] {
  return {
    thrustArea: "",
    title: "",
    description: "",
    uomType: "Percentage",
    target: "",
    weightage: 10,
    evaluationMode: "higher-is-better",
    sharedWith: "",
  };
}

export function MultiGoalForm({ onSubmit, existingCount = 0 }: { onSubmit: (goals: Goal[]) => void; existingCount?: number }) {
  const safeExistingCount = Number.isFinite(existingCount) ? existingCount : 0;
  const form = useForm<MultiGoalsInput>({
    resolver: zodResolver(multiGoalsSchema),
    defaultValues: { goals: [createDefaultRow()] },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "goals" });
  const watchedGoals = form.watch("goals");
  const total = (watchedGoals || []).reduce((sum, goal) => sum + Number(goal.weightage || 0), 0);

  const handleAdd = () => {
    if (fields.length + safeExistingCount >= 8) return;
    append(createDefaultRow());
  };

  const onFormSubmit = (values: MultiGoalsInput) => {
    const created: Goal[] = values.goals.map((value) => ({
      id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      thrustArea: value.thrustArea,
      title: value.title,
      description: value.description,
      uomType: value.uomType,
      target: value.target,
      weightage: Number(value.weightage),
      progress: 0,
      status: "Not Started",
      owner: "Avery Kumar",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString().slice(0, 10),
      nextCheckIn: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().slice(0, 10),
      lastUpdated: new Date().toISOString().slice(0, 10),
      approvalStatus: "Pending",
      evaluationMode: value.evaluationMode,
      sharedWith: value.sharedWith ? value.sharedWith.split(",").map((item) => item.trim()).filter(Boolean) : [],
      managerId: "mgr-001",
    }));

    onSubmit(created);
    form.reset({ goals: [createDefaultRow()] });
  };

  return (
    <Card className="overflow-hidden border-white/70 bg-white/78 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
      <CardHeader className="pb-0">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Batch create goals</CardTitle>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Build multiple goals in one planning pass. Maximum 8 goals. Total weightage must equal 100.
            </p>
          </div>
          <div className="rounded-[22px] bg-[linear-gradient(135deg,#0f2858_0%,#2563eb_100%)] px-4 py-3 text-white shadow-[0_16px_32px_rgba(29,78,216,0.2)]">
            <p className="text-xs uppercase tracking-[0.16em] text-blue-100">Plan load</p>
            <p className="mt-1 font-heading text-2xl font-semibold">{safeExistingCount + fields.length}/8</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[22px] border border-white/70 bg-white/75 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Current total</p>
            <p className="mt-2 font-heading text-3xl font-semibold text-slate-950">{total}%</p>
          </div>
          <div className="rounded-[22px] border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Validation</p>
            <p className="mt-2 text-sm font-semibold text-blue-900">Min 10% per goal</p>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">Cycle rule</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">Lock after approval</p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-[28px] border border-white/70 bg-white/72 p-5 shadow-[0_16px_32px_rgba(15,23,42,0.05)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Goal {index + 1}</p>
                  <p className="mt-1 font-semibold text-slate-950">Strategic objective definition</p>
                </div>
                <Button variant="ghost" size="icon" type="button" onClick={() => remove(index)} aria-label={`Remove goal ${index + 1}`}>
                  <Trash2 className="h-4 w-4 text-rose-600" />
                </Button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <FormField label="Thrust Area">
                  <Input {...form.register(`goals.${index}.thrustArea` as const)} placeholder="Employee Experience" />
                  {form.formState.errors.goals?.[index]?.thrustArea ? (
                    <p className="mt-2 text-sm text-rose-600">{String(form.formState.errors.goals?.[index]?.thrustArea?.message)}</p>
                  ) : null}
                </FormField>

                <FormField label="Goal Title">
                  <Input {...form.register(`goals.${index}.title` as const)} placeholder="Concise outcome-focused title" />
                  {form.formState.errors.goals?.[index]?.title ? (
                    <p className="mt-2 text-sm text-rose-600">{String(form.formState.errors.goals?.[index]?.title?.message)}</p>
                  ) : null}
                </FormField>

                <FormField label="UoM Type">
                  <NativeSelect {...form.register(`goals.${index}.uomType` as const)}>
                    <option value="Numeric">Numeric</option>
                    <option value="Percentage">Percentage</option>
                    <option value="Timeline">Timeline</option>
                    <option value="Zero-based">Zero-based</option>
                  </NativeSelect>
                </FormField>

                <FormField label="Weightage (%)">
                  <Input type="number" {...form.register(`goals.${index}.weightage` as const, { valueAsNumber: true })} min={10} />
                  {form.formState.errors.goals?.[index]?.weightage ? (
                    <p className="mt-2 text-sm text-rose-600">{String(form.formState.errors.goals?.[index]?.weightage?.message)}</p>
                  ) : null}
                </FormField>

                <FormField label="Evaluation Mode">
                  <NativeSelect {...form.register(`goals.${index}.evaluationMode` as const)}>
                    <option value="higher-is-better">Higher is better</option>
                    <option value="lower-is-better">Lower is better</option>
                    <option value="zero-based">Zero based</option>
                    <option value="timeline">Timeline</option>
                  </NativeSelect>
                </FormField>

                <div className="sm:col-span-2">
                  <FormField label="Description">
                    <Textarea {...form.register(`goals.${index}.description` as const)} placeholder="Describe success criteria, business impact, and expected outcome." />
                    {form.formState.errors.goals?.[index]?.description ? (
                      <p className="mt-2 text-sm text-rose-600">{String(form.formState.errors.goals?.[index]?.description?.message)}</p>
                    ) : null}
                  </FormField>
                </div>

                <div className="sm:col-span-2">
                  <FormField label="Target">
                    <Input {...form.register(`goals.${index}.target` as const)} placeholder="95% completion or another measurable target" />
                    {form.formState.errors.goals?.[index]?.target ? (
                      <p className="mt-2 text-sm text-rose-600">{String(form.formState.errors.goals?.[index]?.target?.message)}</p>
                    ) : null}
                  </FormField>
                </div>

                <div className="sm:col-span-2">
                  <FormField label="Share Goal With">
                    <Input {...form.register(`goals.${index}.sharedWith` as const)} placeholder="Comma separated teams or users" />
                  </FormField>
                </div>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" onClick={handleAdd} disabled={fields.length + safeExistingCount >= 8}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add another goal
              </Button>
              {typeof form.formState.errors.goals?.message === "string" ? (
                <p className="text-sm text-rose-600">{form.formState.errors.goals.message}</p>
              ) : null}
            </div>

            <Button type="submit">Create Goals</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default MultiGoalForm;
