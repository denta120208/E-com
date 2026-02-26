"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { SessionUser } from "@/lib/auth";

interface SessionContextValue {
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: SessionUser | null;
}) {
  const [user, setUser] = useState<SessionUser | null>(initialUser);
  const value = useMemo(() => ({ user, setUser }), [user]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}
