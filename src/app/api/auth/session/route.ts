import { NextResponse } from "next/server";
import { z } from "zod";

import {
  SESSION_COOKIE_NAME,
  createSessionFromLogin,
  deserializeSession,
  serializeSession,
} from "@/lib/auth/session";

const requestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["Employee", "Manager", "Admin"]),
});

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const match = cookieHeader
    ?.split("; ")
    .find((cookie) => cookie.startsWith(`${SESSION_COOKIE_NAME}=`))
    ?.split("=")[1];

  const session = deserializeSession(match);
  return NextResponse.json({ session });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials payload" }, { status: 400 });
  }

  const session = createSessionFromLogin(parsed.data);
  const response = NextResponse.json({ session });

  response.cookies.set(SESSION_COOKIE_NAME, serializeSession(session), {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });

  return response;
}

