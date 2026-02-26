"use client";

import Image from "next/image";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

interface AdminCategory {
  id: string;
  name: string;
  slug: string;
}

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string | null;
  categoryName: string;
  categorySlug: string;
  imageUrl: string;
  isFeatured: boolean;
  isActive: boolean;
}

interface ProductFormDraft {
  name: string;
  description: string;
  categoryId: string;
  price: string;
  stock: string;
  imageUrl: string;
  isFeatured: boolean;
  isActive: boolean;
}

function createInitialDraft(defaultCategoryId?: string): ProductFormDraft {
  return {
    name: "",
    description: "",
    categoryId: defaultCategoryId ?? "",
    price: "",
    stock: "",
    imageUrl: "",
    isFeatured: false,
    isActive: true,
  };
}

function toPayload(draft: ProductFormDraft) {
  return {
    name: draft.name.trim(),
    description: draft.description.trim(),
    categoryId: draft.categoryId || null,
    price: Number(draft.price),
    stock: Number(draft.stock),
    imageUrl: draft.imageUrl.trim(),
    isFeatured: draft.isFeatured,
    isActive: draft.isActive,
  };
}

function toEditDraft(product: AdminProduct): ProductFormDraft {
  return {
    name: product.name,
    description: product.description,
    categoryId: product.categoryId ?? "",
    price: String(product.price),
    stock: String(product.stock),
    imageUrl: product.imageUrl,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
  };
}

function isValidDraft(draft: ProductFormDraft) {
  const price = Number(draft.price);
  const stock = Number(draft.stock);
  return Boolean(
    draft.name.trim() &&
      Number.isFinite(price) &&
      price >= 0 &&
      Number.isFinite(stock) &&
      stock >= 0,
  );
}

