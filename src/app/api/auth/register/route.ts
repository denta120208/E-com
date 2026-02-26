import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, serializeSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!body.name?.trim()) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 });
  }
  if (!body.email?.includes("@")) {
    return NextResponse.json({ message: "Valid email is required" }, { status: 400 });
  }
  if (!body.password || body.password.length < 8) {
    return NextResponse.json(
      { message: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }

  const response = NextResponse.json({
    message: "Registration complete. Verification email sent.",
    user: {
      name: body.name,
      email: body.email,
      role: "customer",
    },
  });

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: serializeSession({
      name: body.name,
      email: body.email,
      role: "customer",
    }),
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
