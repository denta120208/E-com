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
const CART_SELECTION_STORAGE_KEY = "ecom-cart-selected";

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
  selectedItems: CartItem[];
  selectedItemKeys: string[];
  selectedTotals: CartTotals;
  selectedCount: number;
  addItem: (input: AddToCartInput) => void;
  updateQuantity: (itemKey: string, quantity: number) => void;
  removeItem: (itemKey: string) => void;
  removeItemsByKeys: (itemKeys: string[]) => void;
  clearCart: () => void;
  isItemSelected: (itemKey: string) => boolean;
  toggleItemSelection: (itemKey: string) => void;
  setAllSelected: (selected: boolean) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function getCartItemKey(item: Pick<CartItem, "productId" | "size" | "color">) {
  return `${item.productId}::${item.size ?? ""}::${item.color ?? ""}`;
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.productId === "string" &&
    typeof candidate.productName === "string" &&
    typeof candidate.slug === "string" &&
    typeof candidate.price === "number" &&
    typeof candidate.image === "string" &&
    typeof candidate.quantity === "number"
  );
}

function parseStoredItems(raw: string | null) {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartItem);
  } catch {
    return [];
  }
}

function parseStoredSelectedKeys(raw: string | null) {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return null;
  }
}

function getInitialItems() {
  if (typeof window === "undefined") return [];
  return parseStoredItems(window.localStorage.getItem(CART_STORAGE_KEY));
}

function getInitialSelectedItemKeys(items: CartItem[]) {
  if (typeof window === "undefined") return [];

  const itemKeySet = new Set(items.map(getCartItemKey));
  const storedSelection = parseStoredSelectedKeys(window.localStorage.getItem(CART_SELECTION_STORAGE_KEY));
  const nextSelectedKeys = (storedSelection ?? Array.from(itemKeySet)).filter((itemKey) =>
    itemKeySet.has(itemKey),
  );
  return Array.from(new Set(nextSelectedKeys));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(getInitialItems);
  const [selectedItemKeys, setSelectedItemKeys] = useState<string[]>(() =>
    getInitialSelectedItemKeys(getInitialItems()),
  );

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    window.localStorage.setItem(CART_SELECTION_STORAGE_KEY, JSON.stringify(selectedItemKeys));
  }, [selectedItemKeys]);

  const addItem = useCallback(({ product, quantity = 1, size, color }: AddToCartInput) => {
    const nextItemKey = getCartItemKey({ productId: product.id, size, color });

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

    setSelectedItemKeys((previous) =>
      previous.includes(nextItemKey) ? previous : [...previous, nextItemKey],
    );
  }, []);

  const updateQuantity = useCallback((itemKey: string, quantity: number) => {
    setItems((previousItems) =>
      previousItems
        .map((item) => {
          if (getCartItemKey(item) === itemKey) {
            return { ...item, quantity: Math.max(0, quantity) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    );

    if (quantity <= 0) {
      setSelectedItemKeys((previous) => previous.filter((key) => key !== itemKey));
    }
  }, []);

  const removeItem = useCallback((itemKey: string) => {
    setItems((previousItems) => previousItems.filter((item) => getCartItemKey(item) !== itemKey));
    setSelectedItemKeys((previous) => previous.filter((key) => key !== itemKey));
  }, []);

  const removeItemsByKeys = useCallback((itemKeys: string[]) => {
    if (itemKeys.length === 0) return;

    const toRemove = new Set(itemKeys);
    setItems((previousItems) => previousItems.filter((item) => !toRemove.has(getCartItemKey(item))));
    setSelectedItemKeys((previous) => previous.filter((key) => !toRemove.has(key)));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setSelectedItemKeys([]);
  }, []);

  const isItemSelected = useCallback(
    (itemKey: string) => selectedItemKeys.includes(itemKey),
    [selectedItemKeys],
  );

  const toggleItemSelection = useCallback((itemKey: string) => {
    setSelectedItemKeys((previous) =>
      previous.includes(itemKey)
        ? previous.filter((key) => key !== itemKey)
        : [...previous, itemKey],
    );
  }, []);

  const setAllSelected = useCallback(
    (selected: boolean) => {
      if (!selected) {
        setSelectedItemKeys([]);
        return;
      }

      setSelectedItemKeys(items.map(getCartItemKey));
    },
    [items],
  );

  const totals = useMemo(() => calculateCartTotals(items), [items]);
  const count = useMemo(
    () => items.reduce((total, currentItem) => total + currentItem.quantity, 0),
    [items],
  );

  const selectedItems = useMemo(() => {
    const selectedSet = new Set(selectedItemKeys);
    return items.filter((item) => selectedSet.has(getCartItemKey(item)));
  }, [items, selectedItemKeys]);

  const selectedTotals = useMemo(() => calculateCartTotals(selectedItems), [selectedItems]);
  const selectedCount = useMemo(
    () => selectedItems.reduce((total, currentItem) => total + currentItem.quantity, 0),
    [selectedItems],
  );

  const value = useMemo(
    () => ({
      items,
      totals,
      count,
      selectedItems,
      selectedItemKeys,
      selectedTotals,
      selectedCount,
      addItem,
      updateQuantity,
      removeItem,
      removeItemsByKeys,
      clearCart,
      isItemSelected,
      toggleItemSelection,
      setAllSelected,
    }),
    [
      addItem,
      clearCart,
      count,
      isItemSelected,
      items,
      removeItem,
      removeItemsByKeys,
      selectedCount,
      selectedItemKeys,
      selectedItems,
      selectedTotals,
      setAllSelected,
      toggleItemSelection,
      totals,
      updateQuantity,
    ],
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
