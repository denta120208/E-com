"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import type { Role, UserProfile } from "@/lib/types";
import { formatDate, toTitleCase } from "@/lib/utils";

const roleOptions: Role[] = ["admin", "seller", "staff", "cs", "customer"];

export default function AdminUsersPage() {
  const [records, setRecords] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const result = (await response.json().catch(() => null)) as
        | { items?: UserProfile[]; message?: string }
        | null;

      if (!response.ok || !result?.items) {
        throw new Error(result?.message ?? "Failed to load users");
      }

      setRecords(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const saveRole = async (user: UserProfile) => {
    setSavingId(user.id);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, role: user.role }),
      });
      const result = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(result?.message ?? "Failed to update role");
      }

      setMessage(`Role updated for ${user.email}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
      await loadUsers();
    } finally {
      setSavingId(null);
    }
  };

  const roleSummary = useMemo(() => {
    const counts = new Map<Role, number>();
    for (const role of roleOptions) {
      counts.set(role, 0);
    }
    for (const user of records) {
      counts.set(user.role, (counts.get(user.role) ?? 0) + 1);
    }
    return counts;
  }, [records]);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold">User & Role Management</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Manage user roles directly from real Supabase profile data.
        </p>
      </section>

      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Card className="overflow-auto">
        {loading ? <p className="text-sm text-[var(--color-text-muted)]">Loading users...</p> : null}
        {!loading && records.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">No users found in profiles table.</p>
        ) : null}

        {!loading && records.length > 0 ? (
          <table className="w-full min-w-[740px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                <th className="pb-2 font-medium">User</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium">Joined</th>
                <th className="pb-2 font-medium">Address</th>
                <th className="pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((user) => (
                <tr key={user.id} className="border-b border-[var(--color-border)]">
                  <td className="py-3 font-medium">{user.name}</td>
                  <td className="py-3 text-[var(--color-text-muted)]">{user.email}</td>
                  <td className="py-3">
                    <Badge>{toTitleCase(user.role)}</Badge>
                  </td>
                  <td className="py-3 text-[var(--color-text-muted)]">{formatDate(user.joinedAt)}</td>
                  <td className="py-3 text-[var(--color-text-muted)]">{user.address}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Select
                        value={user.role}
                        className="h-9 min-w-[120px]"
                        onChange={(event) =>
                          setRecords((previous) =>
                            previous.map((record) =>
                              record.id === user.id ? { ...record, role: event.target.value as Role } : record,
                            ),
                          )
                        }
                        disabled={savingId === user.id}
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {toTitleCase(role)}
                          </option>
                        ))}
                      </Select>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => void saveRole(user)}
                        disabled={savingId === user.id}
                      >
                        {savingId === user.id ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Role Distribution</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {roleOptions.map((role) => (
            <Badge key={role}>
              {toTitleCase(role)}: {roleSummary.get(role) ?? 0}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}
