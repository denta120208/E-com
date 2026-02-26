"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getMidtransSnapScriptUrl,
  MIDTRANS_LAST_PAYMENT_STORAGE_KEY,
  resolveMidtransClientMode,
} from "@/lib/midtrans-config";

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

interface SavedMidtransPayment {
  orderId: string;
  orderNumber: string;
  token: string;
  redirectUrl?: string;
  selectedItemKeys?: string[];
  createdAt: string;
}

function isSavedMidtransPayment(value: unknown): value is SavedMidtransPayment {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.orderId === "string" &&
    typeof candidate.orderNumber === "string" &&
    typeof candidate.token === "string" &&
    (candidate.selectedItemKeys === undefined ||
      (Array.isArray(candidate.selectedItemKeys) &&
        candidate.selectedItemKeys.every((item) => typeof item === "string"))) &&
    typeof candidate.createdAt === "string"
  );
}

export default function PaymentPendingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { removeItemsByKeys } = useCart();
  const orderId = searchParams.get("orderId");
  const orderNumber = searchParams.get("order_id");
  const statusCode = searchParams.get("status_code");
  const transactionStatus = searchParams.get("transaction_status");

  const [midtransReady, setMidtransReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.snap),
  );
  const [resumeError, setResumeError] = useState("");
  const [resuming, setResuming] = useState(false);
  const [syncingStatus, setSyncingStatus] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
  const isMidtransProduction = resolveMidtransClientMode(
    clientKey,
    process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION,
  );

  const savedPayment = useMemo(() => {
    if (typeof window === "undefined") return null;

    const raw = window.localStorage.getItem(MIDTRANS_LAST_PAYMENT_STORAGE_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!isSavedMidtransPayment(parsed)) return null;

      const matchesOrderId = orderId ? parsed.orderId === orderId : true;
      const matchesOrderNumber = orderNumber ? parsed.orderNumber === orderNumber : true;
      if (!matchesOrderId || !matchesOrderNumber) return null;

      return parsed;
    } catch {
      return null;
    }
  }, [orderId, orderNumber]);

  useEffect(() => {
    if (!clientKey || !savedPayment?.token) return;
    if (window.snap) return;

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
  }, [clientKey, isMidtransProduction, savedPayment?.token]);

  const displayedOrder = orderNumber ?? orderId ?? "unknown";

  const syncStatusWithMidtrans = useCallback(
    async (silent = false) => {
      if (!orderId && !orderNumber) return null;
      if (!silent) {
        setSyncingStatus(true);
      }

      try {
        const response = await fetch("/api/payment-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            orderNumber,
          }),
        });

        const result = (await response.json().catch(() => null)) as
          | { message?: string; mappedStatus?: string }
          | null;

        if (!response.ok) {
          if (!silent) {
            setSyncMessage(result?.message ?? "Failed to check payment status.");
          }
          return null;
        }

        const mappedStatus = result?.mappedStatus ?? null;
        if (!silent) {
          setSyncMessage(result?.message ?? "Payment status checked.");
        }
        return mappedStatus;
      } catch {
        if (!silent) {
          setSyncMessage("Failed to check payment status.");
        }
        return null;
      } finally {
        if (!silent) {
          setSyncingStatus(false);
        }
      }
    },
    [orderId, orderNumber],
  );

  useEffect(() => {
    let isUnmounted = false;

    const checkAndRedirect = async () => {
      const mappedStatus = await syncStatusWithMidtrans(true);
      if (isUnmounted) return;
      if (mappedStatus === "paid") {
        const nextOrderId = orderId ?? savedPayment?.orderId;
        const query = nextOrderId
          ? `?orderId=${encodeURIComponent(nextOrderId)}`
          : orderNumber
            ? `?order_id=${encodeURIComponent(orderNumber)}`
            : "";
        router.replace(`/payment/success${query}`);
      }
    };

    void checkAndRedirect();
    const intervalId = window.setInterval(checkAndRedirect, 10000);
    return () => {
      isUnmounted = true;
      window.clearInterval(intervalId);
    };
  }, [orderId, orderNumber, router, savedPayment?.orderId, syncStatusWithMidtrans]);

  const reopenPayment = () => {
    setResumeError("");
    if (!savedPayment?.token) {
      setResumeError("Payment session not found. Please retry checkout.");
      return;
    }

    if (window.snap && midtransReady) {
      setResuming(true);
      window.snap.pay(savedPayment.token, {
        onSuccess: () => {
          removeItemsByKeys(savedPayment.selectedItemKeys ?? []);
          window.localStorage.removeItem(MIDTRANS_LAST_PAYMENT_STORAGE_KEY);
          router.push(`/payment/success?orderId=${encodeURIComponent(savedPayment.orderId)}`);
        },
        onPending: () => {
          setResuming(false);
        },
        onError: () => {
          router.push(`/payment/error?orderId=${encodeURIComponent(savedPayment.orderId)}`);
        },
        onClose: () => {
          setResuming(false);
          setResumeError("Payment popup closed before completion.");
        },
      });
      return;
    }

    if (savedPayment.redirectUrl) {
      window.location.href = savedPayment.redirectUrl;
      return;
    }

    setResumeError("Could not reopen Midtrans payment page.");
  };

  return (
    <div className="mx-auto max-w-2xl py-16">
      <Card className="text-center">
        <p className="text-4xl">Pending</p>
        <h1 className="mt-3 text-2xl font-semibold">Payment Pending</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          We are waiting for payment confirmation for order <span className="font-semibold">{displayedOrder}</span>.
        </p>
        {transactionStatus ? (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Midtrans status: <span className="font-semibold">{transactionStatus}</span>
            {statusCode ? ` (${statusCode})` : ""}
          </p>
        ) : null}
        {!isMidtransProduction ? (
          <p className="mt-3 text-xs text-[var(--color-text-muted)]">
            Sandbox note: complete QRIS/VA/Mandiri Bill using Midtrans payment page or simulator, not from MAP
            transaction table.
          </p>
        ) : null}
        {savedPayment?.token ? (
          <div className="mt-4">
            <Button onClick={reopenPayment} disabled={resuming}>
              {resuming ? "Opening Payment..." : "Continue Payment"}
            </Button>
          </div>
        ) : null}
        {resumeError ? <p className="mt-2 text-sm text-red-600">{resumeError}</p> : null}
        {syncMessage ? <p className="mt-2 text-sm text-[var(--color-text-muted)]">{syncMessage}</p> : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={() => void syncStatusWithMidtrans()} disabled={syncingStatus}>
            {syncingStatus ? "Checking..." : "Check Payment Status"}
          </Button>
          <Link href="/orders">
            <Button>Track Order</Button>
          </Link>
          <Link href="/shop">
            <Button variant="secondary">Back to Shop</Button>
          </Link>
          {!isMidtransProduction ? (
            <a
              href="https://simulator.sandbox.midtrans.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex"
            >
              <Button variant="secondary">Open Sandbox Simulator</Button>
            </a>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
