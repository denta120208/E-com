import type {
  CartItem,
  CartTotals,
  Category,
  CategoryBreakdown,
  Order,
  Product,
  SalesPoint,
  UserProfile,
} from "@/lib/types";

export const categories: Category[] = [
  { id: "cat-1", name: "Sneakers", slug: "sneakers", icon: "👟" },
  { id: "cat-2", name: "Outerwear", slug: "outerwear", icon: "🧥" },
  { id: "cat-3", name: "Accessories", slug: "accessories", icon: "🧢" },
  { id: "cat-4", name: "Tech", slug: "tech", icon: "🎧" },
  { id: "cat-5", name: "Home", slug: "home", icon: "🪑" },
  { id: "cat-6", name: "Fitness", slug: "fitness", icon: "🏋️" },
];

export const products: Product[] = [
  {
    id: "prd-1",
    slug: "nova-runner-v2",
    name: "Nova Runner V2",
    description: "Lightweight city runner with adaptive foam and breathable knit mesh.",
    category: "sneakers",
    price: 129,
    originalPrice: 159,
    rating: 4.8,
    reviewCount: 132,
    stock: 24,
    isFeatured: true,
    isTrending: true,
    tags: ["new", "running"],
    images: ["https://picsum.photos/seed/nova-runner/1000/1000"],
    variants: {
      size: [
        { id: "s1", label: "US 7", value: "7", stock: 5 },
        { id: "s2", label: "US 8", value: "8", stock: 7 },
        { id: "s3", label: "US 9", value: "9", stock: 8 },
      ],
      color: [
        { id: "c1", label: "Cloud White", value: "cloud-white", stock: 12 },
        { id: "c2", label: "Onyx Black", value: "onyx-black", stock: 12 },
      ],
    },
    createdAt: "2026-01-10",
  },
  {
    id: "prd-2",
    slug: "summit-shell-jacket",
    name: "Summit Shell Jacket",
    description: "Waterproof outer shell with thermal lining and hidden storm hood.",
    category: "outerwear",
    price: 189,
    originalPrice: 219,
    rating: 4.6,
    reviewCount: 89,
    stock: 14,
    isFeatured: true,
    isTrending: false,
    tags: ["winter", "best seller"],
    images: ["https://picsum.photos/seed/summit-shell/1000/1000"],
    variants: {
      size: [
        { id: "s1", label: "S", value: "s", stock: 4 },
        { id: "s2", label: "M", value: "m", stock: 6 },
        { id: "s3", label: "L", value: "l", stock: 4 },
      ],
      color: [
        { id: "c1", label: "Slate", value: "slate", stock: 8 },
        { id: "c2", label: "Sand", value: "sand", stock: 6 },
      ],
    },
    createdAt: "2025-11-03",
  },
  {
    id: "prd-3",
    slug: "arc-wireless-pro",
    name: "Arc Wireless Pro",
    description: "Noise-cancelling headphones with 40-hour battery and low-latency mode.",
    category: "tech",
    price: 239,
    originalPrice: 279,
    rating: 4.9,
    reviewCount: 210,
    stock: 31,
    isFeatured: true,
    isTrending: true,
    tags: ["audio", "premium"],
    images: ["https://picsum.photos/seed/arc-wireless/1000/1000"],
    variants: {
      size: [{ id: "s1", label: "One Size", value: "one-size", stock: 31 }],
      color: [
        { id: "c1", label: "Midnight", value: "midnight", stock: 16 },
        { id: "c2", label: "Silver", value: "silver", stock: 15 },
      ],
    },
    createdAt: "2026-02-05",
  },
  {
    id: "prd-4",
    slug: "atlas-weekender-bag",
    name: "Atlas Weekender Bag",
    description: "Structured canvas duffel with separate shoe compartment.",
    category: "accessories",
    price: 98,
    rating: 4.5,
    reviewCount: 56,
    stock: 40,
    isFeatured: false,
    isTrending: true,
    tags: ["travel"],
    images: ["https://picsum.photos/seed/atlas-bag/1000/1000"],
    variants: {
      size: [{ id: "s1", label: "35L", value: "35l", stock: 40 }],
      color: [
        { id: "c1", label: "Navy", value: "navy", stock: 20 },
        { id: "c2", label: "Olive", value: "olive", stock: 20 },
      ],
    },
    createdAt: "2025-10-20",
  },
  {
    id: "prd-5",
    slug: "airloom-lounge-chair",
    name: "Airloom Lounge Chair",
    description: "Soft-touch accent chair with oak legs and ergonomic curvature.",
    category: "home",
    price: 349,
    originalPrice: 399,
    rating: 4.4,
    reviewCount: 72,
    stock: 9,
    isFeatured: false,
    isTrending: false,
    tags: ["home"],
    images: ["https://picsum.photos/seed/airloom-chair/1000/1000"],
    variants: {
      size: [{ id: "s1", label: "Standard", value: "std", stock: 9 }],
      color: [
        { id: "c1", label: "Stone", value: "stone", stock: 4 },
        { id: "c2", label: "Charcoal", value: "charcoal", stock: 5 },
      ],
    },
    createdAt: "2025-08-18",
  },
  {
    id: "prd-6",
    slug: "coreflex-training-kit",
    name: "CoreFlex Training Kit",
    description: "Resistance bands, grip handles, and travel pouch for home workouts.",
    category: "fitness",
    price: 59,
    rating: 4.3,
    reviewCount: 164,
    stock: 76,
    isFeatured: true,
    isTrending: true,
    tags: ["fitness", "bundle"],
    images: ["https://picsum.photos/seed/coreflex/1000/1000"],
    variants: {
      size: [{ id: "s1", label: "6-piece set", value: "set-6", stock: 76 }],
      color: [{ id: "c1", label: "Mixed", value: "mixed", stock: 76 }],
    },
    createdAt: "2026-01-22",
  },
  {
    id: "prd-7",
    slug: "orbit-knit-hoodie",
    name: "Orbit Knit Hoodie",
    description: "Heavyweight cotton fleece with dropped shoulder fit.",
    category: "outerwear",
    price: 89,
    originalPrice: 109,
    rating: 4.7,
    reviewCount: 145,
    stock: 50,
    isFeatured: false,
    isTrending: false,
    tags: ["casual"],
    images: ["https://picsum.photos/seed/orbit-hoodie/1000/1000"],
    variants: {
      size: [
        { id: "s1", label: "S", value: "s", stock: 12 },
        { id: "s2", label: "M", value: "m", stock: 16 },
        { id: "s3", label: "L", value: "l", stock: 12 },
        { id: "s4", label: "XL", value: "xl", stock: 10 },
      ],
      color: [
        { id: "c1", label: "Heather Gray", value: "heather-gray", stock: 24 },
        { id: "c2", label: "Cocoa", value: "cocoa", stock: 26 },
      ],
    },
    createdAt: "2025-12-12",
  },
  {
    id: "prd-8",
    slug: "stride-smartwatch",
    name: "Stride Smartwatch",
    description: "Health tracking smartwatch with AMOLED display and GPS.",
    category: "tech",
    price: 199,
    rating: 4.2,
    reviewCount: 48,
    stock: 19,
    isFeatured: false,
    isTrending: true,
    tags: ["wearable", "tech"],
    images: ["https://picsum.photos/seed/stride-watch/1000/1000"],
    variants: {
      size: [{ id: "s1", label: "42mm", value: "42mm", stock: 19 }],
      color: [
        { id: "c1", label: "Black", value: "black", stock: 12 },
        { id: "c2", label: "Sage", value: "sage", stock: 7 },
      ],
    },
    createdAt: "2026-02-12",
  },
  {
    id: "prd-9",
    slug: "terra-trail-sneaker",
    name: "Terra Trail Sneaker",
    description: "All-terrain outsole with weather-resistant upper for outdoor sessions.",
    category: "sneakers",
    price: 149,
    rating: 4.4,
    reviewCount: 77,
    stock: 28,
    isFeatured: true,
    isTrending: false,
    tags: ["outdoor"],
    images: ["https://picsum.photos/seed/terra-trail/1000/1000"],
    variants: {
      size: [
        { id: "s1", label: "US 8", value: "8", stock: 8 },
        { id: "s2", label: "US 9", value: "9", stock: 10 },
        { id: "s3", label: "US 10", value: "10", stock: 10 },
      ],
      color: [
        { id: "c1", label: "Granite", value: "granite", stock: 14 },
        { id: "c2", label: "Moss", value: "moss", stock: 14 },
      ],
    },
    createdAt: "2025-09-06",
  },
  {
    id: "prd-10",
    slug: "loom-table-lamp",
    name: "Loom Table Lamp",
    description: "Minimal ceramic base lamp with warm ambient diffuser.",
    category: "home",
    price: 72,
    rating: 4.6,
    reviewCount: 38,
    stock: 33,
    isFeatured: false,
    isTrending: false,
    tags: ["lighting"],
    images: ["https://picsum.photos/seed/loom-lamp/1000/1000"],
    variants: {
      size: [{ id: "s1", label: "Single", value: "single", stock: 33 }],
      color: [
        { id: "c1", label: "Ivory", value: "ivory", stock: 16 },
        { id: "c2", label: "Clay", value: "clay", stock: 17 },
      ],
    },
    createdAt: "2025-07-30",
  },
  {
    id: "prd-11",
    slug: "vector-cap",
    name: "Vector Cap",
    description: "Structured six-panel cap with reflective front logo.",
    category: "accessories",
    price: 34,
    rating: 4.1,
    reviewCount: 25,
    stock: 64,
    isFeatured: false,
    isTrending: false,
    tags: ["caps"],
    images: ["https://picsum.photos/seed/vector-cap/1000/1000"],
    variants: {
      size: [{ id: "s1", label: "Adjustable", value: "adjustable", stock: 64 }],
      color: [
        { id: "c1", label: "Black", value: "black", stock: 32 },
        { id: "c2", label: "Tan", value: "tan", stock: 32 },
      ],
    },
    createdAt: "2025-10-02",
  },
  {
    id: "prd-12",
    slug: "pulse-mobility-roller",
    name: "Pulse Mobility Roller",
    description: "Dual-density foam roller for warmup, cooldown, and recovery.",
    category: "fitness",
    price: 42,
    rating: 4.5,
    reviewCount: 91,
    stock: 47,
    isFeatured: true,
    isTrending: false,
    tags: ["recovery"],
    images: ["https://picsum.photos/seed/pulse-roller/1000/1000"],
    variants: {
      size: [{ id: "s1", label: "Standard", value: "std", stock: 47 }],
      color: [
        { id: "c1", label: "Graphite", value: "graphite", stock: 24 },
        { id: "c2", label: "Sky", value: "sky", stock: 23 },
      ],
    },
    createdAt: "2025-11-19",
  },
];

