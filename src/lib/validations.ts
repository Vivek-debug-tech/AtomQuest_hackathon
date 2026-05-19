import { z } from "zod";

import type { Goal } from "@/types";
import { getTotalWeightage } from "@/lib/calculations";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid work email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["Employee", "Manager", "Admin"]),
});

const goalSchemaBase = z.object({
  thrustArea: z.string().min(2, "Select a thrust area"),
  title: z.string().min(4, "Goal title is required"),
  description: z.string().min(12, "Add a meaningful description"),
  uomType: z.string().min(2, "Select a UoM type"),
  evaluationMode: z.enum(["higher-is-better", "lower-is-better", "zero-based", "timeline"]),
  target: z.string().min(1, "Target is required"),
  weightage: z.coerce.number().int().min(10, "Minimum weightage per goal is 10").max(100),
  sharedWith: z.string().optional(),
});

export function createGoalSchema(existingGoals: Goal[]) {
  return goalSchemaBase.superRefine((value, ctx) => {
    if (existingGoals.length >= 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Maximum of 8 goals reached",
        path: ["title"],
      });
    }

    const projectedTotal = getTotalWeightage(existingGoals) + value.weightage;

    if (projectedTotal > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Total weightage across all goals cannot exceed 100",
        path: ["weightage"],
      });
    }
  });
}

// Schema for multiple goals submitted at once
export const goalRowSchema = goalSchemaBase;

export const multiGoalsSchema = z
  .object({
    goals: z.array(goalRowSchema).min(1, "Add at least one goal").max(8, "Maximum of 8 goals"),
  })
  .superRefine((data, ctx) => {
    const total = data.goals.reduce((s, g) => s + Number(g.weightage || 0), 0);
    if (total > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Total weightage across this batch cannot exceed 100",
        path: ["goals"],
      });
    }
  });

export type MultiGoalsInput = z.input<typeof multiGoalsSchema>;
export type MultiGoalsValues = z.output<typeof multiGoalsSchema>;

export const checkinSchema = z.object({
  goalId: z.string().min(1, "Choose a goal"),
  progress: z.coerce.number().min(1).max(100),
  note: z.string().min(8, "Add a short check-in note"),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type GoalFormInput = z.input<typeof goalSchemaBase>;
export type GoalFormValues = z.output<typeof goalSchemaBase>;
export type CheckinFormInput = z.input<typeof checkinSchema>;
export type CheckinFormValues = z.output<typeof checkinSchema>;
