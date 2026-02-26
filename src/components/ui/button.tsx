import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-strong)] focus-visible:outline-[var(--color-brand)]",
  secondary:
    "bg-[var(--color-surface-alt)] text-[var(--color-text)] hover:bg-[var(--color-border)] focus-visible:outline-[var(--color-brand)]",
  ghost:
    "bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] focus-visible:outline-[var(--color-brand)]",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition focus-visible:outline focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
