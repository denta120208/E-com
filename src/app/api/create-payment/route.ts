import { NextResponse } from "next/server";
import type { CartItem } from "@/lib/types";
import { createMidtransTransaction, hasMidtransServerConfig } from "@/lib/midtrans";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

interface CreatePaymentPayload {
  customer?: {
    fullName?: string;
    email?: string;
    address?: string;
    city?: string;
    zipCode?: string;
  };
  items?: CartItem[];
}

function createOrderId() {
  const timestamp = Date.now().toString().slice(-8);
  return `EC-${timestamp}`;
}

function hasSupabaseServiceConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function isMissingTableError(message: string, table: string) {
  const lowered = message.toLowerCase();
  return (
    lowered.includes("schema cache") && lowered.includes(table.toLowerCase())
  ) || lowered.includes(`relation "public.${table.toLowerCase()}" does not exist`);
}

function resolveAppBaseUrl(request: Request) {
  const configuredBaseUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/, "");
  }

  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

function getEnabledMidtransPayments() {
  const raw = process.env.MIDTRANS_ENABLED_PAYMENTS;
  if (!raw) return undefined;

  const parsed = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : undefined;
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreatePaymentPayload;
  const customer = body.customer;
  const items = body.items ?? [];

  if (!customer?.fullName || !customer.email?.includes("@")) {
    return NextResponse.json({ message: "Missing customer details" }, { status: 400 });
  }
  if (!customer.address || !customer.city || !customer.zipCode) {
    return NextResponse.json({ message: "Missing shipping address fields" }, { status: 400 });
  }
  if (items.length === 0) {
    return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
  }

  const orderNumber = createOrderId();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal >= 250 ? 0 : 12;
  const tax = subtotal * 0.08;
  const discount = subtotal > 300 ? subtotal * 0.07 : 0;
  const grossAmount = Math.max(1, Math.round(subtotal + shippingCost + tax - discount));
  let persistedOrderId = orderNumber;

  if (hasSupabaseServiceConfig()) {
    try {
      const supabase = createSupabaseServiceClient();
      const { data: createdOrder, error: createOrderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_name: customer.fullName,
          customer_email: customer.email,
          status: "pending",
          payment_status: "pending",
          subtotal,
          shipping_cost: shippingCost,
          tax,
          discount,
          total: grossAmount,
          shipping_address: {
            address_line1: customer.address,
            city: customer.city,
            postal_code: customer.zipCode,
          },
          payment_method: "midtrans",
          midtrans_order_id: orderNumber,
        })
        .select("id")
        .single();

      if (createOrderError || !createdOrder) {
        return NextResponse.json(
          { message: createOrderError?.message ?? "Unable to create order" },
          { status: 500 },
        );
      }

      persistedOrderId = createdOrder.id;

      const orderItemRows = items.map((item) => ({
        order_id: createdOrder.id,
        product_id: null,
        variant_id: null,
        product_name: item.productName,
        quantity: item.quantity,
        price: item.price,
        discount: 0,
        unit_price: item.price,
        line_total: item.price * item.quantity,
      }));

      const { error: createItemsError } = await supabase.from("order_items").insert(orderItemRows);
      if (createItemsError && !isMissingTableError(createItemsError.message, "order_items")) {
        return NextResponse.json({ message: createItemsError.message }, { status: 500 });
      }

      const { error: trackingError } = await supabase.from("order_tracking").insert({
        order_id: createdOrder.id,
        status: "pending",
        label: "Order Placed",
      });

      if (trackingError && !isMissingTableError(trackingError.message, "order_tracking")) {
        return NextResponse.json({ message: trackingError.message }, { status: 500 });
      }
    } catch {
      return NextResponse.json({ message: "Failed to persist order data" }, { status: 500 });
    }
  }

  if (hasMidtransServerConfig()) {
    try {
      const baseUrl = resolveAppBaseUrl(request);
      const callbackOrderId = encodeURIComponent(persistedOrderId);
      const enabledPayments = getEnabledMidtransPayments();
      const payment = await createMidtransTransaction({
        orderId: orderNumber,
        grossAmount,
        customer: {
          fullName: customer.fullName,
          email: customer.email,
          city: customer.city,
          zipCode: customer.zipCode,
        },
        callbacks: {
          finish: `${baseUrl}/payment/success?orderId=${callbackOrderId}`,
          pending: `${baseUrl}/payment/pending?orderId=${callbackOrderId}`,
          error: `${baseUrl}/payment/error?orderId=${callbackOrderId}`,
        },
        enabledPayments,
      });

      return NextResponse.json({
        orderId: persistedOrderId,
        orderNumber,
        payment,
        isMock: false,
      });
    } catch (error) {
      return NextResponse.json(
        {
          message: error instanceof Error ? error.message : "Failed to create Midtrans transaction",
        },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({
    orderId: persistedOrderId,
    orderNumber,
    payment: {
      token: `mock-token-${orderNumber}`,
      redirectUrl: `/payment/pending?orderId=${persistedOrderId}`,
    },
    isMock: true,
  });
}
