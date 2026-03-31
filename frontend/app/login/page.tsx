"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { authStorage } from "@/lib/auth";
import { User } from "@/types";

type AuthResponse = { token: string; user: User };

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest<AuthResponse>("/auth/login", { method: "POST", body: { email, password } });
      authStorage.setSession(data.token, data.user);
      window.location.href = data.user.role === "admin" ? "/admin" : "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ padding: "28px 0 60px" }}>
      <div className="panel" style={{ padding: "1.5rem", maxWidth: 520, margin: "0 auto" }}>
        <div className="eyebrow">Secure access</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.4rem", marginTop: 0 }}>Login</h1>
        <form onSubmit={handleSubmit} className="grid">
          <label className="field"><span>Email</span><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required /></label>
          <label className="field"><span>Password</span><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required /></label>
          {error ? <div style={{ color: "var(--danger)" }}>{error}</div> : null}
          <button className="btn btn-primary" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
          <Link href="/forgot-password" style={{ color: "var(--accent-deep)" }}>Forgot password?</Link>
        </form>
      </div>
    </main>
  );
}
