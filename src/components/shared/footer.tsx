import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <h3 className="text-lg font-semibold">
            ECom<span className="text-[var(--color-brand)]">Prime</span>
          </h3>
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            Premium products, modern shopping flow, and a dashboard-ready commerce stack.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm text-[var(--color-text-muted)]">
            <li>
              <Link href="/shop">All Products</Link>
            </li>
            <li>
              <Link href="/cart">Cart</Link>
            </li>
            <li>
              <Link href="/checkout">Checkout</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Account</h4>
          <ul className="mt-3 space-y-2 text-sm text-[var(--color-text-muted)]">
            <li>
              <Link href="/login">Login</Link>
            </li>
            <li>
              <Link href="/register">Register</Link>
            </li>
            <li>
              <Link href="/orders">Orders</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Admin</h4>
          <ul className="mt-3 space-y-2 text-sm text-[var(--color-text-muted)]">
            <li>
              <Link href="/admin">Dashboard</Link>
            </li>
            <li>
              <Link href="/admin/products">Products</Link>
            </li>
            <li>
              <Link href="/admin/analytics">Analytics</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
