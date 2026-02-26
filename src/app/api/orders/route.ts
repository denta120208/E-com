import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getOrdersFromSource } from "@/lib/orders-data";
import type { OrderStatus } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = (searchParams.get("status") as OrderStatus | "all" | null) ?? "all";
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = Math.max(1, Number(searchParams.get("limit") || "10"));

  const result = await getOrdersFromSource({ status, page, limit });

  return NextResponse.json({
    items: result.items,
    page,
    total: result.total,
    totalPages: result.totalPages,
    source: result.source,
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    orderId?: string;
    status?: OrderStatus;
  };

  if (!body.orderId || !body.status) {
    return NextResponse.json(
      { message: "orderId and status are required" },
      { status: 400 },
    );
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({
      message: "Order updated in mock mode.",
      orderId: body.orderId,
      status: body.status,
    });
  }

  try {
    const supabase = createSupabaseServiceClient();
    const { data: orderRow, error: orderLookupError } = await supabase
      .from("orders")
      .select("id")
      .or(`id.eq.${body.orderId},order_number.eq.${body.orderId}`)
      .maybeSingle();

    if (orderLookupError || !orderRow) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const nowIso = new Date().toISOString();
    const dbStatus = body.status === "canceled" ? "cancelled" : body.status;
    const paymentStatus =
      body.status === "paid"
        ? "success"
        : body.status === "canceled"
          ? "failed"
          : "pending";

    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: dbStatus, payment_status: paymentStatus, updated_at: nowIso })
      .eq("id", orderRow.id);

    if (updateError) {
      return NextResponse.json({ message: updateError.message }, { status: 500 });
    }

    const label =
      body.status === "paid"
        ? "Payment Confirmed"
        : body.status === "shipped"
          ? "Shipped"
          : body.status === "delivered"
            ? "Delivered"
            : body.status === "canceled"
              ? "Canceled"
              : "Order Placed";

    const { error: trackingError } = await supabase.from("order_tracking").insert({
      order_id: orderRow.id,
      status: dbStatus,
      label,
      occurred_at: nowIso,
    });

    if (trackingError) {
      return NextResponse.json({ message: trackingError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Order updated",
      orderId: body.orderId,
      status: body.status,
      source: "supabase",
    });
  } catch {
    return NextResponse.json({ message: "Order update failed" }, { status: 500 });
  }
}
