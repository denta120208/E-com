import Link from "next/link";
import type { ReactNode } from "react";

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users & Roles" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/analytics", label: "Analytics" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="h-fit rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 lg:sticky lg:top-24">
        <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Admin panel</p>
        <p className="mt-2 text-lg font-semibold">Role: admin</p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Demo role-based view. Protect routes with real auth middleware in production.
        </p>
        <nav className="mt-4 space-y-2">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-xl px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="space-y-6">{children}</section>
    </div>
  );
}
