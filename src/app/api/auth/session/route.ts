import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, parseSession } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const user = parseSession(cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null);

  return NextResponse.json({
    authenticated: Boolean(user),
    user,
  });
}
