import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { CategoryBreakdown, SalesPoint } from "@/lib/types";

type GenericRow = Record<string, unknown>;

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
}

interface StatusMixItem {
  label: string;
  value: number;
}

export interface AdminMetricsData {
  totalSales: number;
  newUsers: number;
  ordersToday: number;
  lowStockCount: number;
  weeklySales: SalesPoint[];
  topSellingProducts: SalesPoint[];
  categoryBreakdown: CategoryBreakdown[];
  lowStockProducts: LowStockProduct[];
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
  statusMix: StatusMixItem[];
  error?: string;
}

function hasSupabaseServiceConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isoDateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

function normalizeOrderStatus(value: unknown) {
  const raw = String(value ?? "").toLowerCase();
  if (raw === "cancelled") return "canceled";
  if (raw === "paid") return "paid";
  if (raw === "shipped") return "shipped";
  if (raw === "delivered") return "delivered";
  if (raw === "canceled") return "canceled";
  return "pending";
}

function isPaidOrder(order: GenericRow) {
  const paymentStatus = String(order.payment_status ?? "").toLowerCase();
  const status = normalizeOrderStatus(order.status);
  return paymentStatus === "success" || status === "paid" || status === "shipped" || status === "delivered";
}

function emptyMetrics(error?: string): AdminMetricsData {
  return {
    totalSales: 0,
    newUsers: 0,
    ordersToday: 0,
    lowStockCount: 0,
    weeklySales: [],
    topSellingProducts: [],
    categoryBreakdown: [],
    lowStockProducts: [],
    revenueToday: 0,
    revenueWeek: 0,
    revenueMonth: 0,
    statusMix: [],
    error,
  };
}

function buildWeeklyBuckets() {
  const formatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
  const buckets: Array<{ dateKey: string; label: string; value: number }> = [];
  const now = new Date();

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    buckets.push({
      dateKey: isoDateOnly(date),
      label: formatter.format(date),
      value: 0,
    });
  }

  return buckets;
}

