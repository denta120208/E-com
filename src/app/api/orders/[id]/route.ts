import { NextResponse } from "next/server";
import { getOrderByIdFromSource } from "@/lib/orders-data";

interface OrderRouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, { params }: OrderRouteProps) {
  const { id } = await params;
  const order = await getOrderByIdFromSource(id);

  if (!order) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    order,
  });
}
