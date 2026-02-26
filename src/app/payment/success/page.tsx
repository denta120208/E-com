"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MIDTRANS_LAST_PAYMENT_STORAGE_KEY } from "@/lib/midtrans-config";

interface SavedMidtransPayment {
  selectedItemKeys?: string[];
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const { removeItemsByKeys } = useCart();
  const orderId = searchParams.get("orderId");
  const orderNumber = searchParams.get("order_id");
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    const raw = window.localStorage.getItem(MIDTRANS_LAST_PAYMENT_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SavedMidtransPayment;
        if (Array.isArray(parsed.selectedItemKeys)) {
          removeItemsByKeys(parsed.selectedItemKeys.filter((item) => typeof item === "string"));
        }
      } catch {
        // Ignore malformed localStorage payload.
      }
    }
    window.localStorage.removeItem(MIDTRANS_LAST_PAYMENT_STORAGE_KEY);
  }, [removeItemsByKeys]);

  useEffect(() => {
    const syncStatus = async () => {
      if (!orderId && !orderNumber) return;

      try {
        const response = await fetch("/api/payment-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            orderNumber,
          }),
        });

        const result = (await response.json().catch(() => null)) as { message?: string } | null;
        if (!response.ok) {
          setSyncMessage(result?.message ?? "Could not sync payment status.");
          return;
        }

        setSyncMessage("Order status synced with Midtrans.");
      } catch {
        setSyncMessage("Could not sync payment status.");
      }
    };

    void syncStatus();
  }, [orderId, orderNumber]);

  const displayedOrder = orderId ?? orderNumber ?? "unknown";

  return (
    <div className="mx-auto max-w-2xl py-16">
      <Card className="text-center">
        <p className="text-4xl">&#9989;</p>
        <h1 className="mt-3 text-2xl font-semibold">Payment Successful</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Your payment has been confirmed for order <span className="font-semibold">{displayedOrder}</span>.
        </p>
        {syncMessage ? <p className="mt-1 text-xs text-[var(--color-text-muted)]">{syncMessage}</p> : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/orders">
            <Button>View Orders</Button>
          </Link>
          <Link href="/shop">
            <Button variant="secondary">Continue Shopping</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
