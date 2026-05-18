"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, LockKeyhole, UserCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { loginSchema, type LoginValues } from "@/lib/validations";
import type { UserRole } from "@/types";

const roleRoutes: Record<UserRole, string> = {
  Employee: "/dashboard/employee",
  Manager: "/dashboard/employee?role=manager",
  Admin: "/dashboard/employee?role=admin",
};

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "Employee",
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    window.sessionStorage.setItem("goalflow-role", values.role);
    router.push(roleRoutes[values.role]);
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm">
            <Building2 className="h-4 w-4" />
            GoalFlow secure access
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Sign in to the goal management workspace.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-slate-600">
              Choose your role, enter your credentials, and launch directly into the relevant dashboard experience.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { title: "Employee", copy: "Track personal goals and check-ins." },
              { title: "Manager", copy: "Review team progress and risks." },
              { title: "Admin", copy: "Maintain governance and policy visibility." },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="space-y-2 p-5">
                  <UserCircle2 className="h-5 w-5 text-blue-600" />
                  <p className="font-semibold text-slate-950">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.copy}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Card className="self-start">
          <CardHeader>
            <CardTitle>Role-based Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">Work Email</label>
                <Input placeholder="name@company.com" {...form.register("email")} />
                {form.formState.errors.email ? <p className="text-sm text-rose-600">{form.formState.errors.email.message}</p> : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">Password</label>
                <Input type="password" placeholder="Enter password" {...form.register("password")} />
                {form.formState.errors.password ? <p className="text-sm text-rose-600">{form.formState.errors.password.message}</p> : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">Role</label>
                <Select {...form.register("role")}>
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </Select>
              </div>

              <Button className="w-full" type="submit">
                <LockKeyhole className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}