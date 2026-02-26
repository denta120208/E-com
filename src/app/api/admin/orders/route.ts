import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";

type OrderRow = Record<string, unknown> & {
  id: string;
  order_number?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  status?: string | null;
  total?: number | string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type OrderItemRow = {
  order_id?: string | null;
};

interface UpdateOrderPayload {
  orderId?: string;
  status?: OrderStatus;
}

const allowedStatuses: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "canceled"];

function hasSupabaseServiceConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeStatus(status: string | null | undefined): OrderStatus {
  if (!status) return "pending";
  const lowered = status.toLowerCase();
  if (lowered === "cancelled") return "canceled";
  if (lowered === "paid") return "paid";
  if (lowered === "shipped") return "shipped";
  if (lowered === "delivered") return "delivered";
  if (lowered === "canceled") return "canceled";
  return "pending";
}

function toDbStatus(status: OrderStatus) {
  return status === "canceled" ? "cancelled" : status;
}

function toPaymentStatus(status: OrderStatus) {
  if (status === "paid") return "success";
  if (status === "canceled") return "failed";
  return "pending";
}

function statusLabel(status: OrderStatus) {
  if (status === "paid") return "Payment Confirmed";
  if (status === "shipped") return "Shipped";
  if (status === "delivered") return "Delivered";
  if (status === "canceled") return "Canceled";
  return "Order Placed";
}

function isMissingColumnError(message: string, key: string) {
  const lowered = message.toLowerCase();
  return lowered.includes("column") && lowered.includes(key.toLowerCase()) && lowered.includes("does not exist");
}

async function insertTracking(orderId: string, status: OrderStatus, nowIso: string) {
  const supabase = createSupabaseServiceClient();
  const dbStatus = toDbStatus(status);
  const label = statusLabel(status);

  const fullInsert = await supabase.from("order_tracking").insert({
    order_id: orderId,
    status: dbStatus,
    label,
    occurred_at: nowIso,
  });
  if (!fullInsert.error) return;

  if (!isMissingColumnError(fullInsert.error.message, "label") && !isMissingColumnError(fullInsert.error.message, "occurred_at")) {
    throw new Error(fullInsert.error.message);
  }

  const fallbackInsert = await supabase.from("order_tracking").insert({
    order_id: orderId,
    status: dbStatus,
    message: label,
  });

  if (fallbackInsert.error && !isMissingColumnError(fallbackInsert.error.message, "message")) {
    throw new Error(fallbackInsert.error.message);
  }
}

export async function GET(request: Request) {
  if (!hasSupabaseServiceConfig()) {
    return NextResponse.json({ message: "Supabase service role configuration is missing" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const statusParam = (searchParams.get("status") ?? "all").toLowerCase();
  const requestedStatus = (statusParam === "cancelled" ? "canceled" : statusParam) as OrderStatus | "all";
  if (requestedStatus !== "all" && !allowedStatuses.includes(requestedStatus)) {
    return NextResponse.json({ message: "Invalid status filter" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseServiceClient();
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (requestedStatus !== "all") {
      query = query.eq("status", toDbStatus(requestedStatus));
    }

    const { data: ordersRaw, error: orderError } = await query;
    if (orderError) {
      return NextResponse.json({ message: orderError.message }, { status: 500 });
    }

    const orders = (ordersRaw ?? []) as OrderRow[];
    const orderIds = orders.map((row) => row.id);
    let itemCountMap = new Map<string, number>();

    if (orderIds.length > 0) {
      const { data: orderItemsRaw, error: itemError } = await supabase
        .from("order_items")
        .select("order_id")
        .in("order_id", orderIds);

      if (itemError) {
        return NextResponse.json({ message: itemError.message }, { status: 500 });
      }

      const countMap = new Map<string, number>();
      for (const row of (orderItemsRaw ?? []) as OrderItemRow[]) {
        if (!row.order_id) continue;
        countMap.set(row.order_id, (countMap.get(row.order_id) ?? 0) + 1);
      }
      itemCountMap = countMap;
    }

    return NextResponse.json({
      items: orders.map((row) => ({
        id: row.id,
        number: (row.order_number as string | undefined) ?? row.id,
        customerName: (row.customer_name as string | undefined) ?? "Guest Customer",
        customerEmail: (row.customer_email as string | undefined) ?? "guest@example.com",
        status: normalizeStatus(row.status as string | null | undefined),
        total: toNumber(row.total, 0),
        createdAt: (row.created_at as string | undefined) ?? new Date(0).toISOString(),
        updatedAt: (row.updated_at as string | undefined) ?? new Date(0).toISOString(),
        itemsCount: itemCountMap.get(row.id) ?? 0,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to load orders" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  if (!hasSupabaseServiceConfig()) {
    return NextResponse.json({ message: "Supabase service role configuration is missing" }, { status: 500 });
  }

  const payload = (await request.json().catch(() => ({}))) as UpdateOrderPayload;
  if (!payload.orderId || !payload.status) {
    return NextResponse.json({ message: "orderId and status are required" }, { status: 400 });
  }
  if (!allowedStatuses.includes(payload.status)) {
    return NextResponse.json({ message: "Invalid status value" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseServiceClient();
    const nowIso = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: toDbStatus(payload.status),
        payment_status: toPaymentStatus(payload.status),
        updated_at: nowIso,
      })
      .or(`id.eq.${payload.orderId},order_number.eq.${payload.orderId}`);

    if (updateError) {
      return NextResponse.json({ message: updateError.message }, { status: 500 });
    }

    const { data: orderRow, error: orderLookupError } = await supabase
      .from("orders")
      .select("id")
      .or(`id.eq.${payload.orderId},order_number.eq.${payload.orderId}`)
      .maybeSingle();

    if (orderLookupError || !orderRow) {
      return NextResponse.json({ message: orderLookupError?.message ?? "Order not found" }, { status: 404 });
    }

    await insertTracking(orderRow.id as string, payload.status, nowIso);

    return NextResponse.json({
      message: "Order updated",
      orderId: payload.orderId,
      status: payload.status,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to update order" },
      { status: 500 },
    );
  }
}
