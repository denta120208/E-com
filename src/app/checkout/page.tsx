"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { useCart } from "@/components/providers/cart-provider";
import { useSession } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getMidtransSnapScriptUrl,
  MIDTRANS_LAST_PAYMENT_STORAGE_KEY,
  resolveMidtransClientMode,
} from "@/lib/midtrans-config";
import { formatCurrency } from "@/lib/utils";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        callbacks: {
          onSuccess?: () => void;
          onPending?: () => void;
          onError?: () => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

interface CheckoutForm {
  fullName: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
}

const initialForm: CheckoutForm = {
  fullName: "",
  email: "",
  address: "",
  city: "",
  zipCode: "",
};

export default function CheckoutPage() {
  const { items, totals, clearCart } = useCart();
  const { user } = useSession();
  const router = useRouter();
  const [form, setForm] = useState<CheckoutForm>(() => ({
    ...initialForm,
    fullName: user?.name ?? "",
    email: user?.email ?? "",
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [midtransReady, setMidtransReady] = useState(false);

  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
  const isMidtransProduction = resolveMidtransClientMode(
    clientKey,
    process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION,
  );

  const isEmpty = useMemo(() => items.length === 0, [items.length]);

  useEffect(() => {
    if (!clientKey) return;
    if (window.snap) {
      setMidtransReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = getMidtransSnapScriptUrl(isMidtransProduction);
    script.setAttribute("data-client-key", clientKey);
    script.async = true;
    script.onload = () => setMidtransReady(true);
    script.onerror = () => setMidtransReady(false);
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [clientKey, isMidtransProduction]);

  const validate = () => {
    const nextErrors: Partial<Record<keyof CheckoutForm, string>> = {};
    if (!form.fullName.trim()) nextErrors.fullName = "Full name is required";
    if (!form.email.includes("@")) nextErrors.email = "Valid email is required";
    if (!form.address.trim()) nextErrors.address = "Address is required";
    if (!form.city.trim()) nextErrors.city = "City is required";
    if (!form.zipCode.trim()) nextErrors.zipCode = "Zip code is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitCheckout = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: form, items }),
      });
      const result = (await response.json()) as {
        orderId?: string;
        orderNumber?: string;
        message?: string;
        isMock?: boolean;
        payment?: { token?: string; redirectUrl?: string };
      };

      if (!response.ok || !result.orderId || !result.payment) {
        throw new Error(result.message || "Checkout failed");
      }

      if (!result.isMock && result.payment.token) {
        window.localStorage.setItem(
          MIDTRANS_LAST_PAYMENT_STORAGE_KEY,
          JSON.stringify({
            orderId: result.orderId,
            orderNumber: result.orderNumber ?? "",
            token: result.payment.token,
            redirectUrl: result.payment.redirectUrl ?? "",
            createdAt: new Date().toISOString(),
          }),
        );
      }

      if (!result.isMock && midtransReady && result.payment.token && window.snap) {
        window.snap.pay(result.payment.token, {
          onSuccess: () => {
            window.localStorage.removeItem(MIDTRANS_LAST_PAYMENT_STORAGE_KEY);
            clearCart();
            router.push(`/payment/success?orderId=${result.orderId}`);
          },
          onPending: () => {
            clearCart();
            router.push(`/payment/pending?orderId=${result.orderId}`);
          },
          onError: () => {
            router.push(`/payment/error?orderId=${result.orderId}`);
          },
          onClose: () => {
            setSubmitError("Payment popup closed before completion.");
          },
        });
        return;
      }

      if (result.payment.redirectUrl) {
        if (result.payment.redirectUrl.startsWith("http")) {
          window.location.href = result.payment.redirectUrl;
        } else {
          clearCart();
          router.push(result.payment.redirectUrl);
        }
      } else {
        clearCart();
        router.push(`/payment/pending?orderId=${result.orderId}`);
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Cart", href: "/cart" },
          { label: "Checkout" },
        ]}
      />
      <section>
        <h1 className="text-3xl font-semibold">Checkout</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Complete shipping details and place your order securely.
        </p>
      </section>

      {isEmpty ? (
        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">
            Your cart is empty. Add items from the shop before checkout.
          </p>
          <Link href="/shop" className="mt-4 inline-block">
            <Button>Go to Shop</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card className="space-y-4">
            <h2 className="text-xl font-semibold">Shipping Information</h2>

            <div>
              <label htmlFor="fullName" className="mb-1 block text-sm font-medium">
                Full Name
              </label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              />
              {errors.fullName ? <p className="mt-1 text-xs text-red-600">{errors.fullName}</p> : null}
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              />
              {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
            </div>

            <div>
              <label htmlFor="address" className="mb-1 block text-sm font-medium">
                Address
              </label>
              <Input
                id="address"
                value={form.address}
                onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
              />
              {errors.address ? <p className="mt-1 text-xs text-red-600">{errors.address}</p> : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="city" className="mb-1 block text-sm font-medium">
                  City
                </label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                />
                {errors.city ? <p className="mt-1 text-xs text-red-600">{errors.city}</p> : null}
              </div>

              <div>
                <label htmlFor="zipCode" className="mb-1 block text-sm font-medium">
                  Zip Code
                </label>
                <Input
                  id="zipCode"
                  value={form.zipCode}
                  onChange={(event) => setForm((prev) => ({ ...prev, zipCode: event.target.value }))}
                />
                {errors.zipCode ? <p className="mt-1 text-xs text-red-600">{errors.zipCode}</p> : null}
              </div>
            </div>
          </Card>

          <Card className="h-fit space-y-3">
            <h2 className="text-xl font-semibold">Order Summary</h2>
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="flex justify-between text-sm">
                <span className="text-[var(--color-text-muted)]">
                  {item.productName} x {item.quantity}
                </span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="space-y-2 border-t border-[var(--color-border)] pt-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Subtotal</span>
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
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </div>

            {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
            {clientKey ? (
              <p className="text-xs text-[var(--color-text-muted)]">
                Midtrans client configured: {midtransReady ? "ready" : "loading script..."}
              </p>
            ) : (
              <p className="text-xs text-[var(--color-text-muted)]">
                Running in mock payment mode. Add Midtrans env keys for live sandbox checkout.
              </p>
            )}
            <Button onClick={submitCheckout} disabled={submitting} className="w-full">
              {submitting ? "Processing..." : "Place Order"}
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