export default function AdminProductsPage() {
  const [catalog, setCatalog] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [draft, setDraft] = useState<ProductFormDraft>(createInitialDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ProductFormDraft>(createInitialDraft());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const imagePreview = useMemo(
    () => draft.imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    [draft.imageUrl],
  );

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/products", { cache: "no-store" });
      const result = (await response.json().catch(() => null)) as
        | { items?: AdminProduct[]; categories?: AdminCategory[]; message?: string }
        | null;

      if (!response.ok || !result?.items || !result.categories) {
        throw new Error(result?.message ?? "Failed to load products");
      }

      const nextItems = result.items;
      const nextCategories = result.categories;

      setCatalog(nextItems);
      setCategories(nextCategories);
      setDraft((previous) => {
        if (previous.categoryId) return previous;
        return { ...previous, categoryId: nextCategories[0]?.id ?? "" };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const createProduct = async () => {
    setMessage("");
    setError("");
    if (!isValidDraft(draft)) {
      setError("Lengkapi nama, harga, dan stok dengan nilai valid.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(draft)),
      });

      const result = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(result?.message ?? "Failed to create product");
      }

      setMessage("Product created.");
      setDraft(createInitialDraft(categories[0]?.id));
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (product: AdminProduct) => {
    setEditingId(product.id);
    setEditDraft(toEditDraft(product));
    setMessage("");
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(createInitialDraft(categories[0]?.id));
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setMessage("");
    setError("");

    if (!isValidDraft(editDraft)) {
      setError("Lengkapi field edit dengan nilai valid.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...toPayload(editDraft) }),
      });
      const result = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(result?.message ?? "Failed to update product");
      }

      setMessage("Product updated.");
      setEditingId(null);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product: AdminProduct) => {
    setMessage("");
    setError("");

    const confirmed = window.confirm(`Delete product \"${product.name}\"?`);
    if (!confirmed) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/products?id=${encodeURIComponent(product.id)}`, {
        method: "DELETE",
      });
      const result = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(result?.message ?? "Failed to delete product");
      }

      setMessage("Product deleted.");
      if (editingId === product.id) {
        setEditingId(null);
      }
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    } finally {
      setSaving(false);
    }
  };

  const adjustStock = async (product: AdminProduct, delta: number) => {
    const nextStock = Math.max(0, product.stock + delta);
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, stock: nextStock }),
      });

      const result = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(result?.message ?? "Failed to update stock");
      }

      setCatalog((previous) =>
        previous.map((item) =>
          item.id === product.id ? { ...item, stock: nextStock } : item,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update stock");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold">Product Management</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Real Supabase catalog with create, edit per product, stock controls, and delete actions.
        </p>
      </section>

      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
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
          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              value={draft.description}
              onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
              className="min-h-24 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm outline-none focus:border-[var(--color-brand)]"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="mb-1 block text-sm font-medium">
                Category
              </label>
              <Select
                id="category"
                value={draft.categoryId}
                onChange={(event) => setDraft((prev) => ({ ...prev, categoryId: event.target.value }))}
              >
                <option value="">No category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="imageUrl" className="mb-1 block text-sm font-medium">
                Image URL
              </label>
              <Input
                id="imageUrl"
                value={draft.imageUrl}
                onChange={(event) => setDraft((prev) => ({ ...prev, imageUrl: event.target.value }))}
                placeholder="https://..."
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
                min={0}
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
                min={0}
                value={draft.stock}
                onChange={(event) => setDraft((prev) => ({ ...prev, stock: event.target.value }))}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.isFeatured}
              onChange={(event) => setDraft((prev) => ({ ...prev, isFeatured: event.target.checked }))}
              className="h-4 w-4 rounded border-[var(--color-border)]"
            />
            Featured Product
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.isActive}
              onChange={(event) => setDraft((prev) => ({ ...prev, isActive: event.target.checked }))}
              className="h-4 w-4 rounded border-[var(--color-border)]"
            />
            Active
          </label>
          <Image
            src={imagePreview}
            alt="Preview"
            width={800}
            height={400}
            className="h-40 w-full rounded-xl object-cover"
          />
          <Button onClick={() => void createProduct()} disabled={saving || !isValidDraft(draft)}>
            {saving ? "Saving..." : "Create Product"}
          </Button>
        </Card>

        <Card className="overflow-auto">
          <h2 className="mb-3 text-xl font-semibold">Catalog Table</h2>
          {loading ? <p className="text-sm text-[var(--color-text-muted)]">Loading products...</p> : null}
          {!loading && catalog.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No products found in Supabase.</p>
          ) : null}
          {!loading && catalog.length > 0 ? (
            <table className="w-full min-w-[760px] text-left text-sm">
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
                  <Fragment key={product.id}>
                    <tr className="border-b border-[var(--color-border)] align-top">
                      <td className="py-3 font-medium">
                        <div className="flex items-start gap-3">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            width={64}
                            height={64}
                            className="h-14 w-14 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">/{product.slug}</p>
                            {!product.isActive ? <p className="text-xs text-red-600">Inactive</p> : null}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-[var(--color-text-muted)]">{product.categoryName}</td>
                      <td className="py-3">{formatCurrency(product.price)}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => void adjustStock(product, -1)}
                            disabled={saving}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{product.stock}</span>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => void adjustStock(product, 1)}
                            disabled={saving}
                          >
                            +
                          </Button>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => startEdit(product)}
                            disabled={saving}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void deleteProduct(product)}
                            disabled={saving}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {editingId === product.id ? (
                      <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]">
                        <td colSpan={5} className="p-3">
                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-xs font-medium">Name</label>
                              <Input
                                value={editDraft.name}
                                onChange={(event) =>
                                  setEditDraft((prev) => ({ ...prev, name: event.target.value }))
                                }
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium">Category</label>
                              <Select
                                value={editDraft.categoryId}
                                onChange={(event) =>
                                  setEditDraft((prev) => ({ ...prev, categoryId: event.target.value }))
                                }
                              >
                                <option value="">No category</option>
                                {categories.map((category) => (
                                  <option key={category.id} value={category.id}>
                                    {category.name}
                                  </option>
                                ))}
                              </Select>
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium">Price</label>
                              <Input
                                type="number"
                                min={0}
                                value={editDraft.price}
                                onChange={(event) =>
                                  setEditDraft((prev) => ({ ...prev, price: event.target.value }))
                                }
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium">Stock</label>
                              <Input
                                type="number"
                                min={0}
                                value={editDraft.stock}
                                onChange={(event) =>
                                  setEditDraft((prev) => ({ ...prev, stock: event.target.value }))
                                }
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="mb-1 block text-xs font-medium">Image URL</label>
                              <Input
                                value={editDraft.imageUrl}
                                onChange={(event) =>
                                  setEditDraft((prev) => ({ ...prev, imageUrl: event.target.value }))
                                }
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="mb-1 block text-xs font-medium">Description</label>
                              <textarea
                                value={editDraft.description}
                                onChange={(event) =>
                                  setEditDraft((prev) => ({ ...prev, description: event.target.value }))
                                }
                                className="min-h-20 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm outline-none focus:border-[var(--color-brand)]"
                              />
                            </div>
                            <label className="flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={editDraft.isFeatured}
                                onChange={(event) =>
                                  setEditDraft((prev) => ({ ...prev, isFeatured: event.target.checked }))
                                }
                                className="h-4 w-4 rounded border-[var(--color-border)]"
                              />
                              Featured
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={editDraft.isActive}
                                onChange={(event) =>
                                  setEditDraft((prev) => ({ ...prev, isActive: event.target.checked }))
                                }
                                className="h-4 w-4 rounded border-[var(--color-border)]"
                              />
                              Active
                            </label>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button onClick={() => void saveEdit()} disabled={saving || !isValidDraft(editDraft)}>
                              {saving ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button variant="secondary" onClick={cancelEdit} disabled={saving}>
                              Cancel
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
              </tbody>
            </table>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
