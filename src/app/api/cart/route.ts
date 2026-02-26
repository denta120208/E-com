import { NextResponse } from "next/server";
import { calculateCartTotals } from "@/lib/mock-data";
import type { CartItem } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as { items?: CartItem[] };
  const items = body.items ?? [];

  const valid = items.every(
    (item) =>
      typeof item.productId === "string" &&
      typeof item.productName === "string" &&
      typeof item.price === "number" &&
      typeof item.quantity === "number",
  );

  if (!valid) {
    return NextResponse.json(
      { message: "Invalid cart payload" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    items,
    totals: calculateCartTotals(items),
  });
}
