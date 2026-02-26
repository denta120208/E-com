import Link from "next/link";
import { ProductCard } from "@/components/shared/product-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getHomeCatalogData } from "@/lib/catalog-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { categories, featuredProducts, products, trendingProducts } = await getHomeCatalogData();

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[linear-gradient(125deg,#0f1728_10%,#15413e_48%,#2b6d5b_100%)] px-6 py-14 text-white sm:px-10">
        <div className="absolute -top-16 -right-10 h-56 w-56 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="relative max-w-2xl animate-fade-up">
          <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
            Mid Season Drop
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            Premium daily essentials for every room and routine.
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/80">
            Explore curated collections with modern fit, faster checkout, and a production-ready commerce
            experience.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop">
              <Button size="lg">Shop Collection</Button>
            </Link>
            <Link href="/admin">
              <Button size="lg" variant="secondary">
                View Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories.slice(0, 6).map((category) => (
          <Link key={category.id} href={`/shop?category=${category.slug}`}>
            <Card className="flex items-center gap-3 transition hover:-translate-y-0.5 hover:border-[var(--color-brand)]">
              <span className="text-2xl">{category.icon}</span>
              <div>
                <p className="text-sm font-semibold">{category.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">Explore</p>
              </div>
            </Card>
          </Link>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Featured Picks</h2>
            <p className="text-sm text-[var(--color-text-muted)]">Top products selected for conversion-ready merchandising.</p>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-[var(--color-brand)]">
            View all
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-xl font-semibold">Trending this week</h3>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">Products users are adding to carts the fastest.</p>
          <div className="mt-4 space-y-3">
            {trendingProducts.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl bg-[var(--color-surface-alt)] px-3 py-2">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-[var(--color-text-muted)]">{item.rating.toFixed(1)} star</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold">For You</h3>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">Personalized recommendations based on browsing and purchase activity.</p>
          <div className="mt-4 space-y-3">
            {products.slice(4, 8).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-[var(--color-border)] px-3 py-2">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-[var(--color-text-muted)]">${item.price.toFixed(0)}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
