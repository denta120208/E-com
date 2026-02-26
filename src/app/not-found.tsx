import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-20">
      <Card className="text-center">
        <p className="text-sm uppercase tracking-wide text-[var(--color-text-muted)]">404</p>
        <h1 className="mt-2 text-3xl font-semibold">Page Not Found</h1>
        <p className="mt-3 text-sm text-[var(--color-text-muted)]">
          The requested page does not exist or has been moved.
        </p>
        <Link href="/" className="mt-6 inline-block">
          <Button>Back to Home</Button>
        </Link>
      </Card>
    </div>
  );
}