export const featuredProducts = products.filter((product) => product.isFeatured);
export const trendingProducts = products.filter((product) => product.isTrending);

export const sampleCart: CartItem[] = [
  {
    productId: "prd-1",
    productName: "Nova Runner V2",
    slug: "nova-runner-v2",
    price: 129,
    image: "https://picsum.photos/seed/nova-runner/1000/1000",
    quantity: 1,
    size: "8",
    color: "cloud-white",
  },
  {
    productId: "prd-3",
    productName: "Arc Wireless Pro",
    slug: "arc-wireless-pro",
    price: 239,
    image: "https://picsum.photos/seed/arc-wireless/1000/1000",
    quantity: 1,
    color: "midnight",
  },
];

export const orders: Order[] = [
  {
    id: "ord-1",
    number: "EC-2026-000281",
    customerName: "Dianne Russell",
    customerEmail: "dianne@example.com",
    status: "shipped",
    total: 398,
    createdAt: "2026-02-20T09:22:00Z",
    updatedAt: "2026-02-23T11:10:00Z",
    items: [
      { productId: "prd-1", name: "Nova Runner V2", price: 129, quantity: 1 },
      { productId: "prd-3", name: "Arc Wireless Pro", price: 239, quantity: 1 },
    ],
    timeline: [
      { status: "pending", label: "Order Placed", at: "2026-02-20 09:22", done: true },
      { status: "paid", label: "Payment Confirmed", at: "2026-02-20 09:30", done: true },
      { status: "shipped", label: "Shipped", at: "2026-02-23 11:10", done: true },
      { status: "delivered", label: "Delivered", at: "-", done: false },
    ],
  },
  {
    id: "ord-2",
    number: "EC-2026-000279",
    customerName: "Jane Cooper",
    customerEmail: "jane@example.com",
    status: "pending",
    total: 89,
    createdAt: "2026-02-21T16:18:00Z",
    updatedAt: "2026-02-21T16:18:00Z",
    items: [{ productId: "prd-7", name: "Orbit Knit Hoodie", price: 89, quantity: 1 }],
    timeline: [
      { status: "pending", label: "Order Placed", at: "2026-02-21 16:18", done: true },
      { status: "paid", label: "Payment Confirmed", at: "-", done: false },
      { status: "shipped", label: "Shipped", at: "-", done: false },
      { status: "delivered", label: "Delivered", at: "-", done: false },
    ],
  },
  {
    id: "ord-3",
    number: "EC-2026-000276",
    customerName: "Wade Warren",
    customerEmail: "wade@example.com",
    status: "delivered",
    total: 191,
    createdAt: "2026-02-15T08:08:00Z",
    updatedAt: "2026-02-18T12:34:00Z",
    items: [
      { productId: "prd-11", name: "Vector Cap", price: 34, quantity: 1 },
      { productId: "prd-6", name: "CoreFlex Training Kit", price: 59, quantity: 1 },
      { productId: "prd-12", name: "Pulse Mobility Roller", price: 42, quantity: 2 },
    ],
    timeline: [
      { status: "pending", label: "Order Placed", at: "2026-02-15 08:08", done: true },
      { status: "paid", label: "Payment Confirmed", at: "2026-02-15 08:15", done: true },
      { status: "shipped", label: "Shipped", at: "2026-02-16 10:40", done: true },
      { status: "delivered", label: "Delivered", at: "2026-02-18 12:34", done: true },
    ],
  },
  {
    id: "ord-4",
    number: "EC-2026-000270",
    customerName: "Brooklyn Simmons",
    customerEmail: "brooklyn@example.com",
    status: "canceled",
    total: 349,
    createdAt: "2026-02-11T14:04:00Z",
    updatedAt: "2026-02-11T16:01:00Z",
    items: [{ productId: "prd-5", name: "Airloom Lounge Chair", price: 349, quantity: 1 }],
    timeline: [
      { status: "pending", label: "Order Placed", at: "2026-02-11 14:04", done: true },
      { status: "paid", label: "Payment Confirmed", at: "-", done: false },
      { status: "shipped", label: "Shipped", at: "-", done: false },
      { status: "delivered", label: "Delivered", at: "-", done: false },
    ],
  },
];

