import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ShopCatalog } from "@/components/shop/shop-catalog";
import { categories } from "@/lib/mock-data";

export default function ShopPage() {
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
