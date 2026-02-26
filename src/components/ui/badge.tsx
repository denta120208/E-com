import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "default" | "success" | "warning" | "danger";

const toneClass: Record<BadgeTone, string> = {
  default: "bg-[var(--color-surface-alt)] text-[var(--color-text)]",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        toneClass[tone],
        className,
      )}
      {...props}
    />
  );
}
