"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { items, totals, updateQuantity, removeItem } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [shippingMessage, setShippingMessage] = useState("");

  const promoHint = useMemo(() => {
    if (!promoCode) return "";
    return promoCode.toLowerCase() === "prime10"
      ? "Promo applied: 10% preview discount at checkout."
      : "Invalid promo code. Try PRIME10.";
  }, [promoCode]);

  const estimateShipping = () => {
    if (!zipCode.trim()) {
      setShippingMessage("Enter a zip code to estimate shipping.");
      return;
    }
    setShippingMessage(`Estimated standard shipping to ${zipCode}: 2-4 business days.`);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
      <section>
        <h1 className="text-3xl font-semibold">Shopping Cart</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Update quantities, test promo codes, and review your checkout totals.
        </p>
      </section>

      {items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Add products from the shop to begin checkout."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={`${item.productId}-${item.size}-${item.color}`} className="flex flex-col gap-4 sm:flex-row">
                <Image
                  src={item.image}
                  alt={item.productName}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <Link href={`/products/${item.slug}`} className="font-semibold hover:underline">
                    {item.productName}
                  </Link>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {item.size ? `Size ${item.size}` : "One Size"} {item.color ? `• ${item.color}` : ""}
                  </p>
                  <p className="mt-2 text-sm font-semibold">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                    -
                  </Button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <Button variant="secondary" size="sm" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                    +
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => removeItem(item.productId)}>
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Card className="h-fit space-y-4">
            <div>
              <label htmlFor="promo" className="mb-1 block text-sm font-medium">
                Promo code
              </label>
              <Input
                id="promo"
                value={promoCode}
                onChange={(event) => setPromoCode(event.target.value)}
                placeholder="PRIME10"
              />
              {promoHint ? <p className="mt-1 text-xs text-[var(--color-text-muted)]">{promoHint}</p> : null}
            </div>

            <div>
              <label htmlFor="zip" className="mb-1 block text-sm font-medium">
                Shipping estimator
              </label>
              <div className="flex gap-2">
                <Input
                  id="zip"
                  value={zipCode}
                  onChange={(event) => setZipCode(event.target.value)}
                  placeholder="Zip code"
                />
                <Button variant="secondary" onClick={estimateShipping}>
                  Estimate
                </Button>
              </div>
              {shippingMessage ? <p className="mt-1 text-xs text-[var(--color-text-muted)]">{shippingMessage}</p> : null}
            </div>

            <div className="space-y-2 border-t border-[var(--color-border)] pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Product total</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Shipping</span>
                <span>{formatCurrency(totals.shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Tax</span>
                <span>{formatCurrency(totals.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Discount</span>
                <span>-{formatCurrency(totals.discount)}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--color-border)] pt-2 text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </div>

            <Link href="/checkout" className="block">
              <Button className="w-full">Checkout Now</Button>
            </Link>
          </Card>
        </div>
      )}
    </div>
  );
}
