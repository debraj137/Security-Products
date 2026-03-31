"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authStorage } from "@/lib/auth";
import { User } from "@/types";

export function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(authStorage.getUser());
  }, []);

  const logout = () => {
    authStorage.clear();
    window.location.href = "/";
  };

  return (
    <header style={{ padding: "18px 0", position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(12px)" }}>
      <div className="container panel header-shell">
        <Link href="/" className="header-brand">
          Sentinel AI Security
        </Link>
        <nav className="header-nav">
          <Link href="/#plans">Plans</Link>
          <Link href="/#why-us">Why Us</Link>
          {user?.role !== "admin" ? <Link href="/support">Support</Link> : null}
          {user ? (
            <>
              <Link href={user.role === "admin" ? "/admin" : "/dashboard"}>{user.role === "admin" ? "Admin" : "Dashboard"}</Link>
              <button className="btn btn-secondary" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link className="btn btn-primary" href="/register">Get Started</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
