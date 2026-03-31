"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authStorage } from "@/lib/auth";
import { User } from "@/types";

export function HeroActions() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(authStorage.getUser());
  }, []);

  const secondaryHref =
    user?.role === "customer"
      ? "/dashboard"
      : user?.role === "admin"
        ? "/admin"
        : "/register";

  const secondaryLabel =
    user?.role === "customer"
      ? "Go to Dashboard"
      : user?.role === "admin"
        ? "Open Admin Dashboard"
        : "Create Customer Account";

  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
      <Link href="#plans" className="btn btn-primary">
        Explore Plans
      </Link>
      <Link href={secondaryHref} className="btn btn-secondary">
        {secondaryLabel}
      </Link>
    </div>
  );
}
