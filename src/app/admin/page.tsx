import Link from "next/link";
import { BarChart } from "@/components/admin/bar-chart";
import { StatCard } from "@/components/admin/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAdminMetricsData } from "@/lib/admin-metrics";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const metrics = await getAdminMetricsData();

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

      {metrics.error ? (
        <Card>
          <p className="text-sm text-red-600">{metrics.error}</p>
        </Card>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Sales"
          value={formatCurrency(metrics.totalSales)}
          change={`Today ${formatCurrency(metrics.revenueToday)}`}
        />
        <StatCard
          label="New Users (30d)"
          value={metrics.newUsers.toLocaleString("en-US")}
          change="Real profile growth"
        />
        <StatCard
          label="Orders Today"
          value={metrics.ordersToday.toLocaleString("en-US")}
          change={`7d Revenue ${formatCurrency(metrics.revenueWeek)}`}
        />
        <StatCard
          label="Low Stock Alerts"
          value={metrics.lowStockCount.toLocaleString("en-US")}
          change="Products with stock <= 10"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <BarChart title="Weekly Sales" points={metrics.weeklySales} />
        <BarChart title="Best Selling Products" points={metrics.topSellingProducts} />
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
