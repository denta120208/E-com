"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { categories, products } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

interface DraftProduct {
  name: string;
  category: string;
  price: string;
  stock: string;
  tags: string;
  image: string;
}

const initialDraft: DraftProduct = {
  name: "",
  category: categories[0].slug,
  price: "",
  stock: "",
  tags: "",
  image: "",
};

export default function AdminProductsPage() {
  const [catalog, setCatalog] = useState(products.slice(0, 8));
  const [draft, setDraft] = useState(initialDraft);

  const imagePreview = useMemo(
    () => draft.image || "https://picsum.photos/seed/product-preview/400/300",
    [draft.image],
  );

  const addProduct = () => {
    if (!draft.name || !draft.price || !draft.stock) return;
    setCatalog((previous) => [
      {
        ...previous[0],
        id: `tmp-${Date.now()}`,
        slug: draft.name.toLowerCase().replace(/\s+/g, "-"),
        name: draft.name,
        category: draft.category,
        price: Number(draft.price),
        stock: Number(draft.stock),
        tags: draft.tags
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        images: [imagePreview],
      },
      ...previous,
    ]);
    setDraft(initialDraft);
  };

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold">Product Management</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          CRUD-style product table, image preview, category and tag selectors, and stock controls.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="space-y-3">
          <h2 className="text-xl font-semibold">Add Product</h2>
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Product Name
            </label>
            <Input
              id="name"
              value={draft.name}
              onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="mb-1 block text-sm font-medium">
                Category
              </label>
              <Select
                id="category"
                value={draft.category}
                onChange={(event) => setDraft((prev) => ({ ...prev, category: event.target.value }))}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="tags" className="mb-1 block text-sm font-medium">
                Tags
              </label>
              <Input
                id="tags"
                value={draft.tags}
                onChange={(event) => setDraft((prev) => ({ ...prev, tags: event.target.value }))}
                placeholder="new, sale"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="price" className="mb-1 block text-sm font-medium">
                Price
              </label>
              <Input
                id="price"
                type="number"
                value={draft.price}
                onChange={(event) => setDraft((prev) => ({ ...prev, price: event.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="stock" className="mb-1 block text-sm font-medium">
                Stock
              </label>
              <Input
                id="stock"
                type="number"
                value={draft.stock}
                onChange={(event) => setDraft((prev) => ({ ...prev, stock: event.target.value }))}
              />
            </div>
          </div>
          <div>
            <label htmlFor="image" className="mb-1 block text-sm font-medium">
              Image URL
            </label>
            <Input
              id="image"
              value={draft.image}
              onChange={(event) => setDraft((prev) => ({ ...prev, image: event.target.value }))}
              placeholder="https://..."
            />
          </div>
          <Image
            src={imagePreview}
            alt="Preview"
            width={600}
            height={320}
            className="h-32 w-full rounded-xl object-cover"
          />
          <Button onClick={addProduct}>Create Product</Button>
        </Card>

        <Card className="overflow-auto">
          <h2 className="mb-3 text-xl font-semibold">Catalog Table</h2>
          <table className="w-full min-w-[540px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 font-medium">Price</th>
                <th className="pb-2 font-medium">Stock</th>
                <th className="pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {catalog.map((product) => (
                <tr key={product.id} className="border-b border-[var(--color-border)]">
                  <td className="py-3 font-medium">{product.name}</td>
                  <td className="py-3 text-[var(--color-text-muted)]">{product.category}</td>
                  <td className="py-3">{formatCurrency(product.price)}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setCatalog((previous) =>
                            previous.map((item) =>
                              item.id === product.id ? { ...item, stock: Math.max(0, item.stock - 1) } : item,
                            ),
                          )
                        }
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{product.stock}</span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setCatalog((previous) =>
                            previous.map((item) =>
                              item.id === product.id ? { ...item, stock: item.stock + 1 } : item,
                            ),
                          )
                        }
                      >
                        +
                      </Button>
                    </div>
                  </td>
                  <td className="py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCatalog((previous) => previous.filter((item) => item.id !== product.id))}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
