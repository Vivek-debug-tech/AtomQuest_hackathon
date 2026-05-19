import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  SESSION_COOKIE_NAME,
  deserializeSession,
  isProtectedRoute,
  roleDashboardRoutes,
} from "@/lib/auth/session";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const session = deserializeSession(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL(roleDashboardRoutes[session.role], request.url));
  }

  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/dashboard/employee") && session.role !== "Employee") {
    return NextResponse.redirect(new URL(roleDashboardRoutes[session.role], request.url));
  }

  if (pathname.startsWith("/dashboard/manager") && session.role !== "Manager") {
    return NextResponse.redirect(new URL(roleDashboardRoutes[session.role], request.url));
  }

  if (pathname.startsWith("/dashboard/admin") && session.role !== "Admin") {
    return NextResponse.redirect(new URL(roleDashboardRoutes[session.role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
