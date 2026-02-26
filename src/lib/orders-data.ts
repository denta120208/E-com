import { orders as mockOrders } from "@/lib/mock-data";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { Order, OrderItem, OrderStatus, OrderTimelineStep } from "@/lib/types";

type OrdersFilter = {
  status?: OrderStatus | "all";
  page?: number;
  limit?: number;
};

type OrderRow = {
  id: string;
  order_number?: string | null;
  midtrans_order_id?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  status: string;
  total?: number | string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type OrderItemRow = {
  order_id: string;
  product_id?: string | null;
  product_name?: string | null;
  quantity?: number | string | null;
  unit_price?: number | string | null;
  price?: number | string | null;
  line_total?: number | string | null;
};

type TrackingRow = {
  order_id: string;
  status: string;
  label?: string | null;
  message?: string | null;
  occurred_at?: string | null;
  created_at?: string | null;
};

const orderedStatuses: OrderStatus[] = ["pending", "paid", "shipped", "delivered"];

function statusLabel(status: OrderStatus) {
  if (status === "pending") return "Order Placed";
  if (status === "paid") return "Payment Confirmed";
  if (status === "shipped") return "Shipped";
  if (status === "delivered") return "Delivered";
  return "Canceled";
}

function statusRank(status: OrderStatus) {
  const rankMap: Record<OrderStatus, number> = {
    pending: 1,
    paid: 2,
    shipped: 3,
    delivered: 4,
    canceled: 0,
  };
  return rankMap[status];
}

function normalizeRemoteStatus(status: string): OrderStatus {
  if (status === "cancelled") return "canceled";
  if (status === "paid") return "paid";
  if (status === "shipped") return "shipped";
  if (status === "delivered") return "delivered";
  return "pending";
}

function toRemoteStatus(status: OrderStatus | "all") {
  if (status === "all") return "all";
  if (status === "canceled") return "cancelled";
  return status;
}

function toSafeNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveOrderNumber(row: OrderRow) {
  return row.order_number ?? row.midtrans_order_id ?? row.id;
}

function resolveCustomerName(row: OrderRow) {
  return row.customer_name ?? "Guest Customer";
}

function resolveCustomerEmail(row: OrderRow) {
  return row.customer_email ?? "guest@example.com";
}

function trackingTimestamp(row?: Pick<TrackingRow, "occurred_at" | "created_at"> | null) {
  if (!row) return null;
  return row.occurred_at ?? row.created_at ?? null;
}

function sortTrackingRows(rows: TrackingRow[]) {
  return [...rows].sort((left, right) => {
    const leftTime = trackingTimestamp(left);
    const rightTime = trackingTimestamp(right);
    if (!leftTime && !rightTime) return 0;
    if (!leftTime) return 1;
    if (!rightTime) return -1;
    return leftTime.localeCompare(rightTime);
  });
}

function mapTimeline(status: OrderStatus, trackingRows: TrackingRow[]): OrderTimelineStep[] {
  if (status === "canceled") {
    return [
      {
        status: "pending",
        label: "Order Placed",
        at: trackingTimestamp(
          trackingRows.find((row) => normalizeRemoteStatus(row.status) === "pending"),
        ) ?? "-",
        done: true,
      },
      {
        status: "canceled",
        label: "Canceled",
        at: trackingTimestamp(
          trackingRows.find((row) => normalizeRemoteStatus(row.status) === "canceled"),
        ) ?? "-",
        done: true,
      },
    ];
  }

  return orderedStatuses.map((stepStatus) => {
    const track = trackingRows.find((row) => normalizeRemoteStatus(row.status) === stepStatus);
    return {
      status: stepStatus,
      label: statusLabel(stepStatus),
      at: trackingTimestamp(track) ?? "-",
      done: statusRank(status) >= statusRank(stepStatus),
    };
  });
}

function mapOrderFromRows(
  row: OrderRow,
  allItems: OrderItemRow[],
  allTracking: TrackingRow[],
): Order {
  const items: OrderItem[] = allItems
    .filter((item) => item.order_id === row.id)
    .map((item) => {
      const quantity = Math.max(1, toSafeNumber(item.quantity, 1));
      const unitPrice = toSafeNumber(item.unit_price ?? item.price, 0);
      const derivedPrice =
        unitPrice > 0 ? unitPrice : toSafeNumber(item.line_total, 0) / quantity;
      return {
        productId: item.product_id ?? "unknown",
        name: item.product_name ?? "Product",
        price: toSafeNumber(derivedPrice, 0),
        quantity,
      };
    });

  const tracking = sortTrackingRows(allTracking.filter((track) => track.order_id === row.id));
  const normalizedStatus = normalizeRemoteStatus(row.status);

  return {
    id: row.id,
    number: resolveOrderNumber(row),
    customerName: resolveCustomerName(row),
    customerEmail: resolveCustomerEmail(row),
    status: normalizedStatus,
    total: toSafeNumber(row.total, 0),
    createdAt: row.created_at ?? row.updated_at ?? new Date(0).toISOString(),
    updatedAt: row.updated_at ?? row.created_at ?? new Date(0).toISOString(),
    items,
    timeline: mapTimeline(normalizedStatus, tracking),
  };
}

function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function getOrdersFromSource({
  status = "all",
  page = 1,
  limit = 10,
}: OrdersFilter = {}) {
  if (!isSupabaseConfigured()) {
    const filtered = mockOrders.filter((order) => status === "all" || order.status === status);
    const start = (page - 1) * limit;
    return {
      items: filtered.slice(start, start + limit),
      total: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
      source: "mock" as const,
    };
  }

  try {
    const supabase = createSupabaseServiceClient();
    let query = supabase
      .from("orders")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (status !== "all") {
      query = query.eq("status", toRemoteStatus(status));
    }

    const start = (page - 1) * limit;
    const end = start + limit - 1;
    const { data: orderRowsRaw, count, error } = await query.range(start, end);

    if (error || !orderRowsRaw) {
      throw error ?? new Error("Failed to fetch orders");
    }

    const orderRows = orderRowsRaw as OrderRow[];

    if (orderRows.length === 0) {
      return { items: [], total: count ?? 0, totalPages: 1, source: "supabase" as const };
    }

    const orderIds = orderRows.map((row) => row.id);
    const [{ data: itemRowsRaw, error: itemError }, { data: trackingRowsRaw, error: trackingError }] =
      await Promise.all([
        supabase.from("order_items").select("*").in("order_id", orderIds),
        supabase.from("order_tracking").select("*").in("order_id", orderIds),
      ]);

    const itemRows = itemError ? [] : ((itemRowsRaw ?? []) as OrderItemRow[]);
    const trackingRows = trackingError ? [] : ((trackingRowsRaw ?? []) as TrackingRow[]);

    const mappedOrders = orderRows.map((row) =>
      mapOrderFromRows(
        row,
        itemRows,
        trackingRows,
      ),
    );

    return {
      items: mappedOrders,
      total: count ?? mappedOrders.length,
      totalPages: Math.max(1, Math.ceil((count ?? mappedOrders.length) / limit)),
      source: itemError || trackingError ? ("supabase-partial" as const) : ("supabase" as const),
    };
  } catch {
    if (isSupabaseConfigured()) {
      return {
        items: [],
        total: 0,
        totalPages: 1,
        source: "supabase-error" as const,
      };
    }

    const filtered = mockOrders.filter((order) => status === "all" || order.status === status);
    const start = (page - 1) * limit;
    return {
      items: filtered.slice(start, start + limit),
      total: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
      source: "mock" as const,
    };
  }
}

export async function getOrderByIdFromSource(orderId: string) {
  if (!isSupabaseConfigured()) {
    return mockOrders.find((order) => order.id === orderId || order.number === orderId) ?? null;
  }

  try {
    const supabase = createSupabaseServiceClient();

    const orderQueryById = supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    const orderQueryByNumber = supabase
      .from("orders")
      .select("*")
      .eq("order_number", orderId)
      .maybeSingle();

    const [{ data: byId }, { data: byNumber }] = await Promise.all([orderQueryById, orderQueryByNumber]);
    const orderRow = (byId ?? byNumber) as OrderRow | null;

    if (!orderRow) {
      return null;
    }

    const [{ data: itemRowsRaw, error: itemError }, { data: trackingRowsRaw, error: trackingError }] =
      await Promise.all([
        supabase.from("order_items").select("*").eq("order_id", orderRow.id),
        supabase.from("order_tracking").select("*").eq("order_id", orderRow.id),
    ]);

    const itemRows = itemError ? [] : ((itemRowsRaw ?? []) as OrderItemRow[]);
    const trackingRows = trackingError ? [] : ((trackingRowsRaw ?? []) as TrackingRow[]);

    return mapOrderFromRows(
      orderRow,
      itemRows,
      trackingRows,
    );
  } catch {
    if (isSupabaseConfigured()) {
      return null;
    }

    return mockOrders.find((order) => order.id === orderId || order.number === orderId) ?? null;
  }
}
