"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/providers/theme-toggle";
import { useCart } from "@/components/providers/cart-provider";
import { useSession } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const baseNavItems = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const { user, setUser } = useSession();
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = [
    ...baseNavItems,
    ...(user ? [{ label: "Orders", href: "/orders" }] : []),
    ...(user?.role === "admin" ? [{ label: "Admin", href: "/admin" }] : []),
  ];

  const logout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg-overlay)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="text-xl font-bold tracking-tight text-[var(--color-text)]">
          ECom<span className="text-[var(--color-brand)]">Prime</span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition hover:text-[var(--color-brand)]",
                pathname === item.href ? "text-[var(--color-brand)]" : "text-[var(--color-text-muted)]",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium transition hover:border-[var(--color-brand)]"
          >
            Cart ({count})
          </Link>
          {user ? (
            <Link
              href="/profile"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium transition hover:border-[var(--color-brand)]"
            >
              {user.name.split(" ")[0]}
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium transition hover:border-[var(--color-brand)]"
            >
              Login
            </Link>
          )}
          {user ? (
            <Button size="sm" variant="ghost" onClick={logout} disabled={loggingOut}>
              {loggingOut ? "..." : "Logout"}
            </Button>
          ) : null}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
