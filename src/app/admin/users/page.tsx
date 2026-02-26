"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { users } from "@/lib/mock-data";
import type { Role, UserProfile } from "@/lib/types";
import { formatDate, toTitleCase } from "@/lib/utils";

const roleOptions: Role[] = ["admin", "seller", "staff", "cs", "customer"];

export default function AdminUsersPage() {
  const [records, setRecords] = useState<UserProfile[]>(users);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold">User & Role Management</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Assign roles, inspect account status, and monitor multi-account sellers.
        </p>
      </section>

      <Card className="overflow-auto">
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
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {toTitleCase(role)}
                        </option>
                      ))}
                    </Select>
                    <Button variant="secondary" size="sm">
                      Save
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Multi-Account Seller View</h2>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Seller Team A currently manages 3 storefront accounts and 147 active SKUs.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>Seller A - Main</Badge>
          <Badge>Seller A - Outlet</Badge>
          <Badge>Seller A - Wholesale</Badge>
        </div>
      </Card>
    </div>
  );
}