export const users: UserProfile[] = [
  {
    id: "usr-1",
    name: "Admin User",
    email: "admin@ecom.local",
    role: "admin",
    address: "100 Main Street, New York, NY",
    joinedAt: "2025-01-02",
  },
  {
    id: "usr-2",
    name: "Seller Team A",
    email: "seller-a@ecom.local",
    role: "seller",
    address: "22 Commerce Road, Los Angeles, CA",
    joinedAt: "2025-04-20",
  },
  {
    id: "usr-3",
    name: "Support Agent",
    email: "support@ecom.local",
    role: "cs",
    address: "11 Service Ave, Austin, TX",
    joinedAt: "2025-06-18",
  },
  {
    id: "usr-4",
    name: "Store Staff",
    email: "staff@ecom.local",
    role: "staff",
    address: "89 Market Blvd, Denver, CO",
    joinedAt: "2025-07-11",
  },
  {
    id: "usr-5",
    name: "Customer Demo",
    email: "customer@ecom.local",
    role: "customer",
    address: "7 Cherry Lane, Seattle, WA",
    joinedAt: "2025-12-01",
  },
];

export const salesOverview: SalesPoint[] = [
  { label: "Mon", value: 8200 },
  { label: "Tue", value: 9600 },
  { label: "Wed", value: 10120 },
  { label: "Thu", value: 11890 },
  { label: "Fri", value: 13210 },
  { label: "Sat", value: 11020 },
  { label: "Sun", value: 12450 },
];

export const topSellingProducts: SalesPoint[] = [
  { label: "Nova Runner V2", value: 425 },
  { label: "Arc Wireless Pro", value: 382 },
  { label: "CoreFlex Kit", value: 344 },
  { label: "Summit Shell", value: 290 },
];

export const categoryBreakdown: CategoryBreakdown[] = [
  { category: "Tech", percent: 32 },
  { category: "Sneakers", percent: 26 },
  { category: "Outerwear", percent: 17 },
  { category: "Fitness", percent: 13 },
  { category: "Home", percent: 8 },
  { category: "Accessories", percent: 4 },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getOrderById(orderId: string) {
  return orders.find((order) => order.id === orderId);
}

export function calculateCartTotals(items: CartItem[]): CartTotals {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 250 || subtotal === 0 ? 0 : 12;
  const tax = subtotal * 0.08;
  const discount = subtotal > 300 ? subtotal * 0.07 : 0;

  return {
    subtotal,
    shipping,
    tax,
    discount,
    total: subtotal + shipping + tax - discount,
  };
}
