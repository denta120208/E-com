import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { Category, Product, ProductVariant } from "@/lib/types";

interface CategoryRow {
  id: string;
  name?: string | null;
  slug?: string | null;
}

interface ProductRow extends Record<string, unknown> {
  id: string;
  slug?: string | null;
  name?: string | null;
  description?: string | null;
  price?: number | string | null;
  discount_price?: number | string | null;
  original_price?: number | string | null;
  stock?: number | string | null;
  rating?: number | string | null;
  review_count?: number | string | null;
  category_id?: string | null;
  images?: string[] | null;
  thumbnail_url?: string | null;
  is_featured?: boolean | null;
  is_active?: boolean | null;
  created_at?: string | null;
}

interface ProductVariantRow {
  id?: string | null;
  product_id?: string | null;
  variant_type?: string | null;
  variant_value?: string | null;
  value?: string | null;
  label?: string | null;
  stock?: number | string | null;
}

interface ProductImageRow {
  product_id?: string | null;
  url?: string | null;
  position?: number | null;
}

interface CatalogListParams {
  query?: string;
  category?: string;
  sort?: string;
  minRating?: number;
  page?: number;
  limit?: number;
}

interface CatalogListResult {
  items: Product[];
  total: number;
  totalPages: number;
  page: number;
}

const DEFAULT_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80";

function getCategoryFallbackImage(slug: string) {
  const category = slug.toLowerCase();
  if (category === "sneakers" || category === "sports") {
    return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80";
  }
  if (category === "outerwear" || category === "fashion") {
    return "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80";
  }
  if (category === "accessories") {
    return "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&q=80";
  }
  if (category === "electronics" || category === "watches") {
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80";
  }
  if (category === "beauty") {
    return "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=80";
  }
  if (category === "home-living") {
    return "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1200&q=80";
  }
  return DEFAULT_PRODUCT_IMAGE;
}

function isLikelyPhotoUrl(value: string) {
  const normalized = value.trim().toLowerCase();
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    return false;
  }

  if (normalized.endsWith(".svg")) {
    return false;
  }

  if (normalized.includes("/storage/v1/object/public/product-images/") && normalized.includes("-thumb")) {
    return false;
  }

  return true;
}

function hasSupabaseServiceConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return fallback;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getCategoryIcon(slug: string) {
  const map: Record<string, string> = {
    sneakers: "SNK",
    sports: "SPT",
    outerwear: "OUT",
    accessories: "ACC",
    electronics: "TEC",
    fashion: "FSH",
    "home-living": "HOM",
    beauty: "BEA",
    watches: "WAT",
  };
  return map[slug] ?? "CAT";
}

function fallbackSizeVariant(productId: string, stock: number): ProductVariant {
  return {
    id: `${productId}-size-default`,
    label: "One Size",
    value: "one-size",
    stock,
  };
}

function fallbackColorVariant(productId: string, stock: number): ProductVariant {
  return {
    id: `${productId}-color-default`,
    label: "Default",
    value: "default",
    stock,
  };
}

function normalizeVariantType(value: string | null | undefined) {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized === "size") return "size";
  if (normalized === "color") return "color";
  return null;
}

function resolveVariantLabel(row: ProductVariantRow) {
  const raw = row.label ?? row.variant_value ?? row.value ?? "Variant";
  const label = String(raw).trim();
  return label || "Variant";
}

function resolveVariantValue(row: ProductVariantRow, fallbackLabel: string) {
  const raw = row.value ?? row.variant_value ?? fallbackLabel;
  const value = String(raw).trim();
  return value || slugify(fallbackLabel) || "variant";
}

async function fetchCategories() {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("categories").select("id,name,slug").order("name");
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as CategoryRow[];
}

async function fetchProducts() {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("products").select("*");
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as ProductRow[];
}

async function fetchProductVariants(productIds: string[]) {
  if (productIds.length === 0) return [] as ProductVariantRow[];

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("product_variants").select("*").in("product_id", productIds);
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as ProductVariantRow[];
}

async function fetchProductImages(productIds: string[]) {
  if (productIds.length === 0) return [] as ProductImageRow[];

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("product_images")
    .select("product_id,url,position")
    .in("product_id", productIds)
    .order("position", { ascending: true });

  if (error) {
    return [] as ProductImageRow[];
  }

  return (data ?? []) as ProductImageRow[];
}

function mapCategories(rows: CategoryRow[]): Category[] {
  return rows.map((row) => {
    const slug = String(row.slug ?? "uncategorized");
    return {
      id: row.id,
      name: String(row.name ?? "Category"),
      slug,
      icon: getCategoryIcon(slug),
    };
  });
}

