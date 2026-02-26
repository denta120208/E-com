"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { OrderStatus } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface AdminOrder {
  id: string;
  number: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
  itemsCount: number;
}

const tabs: Array<{ label: string; value: OrderStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Canceled", value: "canceled" },
];

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const response = await fetch(`/api/admin/orders?${params.toString()}`, { cache: "no-store" });
      const result = (await response.json().catch(() => null)) as
        | { items?: AdminOrder[]; message?: string }
        | null;

      if (!response.ok || !result?.items) {
        throw new Error(result?.message ?? "Failed to load orders");
      }

      setOrders(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      const result = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(result?.message ?? "Failed to update order");
      }

      setMessage(`Order ${orderId} updated to ${status}.`);
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  const filteredOrders = useMemo(
    () => orders.filter((order) => statusFilter === "all" || order.status === statusFilter),
    [orders, statusFilter],
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Order Management</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Real-time Supabase order data with status filters and per-order actions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" disabled>
            Export CSV
          </Button>
          <Button variant="secondary" disabled>
            Export PDF
          </Button>
        </div>
      </section>

      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            variant={statusFilter === tab.value ? "primary" : "secondary"}
            size="sm"
            onClick={() => setStatusFilter(tab.value)}
            disabled={saving}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <Card className="overflow-auto">
        {loading ? <p className="text-sm text-[var(--color-text-muted)]">Loading orders...</p> : null}
        {!loading && filteredOrders.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">No orders found.</p>
        ) : null}

        {!loading && filteredOrders.length > 0 ? (
          <table className="w-full min-w-[780px] text-left text-sm">
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
                  <tr className="border-b border-[var(--color-border)]">
                    <td className="py-3 font-medium">{order.number}</td>
                    <td className="py-3 text-[var(--color-text-muted)]">
                      <p>{order.customerName}</p>
                      <p className="text-xs">{order.customerEmail}</p>
                    </td>
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
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]">
                      <td colSpan={6} className="p-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm text-[var(--color-text-muted)]">
                            {order.itemsCount} items - Last update {formatDate(order.updatedAt)}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => void updateOrderStatus(order.id, "paid")}
                              disabled={saving}
                            >
                              Mark Paid
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => void updateOrderStatus(order.id, "shipped")}
                              disabled={saving}
                            >
                              Mark Shipped
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => void updateOrderStatus(order.id, "delivered")}
                              disabled={saving}
                            >
                              Mark Delivered
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => void updateOrderStatus(order.id, "canceled")}
                              disabled={saving}
                            >
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
        ) : null}
      </Card>
    </div>
  );
}
