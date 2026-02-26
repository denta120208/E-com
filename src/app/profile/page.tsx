"use client";

import { useState } from "react";
import { useSession } from "@/components/providers/session-provider";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
  const { user, setUser } = useSession();
  const [name, setName] = useState(user?.name ?? "Customer Demo");
  const [email, setEmail] = useState(user?.email ?? "customer@ecom.local");
  const [address, setAddress] = useState("7 Cherry Lane, Seattle, WA");
  const [message, setMessage] = useState("");

  const save = () => {
    if (user) {
      setUser({ ...user, name, email });
    }
    setMessage("Profile updated successfully.");
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Profile" }]} />
      <section>
        <h1 className="text-3xl font-semibold">My Profile</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Manage your personal details and shipping address.
        </p>
      </section>
      <Card className="max-w-2xl space-y-4">
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
          <Input id="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div>
          <label htmlFor="address" className="mb-1 block text-sm font-medium">
            Address
          </label>
          <Input id="address" value={address} onChange={(event) => setAddress(event.target.value)} />
        </div>
        <Button onClick={save}>Save Profile</Button>
        {message ? <p className="text-sm text-[var(--color-text-muted)]">{message}</p> : null}
      </Card>
    </div>
  );
}
