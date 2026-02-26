import { BarChart } from "@/components/admin/bar-chart";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getAdminMetricsData } from "@/lib/admin-metrics";
import { formatCurrency } from "@/lib/utils";

export default async function AdminAnalyticsPage() {
  const metrics = await getAdminMetricsData();

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold">Analytics & Reports</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Revenue trends, category breakdowns, sales channels, and low stock alerts.
        </p>
      </section>

      {metrics.error ? (
        <Card>
          <p className="text-sm text-red-600">{metrics.error}</p>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <BarChart title="Revenue by Day" points={metrics.weeklySales} />
        <Card>
          <h3 className="text-lg font-semibold">Category Breakdown</h3>
          <div className="mt-4 space-y-3">
            {metrics.categoryBreakdown.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between text-sm">
                  <p className="text-[var(--color-text-muted)]">{item.category}</p>
                  <p className="font-semibold">{item.percent}%</p>
                </div>
                <div className="mt-1 h-2 rounded-full bg-[var(--color-surface-alt)]">
                  <div className="h-2 rounded-full bg-[var(--color-brand)]" style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h3 className="text-lg font-semibold">Order Status Mix</h3>
          <ul className="mt-4 space-y-2 text-sm text-[var(--color-text-muted)]">
            {metrics.statusMix.map((item) => (
              <li key={item.label} className="flex justify-between">
                <span>{item.label}</span>
                <span className="font-semibold">{item.value}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Time Window Performance</h3>
          <ul className="mt-4 space-y-2 text-sm text-[var(--color-text-muted)]">
            <li className="flex justify-between">
              <span>Today</span>
              <span className="font-semibold">{formatCurrency(metrics.revenueToday)}</span>
            </li>
            <li className="flex justify-between">
              <span>Last 7 Days</span>
              <span className="font-semibold">{formatCurrency(metrics.revenueWeek)}</span>
            </li>
            <li className="flex justify-between">
              <span>This Month</span>
              <span className="font-semibold">{formatCurrency(metrics.revenueMonth)}</span>
            </li>
          </ul>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Low Stock Alerts</h3>
          <div className="mt-4 space-y-2">
            {metrics.lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-xl bg-[var(--color-surface-alt)] px-3 py-2 text-sm">
                <span className="text-[var(--color-text-muted)]">{product.name}</span>
                <Badge tone="warning">{product.stock} left</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
