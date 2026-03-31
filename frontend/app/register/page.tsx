"use client";

import Link from "next/link";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { authStorage } from "@/lib/auth";
import { User } from "@/types";

type AuthResponse = { token: string; user: User };

function RegisterContent() {
  const plan = useSearchParams().get("plan");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    companyName: "",
    gstDetails: "",
    installationLocation: "",
    referralSource: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedPlanMessage = useMemo(() => (plan ? "Your selected plan will be ready for checkout after registration." : "Create your account to continue."), [plan]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest<AuthResponse>("/auth/register", { method: "POST", body: form });
      authStorage.setSession(data.token, data.user);
      window.location.href = plan ? `/products?selected=${plan}` : "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ padding: "28px 0 60px" }}>
      <div className="panel" style={{ padding: "1.5rem" }}>
        <div className="eyebrow">Customer onboarding</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.4rem", marginTop: 0 }}>Register</h1>
        <p style={{ color: "var(--muted)", marginBottom: 10 }}>{selectedPlanMessage}</p>
        <p style={{ marginTop: 0, color: "var(--muted)" }}>
          Already have an account? <Link href="/login" style={{ color: "var(--accent-deep)" }}>Login</Link>
        </p>
        <form onSubmit={handleSubmit} className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {[ ["fullName", "Full name", "text"], ["email", "Email", "email"], ["phone", "Phone number", "text"], ["password", "Password", "password"], ["confirmPassword", "Confirm password", "password"], ["address", "Address", "text"], ["companyName", "Company name", "text"], ["gstDetails", "GST/business details", "text"], ["installationLocation", "Installation location", "text"], ["referralSource", "Referral/source", "text"] ].map(([key, label, type]) => (
            <label className="field" key={key}>
              <span>{label}</span>
              <input
                type={type}
                required={["fullName", "email", "phone", "password", "confirmPassword", "address", "installationLocation"].includes(key)}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))}
              />
            </label>
          ))}
          {error ? <div style={{ color: "var(--danger)", gridColumn: "1 / -1" }}>{error}</div> : null}
          <div style={{ gridColumn: "1 / -1" }}>
            <button className="btn btn-primary" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<main className="container" style={{ padding: "28px 0 60px" }}><p style={{ color: "var(--muted)" }}>Loading registration...</p></main>}>
      <RegisterContent />
    </Suspense>
  );
}

