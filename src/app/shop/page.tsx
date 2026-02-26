import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ShopCatalog } from "@/components/shop/shop-catalog";
import { getCatalogCategories } from "@/lib/catalog-data";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const categories = await getCatalogCategories();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />
      <section>
        <h1 className="text-3xl font-semibold">Shop</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Browse by category, sort by performance, and search products with instant filtering.
        </p>
      </section>
      <ShopCatalog categories={categories} />
    </div>
  );
}