export async function getAdminMetricsData(): Promise<AdminMetricsData> {
  if (!hasSupabaseServiceConfig()) {
    return emptyMetrics("Supabase service role configuration is missing.");
  }

  try {
    const supabase = createSupabaseServiceClient();

    const [
      { data: ordersRaw, error: orderError },
      { data: usersRaw, error: userError },
      { data: productsRaw, error: productError },
      { data: categoriesRaw, error: categoryError },
      { data: orderItemsRaw, error: orderItemsError },
    ] = await Promise.all([
      supabase.from("orders").select("*"),
      supabase.from("profiles").select("id,created_at"),
      supabase.from("products").select("*"),
      supabase.from("categories").select("id,name"),
      supabase.from("order_items").select("*"),
    ]);

    if (orderError) return emptyMetrics(orderError.message);
    if (userError) return emptyMetrics(userError.message);
    if (productError) return emptyMetrics(productError.message);
    if (categoryError) return emptyMetrics(categoryError.message);
    if (orderItemsError) return emptyMetrics(orderItemsError.message);

    const orders = (ordersRaw ?? []) as GenericRow[];
    const users = (usersRaw ?? []) as GenericRow[];
    const products = (productsRaw ?? []) as GenericRow[];
    const categories = (categoriesRaw ?? []) as GenericRow[];
    const orderItems = (orderItemsRaw ?? []) as GenericRow[];

    const now = new Date();
    const startToday = new Date(now);
    startToday.setHours(0, 0, 0, 0);
    const startWeek = new Date(startToday);
    startWeek.setDate(startWeek.getDate() - 6);
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startUsersWindow = new Date(now);
    startUsersWindow.setDate(startUsersWindow.getDate() - 30);

    const paidOrders = orders.filter(isPaidOrder);
    const totalSales = paidOrders.reduce((sum, order) => sum + toNumber(order.total, 0), 0);

    const ordersToday = orders.filter((order) => {
      const created = new Date(String(order.created_at ?? ""));
      return Number.isFinite(created.getTime()) && created >= startToday;
    }).length;

    const newUsers = users.filter((user) => {
      const created = new Date(String(user.created_at ?? ""));
      return Number.isFinite(created.getTime()) && created >= startUsersWindow;
    }).length;

    const lowStockProducts = products
      .map((product) => ({
        id: String(product.id ?? ""),
        name: String(product.name ?? "Product"),
        stock: toNumber(product.stock, 0),
      }))
      .filter((product) => product.id && product.stock <= 10)
      .sort((left, right) => left.stock - right.stock);

    const weeklyBuckets = buildWeeklyBuckets();
    const weeklyMap = new Map(weeklyBuckets.map((bucket) => [bucket.dateKey, bucket]));
    for (const order of paidOrders) {
      const createdRaw = String(order.created_at ?? "");
      const createdAt = new Date(createdRaw);
      if (!Number.isFinite(createdAt.getTime())) continue;
      const key = isoDateOnly(createdAt);
      const bucket = weeklyMap.get(key);
      if (!bucket) continue;
      bucket.value += toNumber(order.total, 0);
    }

    const weeklySales: SalesPoint[] = weeklyBuckets.map((bucket) => ({
      label: bucket.label,
      value: Math.round(bucket.value),
    }));

    const revenueToday = paidOrders.reduce((sum, order) => {
      const createdAt = new Date(String(order.created_at ?? ""));
      if (!Number.isFinite(createdAt.getTime()) || createdAt < startToday) return sum;
      return sum + toNumber(order.total, 0);
    }, 0);

    const revenueWeek = paidOrders.reduce((sum, order) => {
      const createdAt = new Date(String(order.created_at ?? ""));
      if (!Number.isFinite(createdAt.getTime()) || createdAt < startWeek) return sum;
      return sum + toNumber(order.total, 0);
    }, 0);

    const revenueMonth = paidOrders.reduce((sum, order) => {
      const createdAt = new Date(String(order.created_at ?? ""));
      if (!Number.isFinite(createdAt.getTime()) || createdAt < startMonth) return sum;
      return sum + toNumber(order.total, 0);
    }, 0);

    const productById = new Map(
      products.map((product) => [
        String(product.id ?? ""),
        {
          name: String(product.name ?? "Product"),
          categoryId: String(product.category_id ?? ""),
        },
      ]),
    );
    const categoryNameById = new Map(
      categories.map((category) => [String(category.id ?? ""), String(category.name ?? "Uncategorized")]),
    );

    const topProductMap = new Map<string, number>();
    const categoryVolumeMap = new Map<string, number>();

    for (const orderItem of orderItems) {
      const quantity = Math.max(0, toNumber(orderItem.quantity, 0));
      const productId = String(orderItem.product_id ?? "");
      const productMeta = productById.get(productId);
      const label =
        String(orderItem.product_name ?? "").trim() ||
        productMeta?.name ||
        "Product";

      if (quantity > 0) {
        topProductMap.set(label, (topProductMap.get(label) ?? 0) + quantity);
      }

      const categoryId = productMeta?.categoryId ?? "";
      const categoryName = categoryNameById.get(categoryId) ?? "Uncategorized";
      categoryVolumeMap.set(categoryName, (categoryVolumeMap.get(categoryName) ?? 0) + quantity);
    }

    const topSellingProducts: SalesPoint[] = Array.from(topProductMap.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)
      .map(([label, value]) => ({ label, value }));

    const totalCategoryVolume = Array.from(categoryVolumeMap.values()).reduce((sum, value) => sum + value, 0);
    const categoryBreakdown: CategoryBreakdown[] =
      totalCategoryVolume === 0
        ? []
        : Array.from(categoryVolumeMap.entries())
            .sort((left, right) => right[1] - left[1])
            .map(([category, value]) => ({
              category,
              percent: Math.round((value / totalCategoryVolume) * 100),
            }));

    const statusCounts = new Map<string, number>([
      ["Pending", 0],
      ["Paid", 0],
      ["Shipped", 0],
      ["Delivered", 0],
      ["Canceled", 0],
    ]);

    for (const order of orders) {
      const status = normalizeOrderStatus(order.status);
      if (status === "paid") statusCounts.set("Paid", (statusCounts.get("Paid") ?? 0) + 1);
      if (status === "shipped") statusCounts.set("Shipped", (statusCounts.get("Shipped") ?? 0) + 1);
      if (status === "delivered") statusCounts.set("Delivered", (statusCounts.get("Delivered") ?? 0) + 1);
      if (status === "canceled") statusCounts.set("Canceled", (statusCounts.get("Canceled") ?? 0) + 1);
      if (status === "pending") statusCounts.set("Pending", (statusCounts.get("Pending") ?? 0) + 1);
    }

    const statusMix: StatusMixItem[] = Array.from(statusCounts.entries()).map(([label, value]) => ({
      label,
      value,
    }));

    return {
      totalSales: Math.round(totalSales),
      newUsers,
      ordersToday,
      lowStockCount: lowStockProducts.length,
      weeklySales,
      topSellingProducts,
      categoryBreakdown,
      lowStockProducts,
      revenueToday: Math.round(revenueToday),
      revenueWeek: Math.round(revenueWeek),
      revenueMonth: Math.round(revenueMonth),
      statusMix,
    };
  } catch (error) {
    return emptyMetrics(error instanceof Error ? error.message : "Failed to load analytics data.");
  }
}
