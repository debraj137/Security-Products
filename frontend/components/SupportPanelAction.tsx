"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authStorage } from "@/lib/auth";
import { User } from "@/types";

export function SupportPanelAction() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(authStorage.getUser());
  }, []);

  if (user?.role === "admin") {
    return null;
  }

  return (
    <div style={{ paddingTop: 6 }}>
      <Link href="/support" className="btn btn-primary">Contact Support</Link>
    </div>
  );
}
