"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface OrderRealtimeListenerProps {
  orderId: string;
}

export function OrderRealtimeListener({ orderId }: OrderRealtimeListenerProps) {
  const router = useRouter();

  useEffect(() => {
    if (!orderId) return;

    let channel: { unsubscribe: () => void } | null = null;

    try {
      const supabase = createSupabaseBrowserClient();
      channel = supabase
        .channel(`order-${orderId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: `id=eq.${orderId}`,
          },
          () => {
            router.refresh();
          },
        )
        .subscribe();
    } catch {
      return;
    }

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [orderId, router]);

  return null;
}
