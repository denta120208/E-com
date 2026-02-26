import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { getOrdersFromSource } from "@/lib/orders-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const { items: orders, source } = await getOrdersFromSource({
    status: "all",
    page: 1,
    limit: 20,
  });
  const isSupabaseError = source === "supabase-error";

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Orders" }]} />
      <section>
        <h1 className="text-3xl font-semibold">Order History</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Review previous orders and follow shipping progress.
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">Data source: {source}</p>
        {isSupabaseError ? (
          <p className="mt-1 text-xs text-red-600">
            Failed to load order history from Supabase. Check env keys and orders schema migration.
          </p>
        ) : null}
      </section>

      {orders.length === 0 ? (
        <EmptyState
          title={isSupabaseError ? "Order history unavailable" : "No orders yet"}
          description={
            isSupabaseError
              ? "Supabase request failed. Please fix database config then refresh this page."
              : "Orders will appear here after your first checkout."
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{order.number}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">{formatDate(order.createdAt)}</p>
                </div>
                <OrderStatusBadge status={order.status} />
                <p className="text-sm font-semibold">{formatCurrency(order.total)}</p>
                <Link href={`/orders/${order.id}`} className="text-sm font-semibold text-[var(--color-brand)]">
                  View Details
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
