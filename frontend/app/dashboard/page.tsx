"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StatCard } from "@/components/StatCard";
import { apiRequest } from "@/lib/api";
import { authStorage } from "@/lib/auth";
import { Notification, Order, User } from "@/types";

type Payment = {
  _id: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string;
  paymentDate: string;
};

function CustomerDashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const purchaseStatus = searchParams.get("purchase");

  useEffect(() => {
    const token = authStorage.getToken();
    const storedUser = authStorage.getUser();
    setUser(storedUser);
    if (!token) return;

    Promise.all([
      apiRequest<Order[]>("/orders/mine", { token }),
      apiRequest<Payment[]>("/orders/payments", { token }),
      apiRequest<Notification[]>("/notifications", { token })
    ])
      .then(([ordersData, paymentsData, notificationsData]) => {
        setOrders(ordersData);
        setPayments(paymentsData);
        setNotifications(notificationsData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load dashboard"));
  }, []);

  const activeOrders = orders.filter((order) => order.activationStatus === "active");

  return (
    <ProtectedRoute role="customer">
      <main className="container" style={{ padding: "28px 0 60px" }}>
        <div className="eyebrow">Customer dashboard</div>
        <h1 className="page-title">Welcome back{user ? `, ${user.fullName}` : ""}</h1>
        {purchaseStatus === "success" ? (
          <div className="panel" style={{ padding: "1rem 1.2rem", marginBottom: 18, background: "rgba(31, 138, 76, 0.10)", borderColor: "rgba(31, 138, 76, 0.24)" }}>
            Your order has been placed successfully and is now waiting for admin activation.
          </div>
        ) : null}
        {error ? <p style={{ color: "var(--danger)" }}>{error}</p> : null}
        <div className="grid customer-stats-grid" style={{ marginBottom: 22 }}>
          <StatCard title="Purchased products" value={orders.length} />
          <StatCard title="Active products" value={activeOrders.length} subtitle={activeOrders.length ? "Ready for usage" : "Awaiting admin activation"} />
          <StatCard title="Payments recorded" value={payments.length} />
          <StatCard title="Notifications" value={notifications.length} />
        </div>

        <section className="grid dashboard-split">
          <div className="panel" style={{ padding: "1.2rem" }}>
            <h2 style={{ marginTop: 0 }}>Orders and activation status</h2>
            <div className="grid">
              {orders.map((order) => (
                <div key={order._id} style={{ padding: "1rem", border: "1px solid var(--line)", borderRadius: 18, display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <strong>{order.productId.name}</strong>
                    <span className={`status-badge status-${order.activationStatus}`}>{order.activationStatus}</span>
                  </div>
                  <p style={{ color: "var(--muted)" }}>Order status: {order.orderStatus} | Payment: {order.paymentStatus}</p>
                  <p>{order.activationStatus === "active" ? "Access granted. Your product usage area is unlocked." : "Awaiting admin activation before product usage is enabled."}</p>
                  {order.activationStatus === "active" ? (
                    <Link href="/dashboard/access" className="btn btn-primary" style={{ justifySelf: "start" }}>
                      Open Product Access
                    </Link>
                  ) : null}
                </div>
              ))}
              {!orders.length ? <p style={{ color: "var(--muted)" }}>No orders yet. Visit the products page to purchase a plan.</p> : null}
            </div>
          </div>

          <div className="grid">
            <div className="panel" style={{ padding: "1.2rem" }}>
              <h2 style={{ marginTop: 0 }}>Profile summary</h2>
              {user ? <div style={{ color: "var(--muted)", display: "grid", gap: 8 }}><span>{user.email}</span><span>{user.phone}</span><span>{user.address}</span><span>{user.companyName || "Individual account"}</span></div> : null}
            </div>
            <div className="panel" style={{ padding: "1.2rem" }}>
              <h2 style={{ marginTop: 0 }}>Recent notifications</h2>
              <div className="grid">
                {notifications.slice(0, 5).map((item) => (
                  <div key={item._id} style={{ borderBottom: "1px solid var(--line)", paddingBottom: 10 }}>
                    <strong>{item.title}</strong>
                    <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>{item.message}</p>
                  </div>
                ))}
                {!notifications.length ? <p style={{ color: "var(--muted)" }}>No notifications yet.</p> : null}
              </div>
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}

export default function CustomerDashboardPage() {
  return (
    <Suspense fallback={<main className="container" style={{ padding: "28px 0 60px" }}><p style={{ color: "var(--muted)" }}>Loading dashboard...</p></main>}>
      <CustomerDashboardContent />
    </Suspense>
  );
}