function mapProducts(
  productRows: ProductRow[],
  categoryRows: CategoryRow[],
  variantRows: ProductVariantRow[],
  imageRows: ProductImageRow[],
) {
  const categoryById = new Map(categoryRows.map((row) => [row.id, row]));
  const variantsByProduct = new Map<string, { size: ProductVariant[]; color: ProductVariant[] }>();

  for (const variant of variantRows) {
    const productId = variant.product_id;
    const normalizedType = normalizeVariantType(variant.variant_type);
    if (!productId || !normalizedType) continue;

    const current = variantsByProduct.get(productId) ?? { size: [], color: [] };
    const label = resolveVariantLabel(variant);
    current[normalizedType].push({
      id: String(variant.id ?? `${productId}-${normalizedType}-${current[normalizedType].length + 1}`),
      label,
      value: resolveVariantValue(variant, label),
      stock: Math.max(0, toNumber(variant.stock, 0)),
    });
    variantsByProduct.set(productId, current);
  }

  const imagesByProduct = new Map<string, string[]>();
  for (const image of imageRows) {
    if (!image.product_id || !image.url) continue;
    const current = imagesByProduct.get(image.product_id) ?? [];
    current.push(image.url);
    imagesByProduct.set(image.product_id, current);
  }

  const mappedProducts: Product[] = productRows.map((row) => {
    const categoryRow = row.category_id ? categoryById.get(row.category_id) : null;
    const categorySlug = String(categoryRow?.slug ?? "uncategorized");
    const categoryFallbackImage = getCategoryFallbackImage(categorySlug);
    const basePrice = Math.max(0, toNumber(row.price, 0));
    const discountPrice = toNumber(row.discount_price, NaN);
    const originalPrice = toNumber(row.original_price, NaN);

    const finalPrice =
      Number.isFinite(discountPrice) && discountPrice > 0 && discountPrice < basePrice
        ? discountPrice
        : basePrice;

    const computedOriginalPrice =
      Number.isFinite(discountPrice) && discountPrice > 0 && discountPrice < basePrice
        ? basePrice
        : Number.isFinite(originalPrice) && originalPrice > finalPrice
          ? originalPrice
          : undefined;

    const rowImages =
      Array.isArray(row.images) && row.images.length > 0
        ? row.images.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
        : [];

    const externalImages = imagesByProduct.get(row.id) ?? [];
    const thumbnail = typeof row.thumbnail_url === "string" ? row.thumbnail_url : "";
    const mergedImages = [thumbnail, ...rowImages, ...externalImages]
      .filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
      .filter(isLikelyPhotoUrl);
    const uniqueImages = Array.from(new Set(mergedImages));
    const images = uniqueImages.length > 0 ? uniqueImages : [categoryFallbackImage];

    const stock = Math.max(0, toNumber(row.stock, 0));
    const variants = variantsByProduct.get(row.id) ?? { size: [], color: [] };
    const sizeVariants = variants.size.length > 0 ? variants.size : [fallbackSizeVariant(row.id, stock)];
    const colorVariants = variants.color.length > 0 ? variants.color : [fallbackColorVariant(row.id, stock)];

    const createdAt = String(row.created_at ?? new Date(0).toISOString());
    const createdDate = new Date(createdAt);
    const daysOld = Number.isFinite(createdDate.getTime())
      ? (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
      : 9999;

    return {
      id: row.id,
      slug: String(row.slug ?? row.id),
      name: String(row.name ?? "Product"),
      description: String(row.description ?? ""),
      category: categorySlug,
      price: finalPrice,
      originalPrice: computedOriginalPrice,
      rating: Math.max(0, Math.min(5, toNumber(row.rating, 4.5))),
      reviewCount: Math.max(0, toNumber(row.review_count, 0)),
      stock,
      isFeatured: toBoolean(row.is_featured, false),
      isTrending: toBoolean(row.is_featured, false) || daysOld <= 30,
      tags: [],
      images,
      variants: {
        size: sizeVariants,
        color: colorVariants,
      },
      createdAt,
    };
  });

  return mappedProducts;
}

async function getMappedCatalog() {
  const categoryRows = await fetchCategories();
  const productRows = await fetchProducts();
  const productIds = productRows.map((row) => row.id);
  const [variantRows, imageRows] = await Promise.all([
    fetchProductVariants(productIds),
    fetchProductImages(productIds),
  ]);

  const categories = mapCategories(categoryRows);
  const products = mapProducts(productRows, categoryRows, variantRows, imageRows);

  return {
    categories,
    products,
  };
}

export async function getCatalogCategories() {
  if (!hasSupabaseServiceConfig()) return [] as Category[];
  const { categories } = await getMappedCatalog();
  return categories;
}

export async function getCatalogProducts(params: CatalogListParams = {}): Promise<CatalogListResult> {
  const {
    query = "",
    category = "all",
    sort = "newest",
    minRating = 0,
    page = 1,
    limit = 8,
  } = params;

  if (!hasSupabaseServiceConfig()) {
    return { items: [], total: 0, totalPages: 1, page: 1 };
  }

  const { products } = await getMappedCatalog();
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedCategory = category.trim().toLowerCase();
  const normalizedMinRating = Number.isFinite(minRating) ? minRating : 0;
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);

  let filtered = products.filter((product) => {
    const matchQuery =
      !normalizedQuery ||
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.description.toLowerCase().includes(normalizedQuery);
    const matchCategory = normalizedCategory === "all" || product.category === normalizedCategory;
    const matchRating = product.rating >= normalizedMinRating;
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

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const start = (safePage - 1) * safeLimit;
  const items = filtered.slice(start, start + safeLimit);

  return {
    items,
    total,
    totalPages,
    page: Math.min(safePage, totalPages),
  };
}

export async function getCatalogProductBySlug(slug: string) {
  if (!hasSupabaseServiceConfig()) return null;
  const { products } = await getMappedCatalog();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getHomeCatalogData() {
  if (!hasSupabaseServiceConfig()) {
    return {
      categories: [] as Category[],
      featuredProducts: [] as Product[],
      trendingProducts: [] as Product[],
      products: [] as Product[],
    };
  }

  const { categories, products } = await getMappedCatalog();
  const sortedByNewest = [...products].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const featuredProducts = sortedByNewest.filter((product) => product.isFeatured).slice(0, 8);
  const trendingProducts = sortedByNewest.filter((product) => product.isTrending).slice(0, 8);

  return {
    categories,
    featuredProducts: featuredProducts.length > 0 ? featuredProducts : sortedByNewest.slice(0, 8),
    trendingProducts: trendingProducts.length > 0 ? trendingProducts : sortedByNewest.slice(0, 8),
    products: sortedByNewest,
  };
}
