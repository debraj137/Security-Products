"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const data = await apiRequest<{ message: string; resetToken: string }>("/auth/forgot-password", {
        method: "POST",
        body: { email }
      });
      setMessage(data.message);
      setToken(data.resetToken);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to request password reset");
      setToken("");
    }
  };

  return (
    <main className="container" style={{ padding: "28px 0 60px" }}>
      <div className="panel" style={{ padding: "1.5rem", maxWidth: 560, margin: "0 auto" }}>
        <div className="eyebrow">Password recovery</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.4rem", marginTop: 0 }}>Forgot password</h1>
        <form onSubmit={handleSubmit} className="grid">
          <label className="field"><span>Email</span><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required /></label>
          <button className="btn btn-primary">Generate reset token</button>
        </form>
        {message ? <p style={{ color: "var(--accent-deep)" }}>{message}</p> : null}
        {token ? (
          <p>
            Reset token: <strong>{token}</strong>. Continue to <Link href="/reset-password">reset password</Link>.
          </p>
        ) : null}
      </div>
    </main>
  );
}
