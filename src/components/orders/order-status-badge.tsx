import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/types";
import { toTitleCase } from "@/lib/utils";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  if (status === "delivered") {
    return <Badge tone="success">{toTitleCase(status)}</Badge>;
  }
  if (status === "canceled") {
    return <Badge tone="danger">{toTitleCase(status)}</Badge>;
  }
  if (status === "pending") {
    return <Badge tone="warning">{toTitleCase(status)}</Badge>;
  }
  return <Badge>{toTitleCase(status)}</Badge>;
}
