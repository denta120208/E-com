"use client";

import { useState } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { Product } from "@/lib/types";

interface ProductDetailActionsProps {
  product: Product;
}

export function ProductDetailActions({ product }: ProductDetailActionsProps) {
  const [size, setSize] = useState(product.variants.size[0]?.value ?? "");
  const [color, setColor] = useState(product.variants.color[0]?.value ?? "");
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const { addItem } = useCart();

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="size" className="mb-1 block text-sm font-medium">
            Size
          </label>
          <Select id="size" value={size} onChange={(event) => setSize(event.target.value)}>
            {product.variants.size.map((variant) => (
              <option key={variant.id} value={variant.value}>
                {variant.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="color" className="mb-1 block text-sm font-medium">
            Color
          </label>
          <Select id="color" value={color} onChange={(event) => setColor(event.target.value)}>
            {product.variants.color.map((variant) => (
              <option key={variant.id} value={variant.value}>
                {variant.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <label htmlFor="quantity" className="mb-1 block text-sm font-medium">
          Quantity
        </label>
        <Select
          id="quantity"
          value={String(quantity)}
          onChange={(event) => setQuantity(Number(event.target.value))}
          className="max-w-[180px]"
        >
          {[1, 2, 3, 4, 5].map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => addItem({ product, quantity, size, color })}>Add to Cart</Button>
        <Button variant="secondary" onClick={() => setWishlisted((current) => !current)}>
          {wishlisted ? "Wishlisted" : "Add to Wishlist"}
        </Button>
      </div>
    </div>
  );
}
