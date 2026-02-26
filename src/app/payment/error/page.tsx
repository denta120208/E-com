"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PaymentErrorPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "unknown";

  return (
    <div className="mx-auto max-w-2xl py-16">
      <Card className="text-center">
        <p className="text-4xl">⚠️</p>
        <h1 className="mt-3 text-2xl font-semibold">Payment Failed</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Payment could not be completed for order <span className="font-semibold">{orderId}</span>.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/checkout">
            <Button>Retry Checkout</Button>
          </Link>
          <Link href="/cart">
            <Button variant="secondary">Back to Cart</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
