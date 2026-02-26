import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, parseSession } from "./lib/auth";

const authenticatedPrefixes = ["/profile", "/orders", "/checkout", "/admin"];

function requiresAuth(pathname: string) {
  return authenticatedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!requiresAuth(pathname)) {
    return NextResponse.next();
  }

  const session = parseSession(request.cookies.get(AUTH_COOKIE_NAME)?.value ?? null);
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/orders/:path*", "/checkout/:path*", "/admin/:path*"],
};
