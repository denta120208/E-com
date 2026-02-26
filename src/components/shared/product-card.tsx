"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RatingStars } from "@/components/shared/rating-stars";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80";

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const primaryImage = product.images[0] || FALLBACK_IMAGE;
  const [imageFallbackEnabled, setImageFallbackEnabled] = useState(false);

  return (
    <Card className="group relative overflow-hidden p-0">
      <button
        type="button"
        onClick={() => setWishlisted((current) => !current)}
        className="absolute top-3 right-3 z-10 rounded-full bg-white/90 p-2 text-sm shadow transition hover:scale-105"
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        {wishlisted ? "♥" : "♡"}
      </button>

      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative h-60 overflow-hidden bg-[var(--color-surface-alt)]">
          <Image
            src={imageFallbackEnabled ? FALLBACK_IMAGE : primaryImage}
            alt={product.name}
            width={700}
            height={700}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={() => setImageFallbackEnabled(true)}
          />
          <div className="pointer-events-none absolute inset-x-3 bottom-3 translate-y-6 rounded-xl bg-black/70 px-3 py-2 text-xs text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
            Quick view available on product page
          </div>
        </div>
      </Link>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-[var(--color-text-muted)]">{product.category}</p>
          {product.originalPrice ? <Badge tone="warning">Sale</Badge> : null}
        </div>

        <div>
          <Link href={`/products/${product.slug}`} className="text-base font-semibold hover:underline">
            {product.name}
          </Link>
          <RatingStars rating={product.rating} className="mt-1 text-sm" />
        </div>

        <div className="flex items-center gap-2">
          <p className="text-lg font-semibold">{formatCurrency(product.price)}</p>
          {product.originalPrice ? (
            <p className="text-sm text-[var(--color-text-muted)] line-through">
              {formatCurrency(product.originalPrice)}
            </p>
          ) : null}
        </div>

        <Button
          className="w-full"
          onClick={() =>
            addItem({
              product,
              quantity: 1,
              size: product.variants.size[0]?.value,
              color: product.variants.color[0]?.value,
            })
          }
        >
          Add to Cart
        </Button>
      </div>
    </Card>
  );
}
