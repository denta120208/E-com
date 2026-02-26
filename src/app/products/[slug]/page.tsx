import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { RatingStars } from "@/components/shared/rating-stars";
import { ProductDetailActions } from "@/components/shop/product-detail-actions";
import { Card } from "@/components/ui/card";
import { getCatalogProductBySlug } from "@/lib/catalog-data";
import { formatCurrency, toTitleCase } from "@/lib/utils";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

const reviewTemplates = [
  { id: "r1", author: "Avery", rating: 5, comment: "Excellent material and fit. Reordered another color." },
  { id: "r2", author: "Jordan", rating: 4, comment: "Great quality. Shipping was quick and packaging felt premium." },
  { id: "r3", author: "Taylor", rating: 5, comment: "Exactly as described. Good support and easy returns." },
];

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const gallery = product.images.length > 0 ? product.images : [""];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: product.name },
        ]}
      />

      <section className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <Card className="overflow-hidden p-0">
          <div className="grid gap-3 p-3 md:grid-cols-[2fr_1fr]">
            <Image
              src={gallery[0]}
              alt={product.name}
              width={1200}
              height={1200}
              className="h-[430px] w-full rounded-xl object-cover"
            />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
              {gallery.slice(0, 3).map((image, index) => (
                <Image
                  key={`${product.id}-${index}`}
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  width={480}
                  height={480}
                  className="h-[136px] w-full rounded-xl object-cover"
                />
              ))}
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-wide text-[var(--color-text-muted)]">{toTitleCase(product.category)}</p>
            <h1 className="text-3xl font-semibold">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <RatingStars rating={product.rating} />
              <span className="text-[var(--color-text-muted)]">({product.reviewCount} reviews)</span>
              <span className="rounded-full bg-[var(--color-surface-alt)] px-3 py-1 text-xs">Stock: {product.stock}</span>
            </div>
            <p className="text-2xl font-semibold">{formatCurrency(product.price)}</p>
            <p className="text-sm text-[var(--color-text-muted)]">{product.description}</p>
          </div>

          <ProductDetailActions product={product} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Ratings & Reviews</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {reviewTemplates.map((review) => (
            <Card key={review.id}>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{review.author}</p>
                <RatingStars rating={review.rating} />
              </div>
              <p className="mt-3 text-sm text-[var(--color-text-muted)]">{review.comment}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
