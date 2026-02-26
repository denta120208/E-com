export default function Loading() {
  return (
    <div className="grid gap-4 py-8 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="h-72 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
        />
      ))}
    </div>
  );
}
