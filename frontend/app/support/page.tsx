"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { authStorage } from "@/lib/auth";

export default function SupportPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", companyName: "", message: "" });
  const [message, setMessage] = useState("");
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    const user = authStorage.getUser();

    if (user?.role === "admin") {
      window.location.href = "/admin";
      return;
    }

    setCheckingAccess(false);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await apiRequest("/support", { method: "POST", body: form });
      setMessage("Support request submitted successfully.");
      setForm({ name: "", email: "", phone: "", companyName: "", message: "" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to submit support request");
    }
  };

  if (checkingAccess) {
    return <main className="container" style={{ padding: "28px 0 60px" }}>Loading...</main>;
  }

  return (
    <main className="container" style={{ padding: "28px 0 60px" }}>
      <section className="grid support-grid">
        <div className="panel" style={{ padding: "1.6rem", display: "grid", gap: "1rem" }}>
          <div className="eyebrow">Support and contact</div>
          <h1 className="page-title-lg">Talk to our team</h1>
          <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
            Need help choosing the right plan, want a product walkthrough, or have an installation question? Share a few details and our team will get back to you with the right next steps.
          </p>
          <div className="panel" style={{ padding: "1.1rem", borderRadius: 20, background: "rgba(255,255,255,0.62)", display: "grid", gap: 10 }}>
            <strong>What you can contact us for</strong>
            <span style={{ color: "var(--muted)" }}>Plan selection and pricing guidance</span>
            <span style={{ color: "var(--muted)" }}>Installation and onboarding support</span>
            <span style={{ color: "var(--muted)" }}>Product demos and technical questions</span>
          </div>
        </div>

        <div className="panel" style={{ padding: "1.6rem" }}>
          <form onSubmit={handleSubmit} className="grid form-grid-two">
            {[["name", "Name", "text"],["email", "Email", "email"],["phone", "Phone", "text"],["companyName", "Company name", "text"]].map(([key, label, type]) => (
              <label className="field" key={key}>
                <span>{label}</span>
                <input type={type} value={form[key as keyof typeof form]} onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))} required={["name", "email"].includes(key)} />
              </label>
            ))}
            <label className="field" style={{ gridColumn: "1 / -1" }}>
              <span>Message</span>
              <textarea rows={6} value={form.message} onChange={(e) => setForm((current) => ({ ...current, message: e.target.value }))} required />
            </label>
            {message ? <p style={{ color: "var(--accent-deep)", gridColumn: "1 / -1", margin: 0 }}>{message}</p> : null}
            <div style={{ gridColumn: "1 / -1" }}>
              <button className="btn btn-primary">Submit request</button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
