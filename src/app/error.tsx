"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Keep this for debugging while wiring real error tracking.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl py-16">
      <Card className="text-center">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Please retry the action. If the issue persists, check API handlers.
        </p>
        <Button className="mt-5" onClick={reset}>
          Retry
        </Button>
      </Card>
    </div>
  );
}
