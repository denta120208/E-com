"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/forms/auth-shell";
import { useSession } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SessionUser } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const result = (await response.json()) as { message: string; user?: SessionUser };
      if (!response.ok) {
        setMessage(result.message || "Registration failed");
        return;
      }
      if (result.user) {
        setUser(result.user);
      }
      setMessage("Account created. Check your email to verify your account.");
      setName("");
      setEmail("");
      setPassword("");
      router.push("/profile");
      router.refresh();
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create Account"
      subtitle="Register with your email and secure password."
      footerText="Already have an account?"
      footerLinkText="Login"
      footerHref="/login"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <Input id="name" value={name} onChange={(event) => setName(event.target.value)} />
        </div>
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
        <Button className="w-full" onClick={submit} disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </Button>
        {message ? (
          <p className="rounded-xl bg-[var(--color-surface-alt)] p-3 text-sm text-[var(--color-text-muted)]">
            {message}
          </p>
        ) : null}
      </div>
    </AuthShell>
  );
}
