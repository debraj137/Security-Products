"use client";

import { FormEvent, useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StatCard } from "@/components/StatCard";
import { apiRequest } from "@/lib/api";
import { authStorage } from "@/lib/auth";
import { Order, Product, User } from "@/types";

type DashboardData = {
  totalCustomers: number;
  totalPurchases: number;
  revenueSummary: number;
  pendingActivations: number;
  activeCustomers: number;
  productWiseSales: { _id: string; sales: number; revenue: number }[];
  recentRegistrations: User[];
  recentOrders: (Order & { customerId: User; productId: Product })[];
};

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [orders, setOrders] = useState<(Order & { customerId: User; productId: Product })[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [supportRequests, setSupportRequests] = useState<{ _id: string; name: string; email: string; message: string; status: string }[]>([]);
  const [error, setError] = useState("");
  const [savingProductId, setSavingProductId] = useState<string | null>(null);
  const [productFeedback, setProductFeedback] = useState<Record<string, { type: "success" | "error"; message: string }>>({});

  const load = async () => {
    const token = authStorage.getToken();
    if (!token) return;

    try {
      const [dashboardData, ordersData, supportData, productsData] = await Promise.all([
        apiRequest<DashboardData>("/admin/dashboard", { token }),
        apiRequest<(Order & { customerId: User; productId: Product })[]>('/admin/orders', { token }),
        apiRequest<{ _id: string; name: string; email: string; message: string; status: string }[]>('/admin/support-requests', { token }),
        apiRequest<Product[]>('/products', { token })
      ]);
      setDashboard(dashboardData);
      setOrders(ordersData);
      setSupportRequests(supportData);
      setProducts(productsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load admin dashboard");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeActivation = async (orderId: string, activationStatus: string) => {
    const token = authStorage.getToken();
    if (!token) return;

    await apiRequest(`/admin/orders/${orderId}/activate`, {
      method: "PATCH",
      token,
      body: { activationStatus, activationNotes: `Updated by admin to ${activationStatus}.` }
    });

    load();
  };

  const updateProduct = async (event: FormEvent<HTMLFormElement>, productId: string) => {
    event.preventDefault();
    const token = authStorage.getToken();
    if (!token) return;

    setSavingProductId(productId);
    setProductFeedback((current) => {
      const next = { ...current };
      delete next[productId];
      return next;
    });

    try {
      const form = new FormData(event.currentTarget);
      const features = String(form.get("features") || "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      await apiRequest(`/products/${productId}`, {
        method: "PATCH",
        token,
        body: {
          name: String(form.get("name") || ""),
          description: String(form.get("description") || ""),
          price: Number(form.get("price") || 0),
          isActive: form.get("isActive") === "true",
          features
        }
      });

      setProductFeedback((current) => ({
        ...current,
        [productId]: { type: "success", message: "Product saved successfully." }
      }));
      await load();
    } catch (err) {
      setProductFeedback((current) => ({
        ...current,
        [productId]: {
          type: "error",
          message: err instanceof Error ? err.message : "Unable to save product."
        }
      }));
    } finally {
      setSavingProductId(null);
    }
  };

  return (
    <ProtectedRoute role="admin">
      <main className="container" style={{ padding: "28px 0 60px" }}>
        <div className="eyebrow">Admin command center</div>
        <h1 className="page-title">Sales and activation dashboard</h1>
        {error ? <p style={{ color: "var(--danger)" }}>{error}</p> : null}
        {dashboard ? (
          <>
            <div className="grid stats-grid" style={{ marginBottom: 22 }}>
              <StatCard title="Customers" value={dashboard.totalCustomers} />
              <StatCard title="Purchases" value={dashboard.totalPurchases} />
              <StatCard title="Revenue" value={`INR ${dashboard.revenueSummary}`} />
              <StatCard title="Pending activations" value={dashboard.pendingActivations} />
              <StatCard title="Active customers" value={dashboard.activeCustomers} />
            </div>

            <section className="grid admin-split">
              <div className="grid">
                <div className="panel" style={{ padding: "1.2rem" }}>
                  <h2 style={{ marginTop: 0 }}>Orders</h2>
                  <div className="grid">
                    {orders.map((order) => (
                      <div key={order._id} style={{ border: "1px solid var(--line)", borderRadius: 18, padding: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                          <strong>{order.customerId?.fullName} | {order.productId?.name}</strong>
                          <span className={`status-badge status-${order.activationStatus}`}>{order.activationStatus}</span>
                        </div>
                        <p style={{ color: "var(--muted)" }}>Payment: {order.paymentStatus} | Order: {order.orderStatus}</p>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <button className="btn btn-primary" onClick={() => changeActivation(order._id, "active")}>Activate</button>
                          <button className="btn btn-secondary" onClick={() => changeActivation(order._id, "inactive")}>Mark Inactive</button>
                          <button className="btn btn-secondary" onClick={() => changeActivation(order._id, "suspended")}>Suspend</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel" style={{ padding: "1.2rem" }}>
                  <h2 style={{ marginTop: 0 }}>Manage products</h2>
                  <div className="grid">
                    {products.map((product) => {
                      const feedback = productFeedback[product._id];
                      const isSaving = savingProductId === product._id;

                      return (
                        <form key={product._id} onSubmit={(event) => updateProduct(event, product._id)} className="panel" style={{ padding: "1rem", borderRadius: 18 }}>
                          <div className="grid">
                            <label className="field"><span>Name</span><input name="name" defaultValue={product.name} required /></label>
                            <label className="field"><span>Description</span><textarea name="description" rows={3} defaultValue={product.description} required /></label>
                            <label className="field"><span>Price</span><input name="price" type="number" defaultValue={product.price} required /></label>
                            <label className="field"><span>Status</span><select name="isActive" defaultValue={String(product.isActive)}><option value="true">Active</option><option value="false">Inactive</option></select></label>
                            <label className="field"><span>Features, one per line</span><textarea name="features" rows={4} defaultValue={product.features.join("\n")} required /></label>
                            {feedback ? (
                              <p style={{ margin: 0, color: feedback.type === "success" ? "var(--success)" : "var(--danger)" }}>
                                {feedback.message}
                              </p>
                            ) : null}
                            <button className="btn btn-primary" disabled={isSaving}>
                              {isSaving ? "Saving..." : "Save product"}
                            </button>
                          </div>
                        </form>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid">
                <div className="panel" style={{ padding: "1.2rem" }}>
                  <h2 style={{ marginTop: 0 }}>Product-wise sales</h2>
                  <div className="grid">
                    {dashboard.productWiseSales.map((item) => (
                      <div key={item._id} style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <span>{item._id}</span>
                        <strong>{item.sales} sales | INR {item.revenue}</strong>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="panel" style={{ padding: "1.2rem" }}>
                  <h2 style={{ marginTop: 0 }}>Support requests</h2>
                  <div className="grid">
                    {supportRequests.map((item) => (
                      <div key={item._id} style={{ borderBottom: "1px solid var(--line)", paddingBottom: 10 }}>
                        <strong>{item.name}</strong>
                        <p style={{ margin: "4px 0", color: "var(--muted)" }}>{item.email}</p>
                        <p style={{ margin: 0 }}>{item.message}</p>
                      </div>
                    ))}
                    {!supportRequests.length ? <p style={{ color: "var(--muted)" }}>No support requests submitted.</p> : null}
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </main>
    </ProtectedRoute>
  );
}
