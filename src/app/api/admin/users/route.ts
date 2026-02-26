import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

type ProfileRow = Record<string, unknown> & {
  id: string;
  email?: string | null;
  full_name?: string | null;
  role?: string | null;
  created_at?: string | null;
  address?: string | null;
};

interface UpdateUserPayload {
  id?: string;
  role?: Role;
}

const roleOptions: Role[] = ["admin", "seller", "staff", "cs", "customer"];

function hasSupabaseServiceConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function mapProfile(row: ProfileRow) {
  return {
    id: row.id,
    name: (row.full_name as string | undefined) ?? "User",
    email: (row.email as string | undefined) ?? "-",
    role: roleOptions.includes((row.role as Role | undefined) ?? "customer")
      ? ((row.role as Role | undefined) ?? "customer")
      : "customer",
    joinedAt: (row.created_at as string | undefined) ?? new Date(0).toISOString(),
    address: (row.address as string | undefined) ?? "-",
  };
}

export async function GET() {
  if (!hasSupabaseServiceConfig()) {
    return NextResponse.json({ message: "Supabase service role configuration is missing" }, { status: 500 });
  }

  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      items: ((data ?? []) as ProfileRow[]).map(mapProfile),
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to load users" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  if (!hasSupabaseServiceConfig()) {
    return NextResponse.json({ message: "Supabase service role configuration is missing" }, { status: 500 });
  }

  const payload = (await request.json().catch(() => ({}))) as UpdateUserPayload;
  if (!payload.id || !payload.role) {
    return NextResponse.json({ message: "id and role are required" }, { status: 400 });
  }
  if (!roleOptions.includes(payload.role)) {
    return NextResponse.json({ message: "Invalid role value" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("profiles")
      .update({ role: payload.role })
      .eq("id", payload.id)
      .select("*")
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ message: error?.message ?? "User not found" }, { status: 500 });
    }

    return NextResponse.json({
      message: "Role updated",
      item: mapProfile(data as ProfileRow),
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to update role" },
      { status: 500 },
    );
  }
}
