import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, serializeSession, type SessionUser } from "@/lib/auth";
import type { Role } from "@/lib/types";

function roleByEmail(email: string): Role {
  const normalized = email.toLowerCase();
  if (normalized.includes("admin")) return "admin";
  if (normalized.includes("seller")) return "seller";
  if (normalized.includes("staff")) return "staff";
  if (normalized.includes("support") || normalized.includes("cs")) return "cs";
  return "customer";
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  if (!body.email?.includes("@")) {
    return NextResponse.json({ message: "Valid email is required" }, { status: 400 });
  }
  if (!body.password || body.password.length < 8) {
    return NextResponse.json(
      { message: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }

  const user: SessionUser = {
    name: body.email.split("@")[0].replace(/[._-]/g, " "),
    email: body.email,
    role: roleByEmail(body.email),
  };

  const response = NextResponse.json({
    message: "Login successful",
    user,
  });

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: serializeSession(user),
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
