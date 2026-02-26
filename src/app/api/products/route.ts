import { NextResponse } from "next/server";
import { products } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim().toLowerCase() || "";
  const category = searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || "newest";
  const minRating = Number(searchParams.get("minRating") || "0");
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = Math.max(1, Number(searchParams.get("limit") || "8"));

  let filtered = products.filter((product) => {
    const matchQuery =
      query.length === 0 ||
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query);
    const matchCategory = category === "all" || product.category === category;
    const matchRating = product.rating >= minRating;
    return matchQuery && matchCategory && matchRating;
  });

  if (sort === "price-asc") {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  } else if (sort === "rating-desc") {
    filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  } else {
    filtered = [...filtered].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));

  return NextResponse.json({
    items: paged,
    total: filtered.length,
    page,
    totalPages,
  });
}
