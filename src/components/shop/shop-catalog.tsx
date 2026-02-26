"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/shared/empty-state";
import { ProductCard } from "@/components/shared/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Category, Product } from "@/lib/types";

interface ApiResponse {
  items: Product[];
  total: number;
  totalPages: number;
  page: number;
}

interface ShopCatalogProps {
  categories: Category[];
}

const PAGE_SIZE = 8;

export function ShopCatalog({ categories }: ShopCatalogProps) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [minRating, setMinRating] = useState("0");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam && categories.some((item) => item.slug === categoryParam)) {
      setCategory(categoryParam);
    }
  }, [categories, searchParams]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 350);
    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const abort = new AbortController();
    async function loadProducts() {
      setLoading(true);
      setError(null);
      try {
        const url = new URL("/api/products", window.location.origin);
        url.searchParams.set("query", debouncedQuery);
        url.searchParams.set("category", category);
        url.searchParams.set("sort", sort);
        url.searchParams.set("minRating", minRating);
        url.searchParams.set("page", String(page));
        url.searchParams.set("limit", String(PAGE_SIZE));

        const response = await fetch(url.toString(), { signal: abort.signal });
        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }
        const nextData = (await response.json()) as ApiResponse;
        setData(nextData);
      } catch (fetchError) {
        if (!abort.signal.aborted) {
          setError(fetchError instanceof Error ? fetchError.message : "Unknown error");
        }
      } finally {
        if (!abort.signal.aborted) {
          setLoading(false);
        }
      }
    }
    loadProducts();
    return () => abort.abort();
  }, [category, debouncedQuery, minRating, page, refreshToken, sort]);

  const canMovePrev = useMemo(() => (data?.page ?? 1) > 1, [data?.page]);
  const canMoveNext = useMemo(
    () => (data?.page ?? 1) < (data?.totalPages ?? 1),
    [data?.page, data?.totalPages],
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
          />
          <Select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </Select>
          <Select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            aria-label="Sort products"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Top Rated</option>
          </Select>
          <Select
            value={minRating}
            onChange={(event) => {
              setMinRating(event.target.value);
              setPage(1);
            }}
            aria-label="Minimum rating"
          >
            <option value="0">Any Rating</option>
            <option value="3">3.0+ Stars</option>
            <option value="4">4.0+ Stars</option>
            <option value="4.5">4.5+ Stars</option>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <div
              key={index}
              className="h-80 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
            />
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-5">
          <h3 className="text-base font-semibold text-red-700">Unable to load products</h3>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <Button className="mt-3" variant="secondary" onClick={() => setRefreshToken((x) => x + 1)}>
            Retry
          </Button>
        </div>
      ) : null}

      {!loading && !error && (data?.items.length ?? 0) === 0 ? (
        <EmptyState title="No products match this filter" description="Try a different keyword or category." />
      ) : null}

      {!loading && !error && data?.items ? (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {data.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              Showing {(data.page - 1) * PAGE_SIZE + 1}-{Math.min(data.page * PAGE_SIZE, data.total)} of{" "}
              {data.total}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="secondary" disabled={!canMovePrev} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <p className="text-sm text-[var(--color-text-muted)]">
                Page {data.page} / {data.totalPages}
              </p>
              <Button variant="secondary" disabled={!canMoveNext} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </>
      ) : null}

      <div className="text-sm text-[var(--color-text-muted)]">
        Need a custom bundle? <Link href="/profile" className="font-semibold text-[var(--color-brand)]">Contact account support</Link>.
      </div>
    </div>
  );
}
