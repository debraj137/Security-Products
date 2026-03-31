"use client";

import { FormEvent, useState } from "react";
import { apiRequest } from "@/lib/api";

export default function ResetPasswordPage() {
  const [form, setForm] = useState({ token: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const data = await apiRequest<{ message: string }>("/auth/reset-password", { method: "POST", body: form });
      setMessage(data.message);
      setForm({ token: "", password: "", confirmPassword: "" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to reset password");
    }
  };

  return (
    <main className="container" style={{ padding: "28px 0 60px" }}>
      <div className="panel" style={{ padding: "1.5rem", maxWidth: 560, margin: "0 auto" }}>
        <div className="eyebrow">Reset password</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.4rem", marginTop: 0 }}>Set a new password</h1>
        <form onSubmit={handleSubmit} className="grid">
          <label className="field"><span>Reset token</span><input value={form.token} onChange={(e) => setForm((current) => ({ ...current, token: e.target.value }))} required /></label>
          <label className="field"><span>New password</span><input type="password" value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} required /></label>
          <label className="field"><span>Confirm password</span><input type="password" value={form.confirmPassword} onChange={(e) => setForm((current) => ({ ...current, confirmPassword: e.target.value }))} required /></label>
          <button className="btn btn-primary">Reset password</button>
        </form>
        {message ? <p style={{ color: "var(--accent-deep)" }}>{message}</p> : null}
      </div>
    </main>
  );
}
