"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MIDTRANS_LAST_PAYMENT_STORAGE_KEY } from "@/lib/midtrans-config";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "unknown";

  useEffect(() => {
    window.localStorage.removeItem(MIDTRANS_LAST_PAYMENT_STORAGE_KEY);
  }, []);

  return (
    <div className="mx-auto max-w-2xl py-16">
      <Card className="text-center">
        <p className="text-4xl">✅</p>
        <h1 className="mt-3 text-2xl font-semibold">Payment Successful</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Your payment has been confirmed for order <span className="font-semibold">{orderId}</span>.
        </p>
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
