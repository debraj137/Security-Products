"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authStorage } from "@/lib/auth";
import { User } from "@/types";

export function Footer() {
  const year = new Date().getFullYear();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(authStorage.getUser());
  }, []);

  return (
    <footer style={{ padding: "18px 0 28px" }}>
      <div className="container panel" style={{ padding: "1.5rem", display: "grid", gap: "1.2rem" }}>
        <div className="footer-grid">
          <div style={{ display: "grid", gap: 10 }}>
            <strong style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem" }}>Sentinel AI Security</strong>
            <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>
              Smarter intruder detection plans for businesses that want clear alerts, faster response, and dependable site monitoring.
            </p>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <strong>Quick Links</strong>
            <Link href="/">Home</Link>
            <Link href="/#plans">Plans</Link>
            {user?.role !== "admin" ? <Link href="/support">Support</Link> : null}
            <Link href={user?.role === "admin" ? "/admin" : "/login"}>{user?.role === "admin" ? "Admin" : "Login"}</Link>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <strong>Contact</strong>
            <span style={{ color: "var(--muted)" }}>support@sentinelai.local</span>
            <span style={{ color: "var(--muted)" }}>+91 98765 43210</span>
            <span style={{ color: "var(--muted)" }}>Mon-Sat, 9:00 AM to 6:00 PM</span>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--line)", paddingTop: "1rem", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", color: "var(--muted)", fontSize: "0.95rem" }}>
          <span>{year} Sentinel AI Security. All rights reserved.</span>
          <span>Built for secure monitoring and controlled activation.</span>
        </div>
      </div>
    </footer>
  );
}
