import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  change: string;
}

export function StatCard({ label, value, change }: StatCardProps) {
  return (
    <Card>
      <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      <p className="mt-3 text-xs text-emerald-600">{change}</p>
    </Card>
  );
}
