"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { checkinSchema, type CheckinFormInput, type CheckinFormValues } from "@/lib/validations";
import type { Goal } from "@/types";

export function CheckinForm({
  goals,
  onSubmit,
}: {
  goals: Goal[];
  onSubmit?: (values: CheckinFormValues) => void;
}) {
  const [success, setSuccess] = useState(false);
  const form = useForm<CheckinFormInput, undefined, CheckinFormValues>({
    resolver: zodResolver(checkinSchema),
    defaultValues: {
      goalId: goals[0]?.id ?? "",
      progress: 0,
      note: "",
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    setSuccess(true);
    onSubmit?.(values);
    form.reset({ goalId: goals[0]?.id ?? "", progress: 0, note: "" });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log a Check-in</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <NativeSelect {...form.register("goalId")}>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title}
              </option>
            ))}
          </NativeSelect>
          <Input type="number" min={1} max={100} placeholder="Progress percentage" {...form.register("progress", { valueAsNumber: true })} />
          <Textarea placeholder="Share blockers, momentum, and next steps." {...form.register("note")} />

          <Button type="submit" className="w-full">
            Submit Check-in
          </Button>
          {success ? <p className="text-sm text-emerald-600">Check-in saved locally for this phase.</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}
