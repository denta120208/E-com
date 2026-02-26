import Link from "next/link";
import { BarChart } from "@/components/admin/bar-chart";
import { StatCard } from "@/components/admin/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { salesOverview, topSellingProducts } from "@/lib/mock-data";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard Overview</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            KPI cards, sales trends, and quick actions.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products">
            <Button variant="secondary">Add Product</Button>
          </Link>
          <Link href="/admin/orders">
            <Button>View Orders</Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Sales" value="$182,910" change="+12.4% vs last month" />
        <StatCard label="New Users" value="1,284" change="+7.8% vs last month" />
        <StatCard label="Orders Today" value="94" change="+9.1% vs yesterday" />
        <StatCard label="Low Stock Alerts" value="8" change="Needs replenishment" />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <BarChart title="Weekly Sales" points={salesOverview} />
        <BarChart title="Best Selling Products" points={topSellingProducts} />
      </section>

      <Card>
        <h3 className="text-lg font-semibold">Quick Actions</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/admin/products">
            <Button variant="secondary">Manage Catalog</Button>
          </Link>
          <Link href="/admin/orders">
            <Button variant="secondary">Update Order Status</Button>
          </Link>
          <Link href="/admin/notifications">
            <Button variant="secondary">Edit Email Templates</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
