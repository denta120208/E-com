"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { calculateCartTotals } from "@/lib/mock-data";
import type { CartItem, CartTotals, Product } from "@/lib/types";

const CART_STORAGE_KEY = "ecom-cart";

interface AddToCartInput {
  product: Product;
  quantity?: number;
  size?: string;
  color?: string;
}

interface CartContextValue {
  items: CartItem[];
  totals: CartTotals;
  count: number;
  addItem: (input: AddToCartInput) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as CartItem[];
      }
    } catch {
      return [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback(({ product, quantity = 1, size, color }: AddToCartInput) => {
    setItems((previousItems) => {
      const existingIndex = previousItems.findIndex(
        (item) => item.productId === product.id && item.size === size && item.color === color,
      );

      if (existingIndex >= 0) {
        const next = [...previousItems];
        const existing = next[existingIndex];
        next[existingIndex] = {
          ...existing,
          quantity: existing.quantity + quantity,
        };
        return next;
      }

      return [
        ...previousItems,
        {
          productId: product.id,
          productName: product.name,
          slug: product.slug,
          price: product.price,
          image: product.images[0],
          quantity,
          size,
          color,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((previousItems) =>
      previousItems
        .map((item) => {
          if (item.productId === productId) {
            return { ...item, quantity: Math.max(0, quantity) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((previousItems) => previousItems.filter((item) => item.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totals = useMemo(() => calculateCartTotals(items), [items]);
  const count = useMemo(
    () => items.reduce((total, currentItem) => total + currentItem.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      totals,
      count,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [addItem, clearCart, count, items, removeItem, totals, updateQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
