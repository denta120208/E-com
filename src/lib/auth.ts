import type { Role } from "@/lib/types";

export const AUTH_COOKIE_NAME = "ecom_session";

export interface SessionUser {
  name: string;
  email: string;
  role: Role;
}

function isRole(value: string): value is Role {
  return ["admin", "seller", "staff", "cs", "customer"].includes(value);
}

export function serializeSession(user: SessionUser) {
  return encodeURIComponent(JSON.stringify(user));
}

export function parseSession(rawValue?: string | null): SessionUser | null {
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(rawValue)) as Partial<SessionUser>;
    if (
      typeof parsed.name === "string" &&
      typeof parsed.email === "string" &&
      typeof parsed.role === "string" &&
      isRole(parsed.role)
    ) {
      return {
        name: parsed.name,
        email: parsed.email,
        role: parsed.role,
      };
    }
  } catch {
    return null;
  }

  return null;
}
