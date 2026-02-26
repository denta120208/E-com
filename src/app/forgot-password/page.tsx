"use client";

import { useState } from "react";
import { AuthShell } from "@/components/forms/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submit = () => {
    if (!email.includes("@")) {
      setMessage("Please provide a valid email.");
      return;
    }
    setMessage("Password reset link sent. Please check your inbox.");
  };

  return (
    <AuthShell
      title="Reset Password"
      subtitle="We will send a secure reset link to your email."
      footerText="Remember your password?"
      footerLinkText="Back to login"
      footerHref="/login"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <Button className="w-full" onClick={submit}>
          Send Reset Link
        </Button>
        {message ? <p className="text-sm text-[var(--color-text-muted)]">{message}</p> : null}
      </div>
    </AuthShell>
  );
}
