"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminNotificationsPage() {
  const [subject, setSubject] = useState("Your order has been confirmed");
  const [headline, setHeadline] = useState("Thanks for your purchase!");
  const [body, setBody] = useState(
    "We have received your order and will send tracking details as soon as it ships.",
  );
  const [message, setMessage] = useState("");

  const save = () => {
    setMessage("Template updated successfully.");
  };

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold">Notification Templates</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Configure email alert templates and preview confirmation layouts.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold">Template Editor</h2>
          <div>
            <label htmlFor="subject" className="mb-1 block text-sm font-medium">
              Subject
            </label>
            <Input id="subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
          </div>
          <div>
            <label htmlFor="headline" className="mb-1 block text-sm font-medium">
              Headline
            </label>
            <Input id="headline" value={headline} onChange={(event) => setHeadline(event.target.value)} />
          </div>
          <div>
            <label htmlFor="body" className="mb-1 block text-sm font-medium">
              Message
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className="min-h-32 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm outline-none focus:border-[var(--color-brand)]"
            />
          </div>
          <Button onClick={save}>Save Template</Button>
          {message ? <p className="text-sm text-[var(--color-text-muted)]">{message}</p> : null}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Email Preview</h2>
          <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
            <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">{subject}</p>
            <h3 className="mt-3 text-2xl font-semibold">{headline}</h3>
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">{body}</p>
            <button type="button" className="mt-5 rounded-xl bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white">
              Track your order
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
