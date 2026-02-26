import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_10px_30px_rgba(10,20,40,0.06)]",
        className,
      )}
      {...props}
    />
  );
}
