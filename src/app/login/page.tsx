"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/forms/auth-shell";
import { useSession } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SessionUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const nextPath = searchParams.get("next") || "/";

  const submit = async () => {
    if (!email || !password) {
      setMessage("Please enter email and password.");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = (await response.json()) as { message: string; user?: SessionUser };
      if (!response.ok || !result.user) {
        setMessage(result.message || "Login failed");
        return;
      }
      setUser(result.user);
      router.push(nextPath);
      router.refresh();
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Login to manage your orders, addresses, and wishlist."
      footerText="New to EComPrime?"
      footerLinkText="Create account"
      footerHref="/register"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <Link href="/forgot-password" className="text-sm text-[var(--color-brand)]">
            Forgot password?
          </Link>
          <Button onClick={submit} disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>
        </div>
        {message ? <p className="text-sm text-[var(--color-text-muted)]">{message}</p> : null}
        <p className="text-xs text-[var(--color-text-muted)]">
          Tip: use an email containing &quot;admin&quot; to access the admin panel in demo mode.
        </p>
      </div>
    </AuthShell>
  );
}
