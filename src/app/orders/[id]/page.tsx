import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { OrderRealtimeListener } from "@/components/orders/order-realtime-listener";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { Card } from "@/components/ui/card";
import { getOrderByIdFromSource } from "@/lib/orders-data";
import { formatCurrency, formatDate } from "@/lib/utils";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

function progressByStatus(status: string) {
  if (status === "pending") return 25;
  if (status === "paid") return 50;
  if (status === "shipped") return 75;
  if (status === "delivered") return 100;
  return 0;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderByIdFromSource(id);
  if (!order) {
    notFound();
  }

  const progress = progressByStatus(order.status);

  return (
    <div className="space-y-6">
      <OrderRealtimeListener orderId={order.id} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Orders", href: "/orders" },
          { label: order.number },
        ]}
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{order.number}</h1>
            <p className="text-sm text-[var(--color-text-muted)]">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm font-medium">Tracking Progress</p>
          <div className="h-3 rounded-full bg-[var(--color-surface-alt)]">
            <div
              className="h-3 rounded-full bg-[var(--color-brand)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <h2 className="text-lg font-semibold">Items</h2>
          <div className="mt-4 space-y-3">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between border-b border-[var(--color-border)] pb-2 text-sm">
                <p className="text-[var(--color-text-muted)]">
                  {item.name} x {item.quantity}
                </p>
                <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
            <div className="flex items-center justify-between text-base font-semibold">
              <p>Total</p>
              <p>{formatCurrency(order.total)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Timeline</h2>
          <ol className="mt-4 space-y-4">
            {order.timeline.map((step) => (
              <li key={step.status} className="relative pl-6">
                <span
                  className={`absolute top-1 left-0 h-3 w-3 rounded-full ${step.done ? "bg-[var(--color-brand)]" : "bg-[var(--color-border)]"}`}
                />
                <p className="text-sm font-semibold">{step.label}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{step.at}</p>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}
