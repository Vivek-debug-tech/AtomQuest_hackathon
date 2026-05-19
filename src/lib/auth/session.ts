import type { UserRole } from "@/types";

export const SESSION_COOKIE_NAME = "goalflow_session";

export interface AppSession {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
}

export const DEFAULT_USERS: Record<UserRole, AppSession> = {
  Employee: {
    userId: "emp-001",
    name: "Avery Kumar",
    email: "avery.kumar@atomquest.com",
    role: "Employee",
    department: "People Operations",
  },
  Manager: {
    userId: "mgr-001",
    name: "Manager Lee",
    email: "lee.manager@atomquest.com",
    role: "Manager",
    department: "People Operations",
  },
  Admin: {
    userId: "adm-001",
    name: "Jordan Patel",
    email: "admin@atomquest.com",
    role: "Admin",
    department: "HR Systems",
  },
};

export const roleDashboardRoutes: Record<UserRole, string> = {
  Employee: "/dashboard/employee",
  Manager: "/dashboard/manager",
  Admin: "/dashboard/admin",
};

export function createSessionFromLogin(input: { email: string; role: UserRole }): AppSession {
  const preset = DEFAULT_USERS[input.role];
  const localPart = input.email.split("@")[0]?.trim() || "user";
  const name = localPart
    .split(/[._-]/g)
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(" ");

  return {
    ...preset,
    email: input.email,
    name: name || preset.name,
  };
}

export function serializeSession(session: AppSession) {
  return encodeURIComponent(JSON.stringify(session));
}

export function deserializeSession(value?: string | null): AppSession | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<AppSession>;
    if (
      typeof parsed.userId === "string" &&
      typeof parsed.name === "string" &&
      typeof parsed.email === "string" &&
      typeof parsed.department === "string" &&
      (parsed.role === "Employee" || parsed.role === "Manager" || parsed.role === "Admin")
    ) {
      return parsed as AppSession;
    }
  } catch {
    return null;
  }

  return null;
}

export function isProtectedRoute(pathname: string) {
  return ["/dashboard", "/goals", "/analytics", "/approvals", "/settings", "/checkins"].some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
