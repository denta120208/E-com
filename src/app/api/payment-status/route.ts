import { NextResponse } from "next/server";
import {
  fetchMidtransTransactionStatus,
  hasMidtransServerConfig,
  mapMidtransStatus,
} from "@/lib/midtrans";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

interface PaymentStatusPayload {
  orderId?: string;
  orderNumber?: string;
}

interface OrderLookupRow {
  id: string;
  order_number?: string | null;
  midtrans_order_id?: string | null;
  status?: string | null;
  payment_status?: string | null;
}

type SupabaseServiceClient = ReturnType<typeof createSupabaseServiceClient>;

function hasSupabaseServiceConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeDbStatus(status: string | null | undefined) {
  if (!status) return "pending";
  return status.toLowerCase();
}

async function queryOrderById(supabase: SupabaseServiceClient, reference: string) {
  if (!isUuid(reference)) return null;

  const { data, error } = await supabase
    .from("orders")
    .select("id,order_number,midtrans_order_id,status,payment_status")
    .eq("id", reference)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as OrderLookupRow | null) ?? null;
}

async function queryOrderByNumber(supabase: SupabaseServiceClient, reference: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("id,order_number,midtrans_order_id,status,payment_status")
    .eq("order_number", reference)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data) return data as OrderLookupRow;

  const { data: midtransData, error: midtransError } = await supabase
    .from("orders")
    .select("id,order_number,midtrans_order_id,status,payment_status")
    .eq("midtrans_order_id", reference)
    .maybeSingle();

  if (midtransError) {
    throw new Error(midtransError.message);
  }

  return (midtransData as OrderLookupRow | null) ?? null;
}

async function findOrderByReference(supabase: SupabaseServiceClient, references: string[]) {
  for (const reference of references) {
    const byId = await queryOrderById(supabase, reference);
    if (byId) return byId;

    const byNumber = await queryOrderByNumber(supabase, reference);
    if (byNumber) return byNumber;
  }

  return null;
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as PaymentStatusPayload;
  const references = [payload.orderId, payload.orderNumber]
    .map((value) => value?.trim() ?? "")
    .filter(Boolean);

  if (references.length === 0) {
    return NextResponse.json(
      { message: "orderId or orderNumber is required" },
      { status: 400 },
    );
  }

  if (!hasSupabaseServiceConfig()) {
    return NextResponse.json(
      { message: "Supabase service role configuration is missing" },
      { status: 500 },
    );
  }

  if (!hasMidtransServerConfig()) {
    return NextResponse.json(
      { message: "Midtrans server configuration is missing" },
      { status: 500 },
    );
  }

  try {
    const supabase = createSupabaseServiceClient();
    const order = await findOrderByReference(supabase, references);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const midtransOrderId = order.order_number ?? order.midtrans_order_id;
    if (!midtransOrderId) {
      return NextResponse.json(
        { message: "Midtrans order number is missing on this order" },
        { status: 500 },
      );
    }

    const midtransStatus = await fetchMidtransTransactionStatus(midtransOrderId);
    const mappedStatus = mapMidtransStatus(
      midtransStatus.transaction_status ?? null,
      midtransStatus.fraud_status ?? null,
    );
    const dbStatus = mappedStatus === "canceled" ? "cancelled" : mappedStatus;
    const paymentStatus =
      mappedStatus === "paid"
        ? "success"
        : mappedStatus === "canceled"
          ? "failed"
          : "pending";
    const nowIso = new Date().toISOString();
    const currentStatus = normalizeDbStatus(order.status);
    const currentPaymentStatus = normalizeDbStatus(order.payment_status);
    const shouldUpdate = currentStatus !== dbStatus || currentPaymentStatus !== paymentStatus;

    if (shouldUpdate) {
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: dbStatus, payment_status: paymentStatus, updated_at: nowIso })
        .eq("id", order.id);

      if (updateError) {
        return NextResponse.json({ message: updateError.message }, { status: 500 });
      }

      const label =
        mappedStatus === "paid"
          ? "Payment Confirmed"
          : mappedStatus === "canceled"
            ? "Canceled"
            : "Order Placed";

      const { error: trackingError } = await supabase.from("order_tracking").insert({
        order_id: order.id,
        status: dbStatus,
        label,
        occurred_at: nowIso,
      });

      if (trackingError) {
        return NextResponse.json({ message: trackingError.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      message: shouldUpdate ? "Payment status synchronized" : "Payment status already up-to-date",
      orderId: order.id,
      orderNumber: midtransOrderId,
      transactionStatus: midtransStatus.transaction_status ?? "unknown",
      mappedStatus,
      status: dbStatus,
      paymentStatus,
      updated: shouldUpdate,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to synchronize payment status",
      },
      { status: 500 },
    );
  }
}
