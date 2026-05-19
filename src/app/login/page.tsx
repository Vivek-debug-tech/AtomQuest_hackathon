"use client";

import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowRight, ChartColumnIncreasing, Shield, Sparkles, Users2 } from "lucide-react";

import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { loginSchema, type LoginValues } from "@/lib/validations";
import type { UserRole } from "@/types";

const roleCopy: Record<UserRole, string> = {
  Employee: "Own personal goals, quarterly progress, and status updates.",
  Manager: "Approve goals, review submissions, and guide team execution.",
  Admin: "Oversee governance, analytics, reporting, and escalations.",
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const { signIn, isPending } = useAuth();
  const defaultRole = (searchParams.get("role") as UserRole | null) ?? "Employee";

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: defaultRole,
    },
  });

  const role = form.watch("role");

  const onSubmit = form.handleSubmit(async (values) => {
    await signIn(values);
  });

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_22%),radial-gradient(circle_at_85%_10%,_rgba(15,23,42,0.12),_transparent_18%),linear-gradient(135deg,_#05111f_0%,_#0f172a_36%,_#eff6ff_36%,_#f8fbff_100%)]">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <section className="hidden px-8 py-10 text-white lg:flex lg:flex-col">
          <div className="max-w-xl space-y-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-blue-100 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Atomquest Goal OS
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-semibold tracking-tight">Enterprise goal operations with executive-grade visibility.</h1>
              <p className="text-lg leading-8 text-slate-300">
                Approvals, quarterly execution, analytics, audits, and escalations designed for hackathon demos that still need production credibility.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { title: "Completion", value: "84%", icon: ChartColumnIncreasing },
                { title: "Approvals", value: "07", icon: Shield },
                { title: "Managers", value: "12", icon: Users2 },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-100">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-5 text-sm text-slate-300">{item.title}</p>
                    <p className="mt-1 text-3xl font-semibold">{item.value}</p>
                  </div>
                );
              })}
            </div>
            <Card className="rounded-[32px] border-white/10 bg-white/8 text-white backdrop-blur-xl">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-300">Preview analytics</p>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-200">Live</span>
                </div>
                <div className="grid gap-3">
                  {[
                    "Quarterly schedule enforcement is active for Q2 2026.",
                    "Goal locking triggers automatically after approval.",
                    "CSV export, heatmaps, and audit trails are available by role.",
                  ].map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-sm text-slate-200">
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="glass-panel w-full max-w-xl rounded-[36px] border border-white/60 p-3 shadow-[0_30px_120px_rgba(15,23,42,0.18)]"
          >
            <div className="rounded-[30px] border border-white/70 bg-white/78 p-6 sm:p-8">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Secure Access</p>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Sign in to your role-based workspace</h2>
                <p className="text-sm leading-7 text-slate-600">
                  Session persistence, protected routes, and role-aware navigation are enabled for employee, manager, and admin access.
                </p>
              </div>

              <form className="mt-8 space-y-5" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">Role</label>
                  <Select
                    value={role}
                    onValueChange={(value) => form.setValue("role", value as UserRole, { shouldValidate: true })}
                  >
                    <SelectTrigger className="h-12 w-full rounded-2xl border-slate-200 bg-white">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="Employee">Employee</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">{roleCopy[role]}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {(["Employee", "Manager", "Admin"] as UserRole[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => form.setValue("role", item, { shouldValidate: true })}
                      className={`rounded-[22px] border px-4 py-4 text-left transition ${
                        role === item
                          ? "border-slate-950 bg-slate-950 text-white shadow-[0_20px_40px_rgba(15,23,42,0.18)]"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <p className="font-semibold">{item}</p>
                      <p className={`mt-2 text-xs leading-5 ${role === item ? "text-slate-200" : "text-slate-500"}`}>{item === "Employee" ? "Goals" : item === "Manager" ? "Approvals" : "Governance"}</p>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">Work email</label>
                  <Input className="h-12 rounded-2xl border-slate-200 bg-white" placeholder="name@company.com" {...form.register("email")} />
                  {form.formState.errors.email ? <p className="text-sm text-rose-600">{form.formState.errors.email.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">Password</label>
                  <Input type="password" className="h-12 rounded-2xl border-slate-200 bg-white" placeholder="Enter password" {...form.register("password")} />
                  {form.formState.errors.password ? <p className="text-sm text-rose-600">{form.formState.errors.password.message}</p> : null}
                </div>

                <Button type="submit" disabled={isPending} className="h-12 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800">
                  {isPending ? "Signing in..." : "Enter workspace"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
