export type Role = "admin" | "seller" | "staff" | "cs" | "customer";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface ProductVariant {
  id: string;
  label: string;
  value: string;
  stock: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  createdAt: string;
  comment: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  isFeatured: boolean;
  isTrending: boolean;
  tags: string[];
  images: string[];
  variants: {
    size: ProductVariant[];
    color: ProductVariant[];
  };
  createdAt: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface CartTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "canceled";

export interface OrderTimelineStep {
  status: OrderStatus;
  label: string;
  at: string;
  done: boolean;
}

export interface Order {
  id: string;
  number: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  timeline: OrderTimelineStep[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  address: string;
  joinedAt: string;
}

export interface SalesPoint {
  label: string;
  value: number;
}

export interface CategoryBreakdown {
  category: string;
  percent: number;
}
