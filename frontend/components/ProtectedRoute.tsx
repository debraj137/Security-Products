"use client";

import { useEffect, useState } from "react";
import { authStorage } from "@/lib/auth";
import { User } from "@/types";

export function ProtectedRoute({ children, role }: { children: React.ReactNode; role: "customer" | "admin" }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = authStorage.getUser();
    if (!storedUser || storedUser.role !== role) {
      window.location.href = "/login";
      return;
    }

    setUser(storedUser);
    setLoading(false);
  }, [role]);

  if (loading || !user) {
    return <div className="container" style={{ padding: "40px 0" }}>Checking access...</div>;
  }

  return <>{children}</>;
}
