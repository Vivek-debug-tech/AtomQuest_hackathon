import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME, deserializeSession } from "@/lib/auth/session";

export async function getServerSession() {
  const cookieStore = await cookies();
  return deserializeSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}
