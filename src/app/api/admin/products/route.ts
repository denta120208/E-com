import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type ProductRow = Record<string, unknown> & {
  id: string;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  price?: number | string | null;
  stock?: number | string | null;
  category_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type CategoryRow = {
  id: string;
  name?: string | null;
  slug?: string | null;
};

type ProductImageRow = {
  product_id?: string | null;
  url?: string | null;
  position?: number | null;
};

interface ProductPayload {
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: string | null;
  imageUrl?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}

function hasSupabaseServiceConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function isMissingSchemaError(message: string, key: string) {
  const lowered = message.toLowerCase();
  return lowered.includes("does not exist") && lowered.includes(key.toLowerCase());
}

function resolveImageUrl(row: ProductRow, imageMap: Map<string, string>) {
  const thumbnail = row.thumbnail_url;
  if (typeof thumbnail === "string" && thumbnail.trim()) {
    return thumbnail;
  }

  const images = row.images;
  if (Array.isArray(images) && images.length > 0 && typeof images[0] === "string") {
    return images[0];
  }

  return imageMap.get(row.id) ?? "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80";
}

async function readImageMap(productIds: string[]) {
  if (productIds.length === 0) return new Map<string, string>();

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("product_images")
    .select("product_id,url,position")
    .in("product_id", productIds)
    .order("position", { ascending: true });

  if (error) {
    if (isMissingSchemaError(error.message, "product_images")) {
      return new Map<string, string>();
    }
    throw new Error(error.message);
  }

  const map = new Map<string, string>();
  for (const row of (data ?? []) as ProductImageRow[]) {
    if (!row.product_id || !row.url || map.has(row.product_id)) continue;
    map.set(row.product_id, row.url);
  }
  return map;
}

async function updateOptionalProductFlags(
  productId: string,
  payload: Pick<ProductPayload, "isFeatured" | "isActive">,
) {
  const updates: Record<string, unknown> = {};
  if (typeof payload.isFeatured === "boolean") {
    updates.is_featured = payload.isFeatured;
  }
  if (typeof payload.isActive === "boolean") {
    updates.is_active = payload.isActive;
  }
  if (Object.keys(updates).length === 0) return;

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("products").update(updates).eq("id", productId);
  if (error && !isMissingSchemaError(error.message, "is_featured") && !isMissingSchemaError(error.message, "is_active")) {
    throw new Error(error.message);
  }
}

async function updateProductImage(productId: string, imageUrl?: string) {
  if (!imageUrl?.trim()) return;

  const supabase = createSupabaseServiceClient();
  const normalizedUrl = imageUrl.trim();

  const { error: productsImageError } = await supabase
    .from("products")
    .update({
      images: [normalizedUrl],
      thumbnail_url: normalizedUrl,
    })
    .eq("id", productId);

  if (
    productsImageError &&
    !isMissingSchemaError(productsImageError.message, "images") &&
    !isMissingSchemaError(productsImageError.message, "thumbnail_url")
  ) {
    throw new Error(productsImageError.message);
  }

  const { error: deleteError } = await supabase.from("product_images").delete().eq("product_id", productId);
  if (deleteError && !isMissingSchemaError(deleteError.message, "product_images")) {
    throw new Error(deleteError.message);
  }

  const { error: insertError } = await supabase.from("product_images").insert({
    product_id: productId,
    url: normalizedUrl,
    position: 0,
  });

  if (insertError && !isMissingSchemaError(insertError.message, "product_images")) {
    throw new Error(insertError.message);
  }
}

async function getUniqueSlug(baseName: string) {
  const baseSlug = slugify(baseName) || "product";
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase.from("products").select("id").eq("slug", baseSlug).maybeSingle();
  if (!data) return baseSlug;
  return `${baseSlug}-${Date.now().toString().slice(-6)}`;
}

export async function GET() {
  if (!hasSupabaseServiceConfig()) {
    return NextResponse.json({ message: "Supabase service role configuration is missing" }, { status: 500 });
  }

  try {
    const supabase = createSupabaseServiceClient();
    const [{ data: productRowsRaw, error: productError }, { data: categoriesRaw, error: categoryError }] =
      await Promise.all([
        supabase.from("products").select("*").order("updated_at", { ascending: false }),
        supabase.from("categories").select("id,name,slug").order("name", { ascending: true }),
      ]);

    if (productError) {
      return NextResponse.json({ message: productError.message }, { status: 500 });
    }
    if (categoryError) {
      return NextResponse.json({ message: categoryError.message }, { status: 500 });
    }

    const productRows = (productRowsRaw ?? []) as ProductRow[];
    const categories = (categoriesRaw ?? []) as CategoryRow[];
    const categoryMap = new Map(categories.map((category) => [category.id, category]));
    const imageMap = await readImageMap(productRows.map((row) => row.id));

    const items = productRows.map((row) => {
      const category = row.category_id ? categoryMap.get(row.category_id) : undefined;
      return {
        id: row.id,
        name: row.name ?? "Product",
        slug: row.slug ?? "",
        description: row.description ?? "",
        price: toNumber(row.price, 0),
        stock: toNumber(row.stock, 0),
        categoryId: row.category_id ?? null,
        categoryName: category?.name ?? "-",
        categorySlug: category?.slug ?? "-",
        imageUrl: resolveImageUrl(row, imageMap),
        isFeatured: Boolean(row.is_featured),
        isActive: row.is_active === undefined ? true : Boolean(row.is_active),
        createdAt: row.created_at ?? null,
        updatedAt: row.updated_at ?? null,
      };
    });

    return NextResponse.json({
      items,
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name ?? "Category",
        slug: category.slug ?? "",
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to load products",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!hasSupabaseServiceConfig()) {
    return NextResponse.json({ message: "Supabase service role configuration is missing" }, { status: 500 });
  }

  const payload = (await request.json().catch(() => ({}))) as ProductPayload;
  if (!payload.name?.trim()) {
    return NextResponse.json({ message: "name is required" }, { status: 400 });
  }

  const price = toNumber(payload.price, NaN);
  const stock = toNumber(payload.stock, NaN);
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json({ message: "price must be a valid non-negative number" }, { status: 400 });
  }
  if (!Number.isFinite(stock) || stock < 0) {
    return NextResponse.json({ message: "stock must be a valid non-negative number" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseServiceClient();
    const slug = await getUniqueSlug(payload.name);
    const { data: inserted, error: insertError } = await supabase
      .from("products")
      .insert({
        name: payload.name.trim(),
        slug,
        description: payload.description?.trim() ?? "",
        price,
        stock,
        category_id: payload.categoryId ?? null,
      })
      .select("*")
      .single();

    if (insertError || !inserted) {
      return NextResponse.json({ message: insertError?.message ?? "Failed to create product" }, { status: 500 });
    }

    await updateOptionalProductFlags(inserted.id as string, {
      isFeatured: payload.isFeatured,
      isActive: payload.isActive,
    });
    await updateProductImage(inserted.id as string, payload.imageUrl);

    return NextResponse.json({ message: "Product created", id: inserted.id });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to create product" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  if (!hasSupabaseServiceConfig()) {
    return NextResponse.json({ message: "Supabase service role configuration is missing" }, { status: 500 });
  }

  const payload = (await request.json().catch(() => ({}))) as ProductPayload;
  if (!payload.id) {
    return NextResponse.json({ message: "id is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (payload.name !== undefined) updates.name = payload.name.trim();
  if (payload.description !== undefined) updates.description = payload.description.trim();
  if (payload.price !== undefined) {
    const parsedPrice = toNumber(payload.price, NaN);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ message: "price must be a valid non-negative number" }, { status: 400 });
    }
    updates.price = parsedPrice;
  }
  if (payload.stock !== undefined) {
    const parsedStock = toNumber(payload.stock, NaN);
    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
      return NextResponse.json({ message: "stock must be a valid non-negative number" }, { status: 400 });
    }
    updates.stock = parsedStock;
  }
  if (payload.categoryId !== undefined) updates.category_id = payload.categoryId;

  try {
    const supabase = createSupabaseServiceClient();
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase.from("products").update(updates).eq("id", payload.id);
      if (updateError) {
        return NextResponse.json({ message: updateError.message }, { status: 500 });
      }
    }

    await updateOptionalProductFlags(payload.id, {
      isFeatured: payload.isFeatured,
      isActive: payload.isActive,
    });
    await updateProductImage(payload.id, payload.imageUrl);

    return NextResponse.json({ message: "Product updated", id: payload.id });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to update product" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!hasSupabaseServiceConfig()) {
    return NextResponse.json({ message: "Supabase service role configuration is missing" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ message: "id is required" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Product deleted", id });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to delete product" },
      { status: 500 },
    );
  }
}
