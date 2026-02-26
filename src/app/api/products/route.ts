import { NextResponse } from "next/server";
import { getCatalogProducts } from "@/lib/catalog-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim().toLowerCase() || "";
  const category = searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || "newest";
  const minRating = Number(searchParams.get("minRating") || "0");
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = Math.max(1, Number(searchParams.get("limit") || "8"));

  const result = await getCatalogProducts({
    query,
    category,
    sort,
    minRating,
    page,
    limit,
  });

  return NextResponse.json({
    items: result.items,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
  });
}
