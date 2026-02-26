import { NextResponse } from "next/server";
import type { CartItem } from "@/lib/types";

interface CheckoutPayload {
  customer?: {
    fullName?: string;
    email?: string;
    address?: string;
    city?: string;
    zipCode?: string;
  };
  items?: CartItem[];
}

export async function POST(request: Request) {
  const body = (await request.json()) as CheckoutPayload;
  const customer = body.customer;
  const items = body.items ?? [];

  if (!customer?.fullName || !customer.email?.includes("@")) {
    return NextResponse.json(
      { message: "Missing customer information" },
      { status: 400 },
    );
  }
  if (!customer.address || !customer.city || !customer.zipCode) {
    return NextResponse.json(
      { message: "Missing shipping address fields" },
      { status: 400 },
    );
  }
  if (items.length === 0) {
    return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
  }

  return NextResponse.json({
    message: "Order placed successfully.",
    orderId: `ord-${Date.now().toString().slice(-6)}`,
  });
}
