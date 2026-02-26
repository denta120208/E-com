import { BarChart } from "@/components/admin/bar-chart";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { categoryBreakdown, products, salesOverview } from "@/lib/mock-data";

export default function AdminAnalyticsPage() {
  const lowStock = products.filter((product) => product.stock < 15);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold">Analytics & Reports</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Revenue trends, category breakdowns, sales channels, and low stock alerts.
        </p>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <BarChart title="Revenue by Day" points={salesOverview} />
        <Card>
          <h3 className="text-lg font-semibold">Category Breakdown</h3>
          <div className="mt-4 space-y-3">
            {categoryBreakdown.map((item) => (
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
          <h3 className="text-lg font-semibold">Sales Channel Mix</h3>
          <ul className="mt-4 space-y-2 text-sm text-[var(--color-text-muted)]">
            <li className="flex justify-between">
              <span>Web Store</span>
              <span className="font-semibold">62%</span>
            </li>
            <li className="flex justify-between">
              <span>Mobile App</span>
              <span className="font-semibold">24%</span>
            </li>
            <li className="flex justify-between">
              <span>Marketplace</span>
              <span className="font-semibold">14%</span>
            </li>
          </ul>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Time Window Performance</h3>
          <ul className="mt-4 space-y-2 text-sm text-[var(--color-text-muted)]">
            <li className="flex justify-between">
              <span>Today</span>
              <span className="font-semibold">$13,210</span>
            </li>
            <li className="flex justify-between">
              <span>This Week</span>
              <span className="font-semibold">$76,490</span>
            </li>
            <li className="flex justify-between">
              <span>This Month</span>
              <span className="font-semibold">$182,910</span>
            </li>
          </ul>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Low Stock Alerts</h3>
          <div className="mt-4 space-y-2">
            {lowStock.map((product) => (
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
