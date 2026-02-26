"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/components/providers/cart-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import type { SessionUser } from "@/lib/auth";

export function AppProviders({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: SessionUser | null;
}) {
  return (
    <SessionProvider initialUser={initialUser}>
      <CartProvider>{children}</CartProvider>
    </SessionProvider>
  );
}
