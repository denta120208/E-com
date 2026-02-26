import { Card } from "@/components/ui/card";
import type { SalesPoint } from "@/lib/types";

interface BarChartProps {
  title: string;
  points: SalesPoint[];
}

export function BarChart({ title, points }: BarChartProps) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);

  return (
    <Card>
      <h3 className="text-base font-semibold">{title}</h3>
      <div className="mt-4 space-y-3">
        {points.map((point) => (
          <div key={point.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-text-muted)]">{point.label}</span>
              <span className="font-semibold">{point.value.toLocaleString()}</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--color-surface-alt)]">
              <div
                className="h-2 rounded-full bg-[var(--color-brand)] transition-all"
                style={{ width: `${(point.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
