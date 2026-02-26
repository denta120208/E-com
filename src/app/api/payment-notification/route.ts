import { NextResponse } from "next/server";
import { mapMidtransStatus } from "@/lib/midtrans";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

interface MidtransWebhookPayload {
  order_id?: string;
  transaction_status?: string;
  fraud_status?: string;
  status_code?: string;
}

export async function POST(request: Request) {
  const payload = (await request.json()) as MidtransWebhookPayload;

  if (!payload.order_id) {
    return NextResponse.json({ message: "Missing order_id" }, { status: 400 });
  }

  const mappedStatus = mapMidtransStatus(
    payload.transaction_status ?? null,
    payload.fraud_status ?? null,
  );
  const dbStatus = mappedStatus === "canceled" ? "cancelled" : mappedStatus;
  const paymentStatus =
    mappedStatus === "paid"
      ? "success"
      : mappedStatus === "canceled"
        ? "failed"
        : "pending";

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = createSupabaseServiceClient();
      const { data: orderRow, error: lookupError } = await supabase
        .from("orders")
        .select("id")
        .eq("order_number", payload.order_id)
        .maybeSingle();

      if (lookupError) {
        return NextResponse.json({ message: lookupError.message }, { status: 500 });
      }

      if (orderRow) {
        const nowIso = new Date().toISOString();
        const { error: updateError } = await supabase
          .from("orders")
          .update({ status: dbStatus, payment_status: paymentStatus, updated_at: nowIso })
          .eq("id", orderRow.id);

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
          order_id: orderRow.id,
          status: dbStatus,
          message: label,
          label,
          occurred_at: nowIso,
        });

        if (trackingError) {
          return NextResponse.json({ message: trackingError.message }, { status: 500 });
        }
      }
    } catch {
      return NextResponse.json({ message: "Failed to sync payment status" }, { status: 500 });
    }
  }

  return NextResponse.json({
    message: "Notification received",
    orderId: payload.order_id,
    statusCode: payload.status_code ?? "200",
    transactionStatus: payload.transaction_status ?? "unknown",
    mappedStatus,
  });
}
