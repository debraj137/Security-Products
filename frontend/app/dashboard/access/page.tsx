"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiRequest } from "@/lib/api";
import { authStorage } from "@/lib/auth";
import { Order } from "@/types";

export default function ProductAccessPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) return;

    apiRequest<Order[]>("/orders/accessible-products", { token })
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load accessible products"));
  }, []);

  return (
    <ProtectedRoute role="customer">
      <main className="container" style={{ padding: "28px 0 60px" }}>
        <div className="eyebrow">Product access</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", marginTop: 0 }}>Activated products</h1>
        {error ? <p style={{ color: "var(--danger)" }}>{error}</p> : null}
        <div className="grid">
          {orders.map((order) => (
            <div key={order._id} className="panel" style={{ padding: "1.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <strong>{order.productId.name}</strong>
                <span className="status-badge status-active">active</span>
              </div>
              <p style={{ color: "var(--muted)" }}>{order.productId.description}</p>
              <ul style={{ paddingLeft: "1.1rem", color: "var(--muted)" }}>
                {order.productId.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              <p style={{ marginBottom: 0 }}>Usage area unlocked. Connect your real product workspace or deployment controls here.</p>
            </div>
          ))}
          {!orders.length ? (
            <div className="panel" style={{ padding: "1.2rem" }}>
              <p style={{ marginTop: 0 }}>No activated products yet.</p>
              <Link href="/dashboard" className="btn btn-secondary">Back to dashboard</Link>
            </div>
          ) : null}
        </div>
      </main>
    </ProtectedRoute>
  );
}
