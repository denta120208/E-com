import type { ReactNode } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footerText: string;
  footerLinkText: string;
  footerHref: string;
}

export function AuthShell({
  title,
  subtitle,
  children,
  footerText,
  footerHref,
  footerLinkText,
}: AuthShellProps) {
  return (
    <section className="mx-auto w-full max-w-md py-12">
      <Card>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">{subtitle}</p>
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-sm text-[var(--color-text-muted)]">
          {footerText}{" "}
          <Link href={footerHref} className="font-semibold text-[var(--color-brand)]">
            {footerLinkText}
          </Link>
        </p>
      </Card>
    </section>
  );
}
