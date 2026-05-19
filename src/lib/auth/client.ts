"use client";

import type { AppSession } from "@/lib/auth/session";

import { SESSION_COOKIE_NAME, deserializeSession } from "@/lib/auth/session";

export function readSessionCookie() {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${SESSION_COOKIE_NAME}=`));

  return deserializeSession(match?.split("=")[1]);
}

export async function persistSession(input: { email: string; password: string; role: AppSession["role"] }) {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Failed to sign in");
  }

  return (await response.json()) as { session: AppSession };
}

export async function clearSession() {
  await fetch("/api/auth/session", {
    method: "DELETE",
  });
}

