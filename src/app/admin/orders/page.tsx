"use client";

import { Fragment, useMemo, useState } from "react";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { orders } from "@/lib/mock-data";
import type { OrderStatus } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const tabs: Array<{ label: string; value: OrderStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Shipped", value: "shipped" },
  { label: "Canceled", value: "canceled" },
];

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const filteredOrders = useMemo(
    () => orders.filter((order) => statusFilter === "all" || order.status === statusFilter),
    [statusFilter],
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Order Management</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Filter by status, expand rows for quick actions, and export data.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">Export CSV</Button>
          <Button variant="secondary">Export PDF</Button>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            variant={statusFilter === tab.value ? "primary" : "secondary"}
            size="sm"
            onClick={() => setStatusFilter(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <Card className="overflow-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
              <th className="pb-2 font-medium">Order</th>
              <th className="pb-2 font-medium">Customer</th>
              <th className="pb-2 font-medium">Date</th>
              <th className="pb-2 font-medium">Total</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <Fragment key={order.id}>
                <tr key={order.id} className="border-b border-[var(--color-border)]">
                  <td className="py-3 font-medium">{order.number}</td>
                  <td className="py-3 text-[var(--color-text-muted)]">{order.customerName}</td>
                  <td className="py-3 text-[var(--color-text-muted)]">{formatDate(order.createdAt)}</td>
                  <td className="py-3">{formatCurrency(order.total)}</td>
                  <td className="py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedOrderId((current) => (current === order.id ? null : order.id))}
                    >
                      {expandedOrderId === order.id ? "Hide" : "Expand"}
                    </Button>
                  </td>
                </tr>
                {expandedOrderId === order.id ? (
                  <tr key={`${order.id}-expanded`} className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]">
                    <td colSpan={6} className="p-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-[var(--color-text-muted)]">
                          {order.items.length} items • Last update {formatDate(order.updatedAt)}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="secondary">
                            Mark Paid
                          </Button>
                          <Button size="sm" variant="secondary">
                            Mark Shipped
                          </Button>
                          <Button size="sm" variant="danger">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
