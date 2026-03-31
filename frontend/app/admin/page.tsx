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

type SupportRequest = {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: string;
};

type ManualOrderResponse = {
  order: Order & { customerId: User; productId: Product; placedBy?: User };
  customer: User;
  createdNewCustomer: boolean;
  setupResetToken: string | null;
};

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [orders, setOrders] = useState<(Order & { customerId: User; productId: Product; placedBy?: User })[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [error, setError] = useState("");
  const [savingProductId, setSavingProductId] = useState<string | null>(null);
  const [purchaseMode, setPurchaseMode] = useState<"existing" | "new">("existing");
  const [submittingPurchase, setSubmittingPurchase] = useState(false);
  const [purchaseFeedback, setPurchaseFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [productFeedback, setProductFeedback] = useState<Record<string, { type: "success" | "error"; message: string }>>({});

  const load = async () => {
    const token = authStorage.getToken();
    if (!token) return;

    try {
      setError("");
      const [dashboardData, ordersData, supportData, productsData, customersData] = await Promise.all([
        apiRequest<DashboardData>("/admin/dashboard", { token }),
        apiRequest<(Order & { customerId: User; productId: Product; placedBy?: User })[]>("/admin/orders", { token }),
        apiRequest<SupportRequest[]>("/admin/support-requests", { token }),
        apiRequest<Product[]>("/products", { token }),
        apiRequest<User[]>("/admin/customers", { token })
      ]);
      setDashboard(dashboardData);
      setOrders(ordersData);
      setSupportRequests(supportData);
      setProducts(productsData);
      setCustomers(customersData);
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

  const submitManualOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = authStorage.getToken();
    if (!token) return;
    const formElement = event.currentTarget;

    setSubmittingPurchase(true);
    setPurchaseFeedback(null);

    try {
      const form = new FormData(event.currentTarget);
      const mode = String(form.get("customerMode") || "existing") as "existing" | "new";
      const body: Record<string, unknown> = {
        productId: String(form.get("productId") || ""),
        paymentMethod: String(form.get("paymentMethod") || "manual"),
        markAsPaid: form.get("markAsPaid") === "yes"
      };

      if (mode === "existing") {
        body.existingCustomerId = String(form.get("existingCustomerId") || "");
      } else {
        body.fullName = String(form.get("fullName") || "");
        body.email = String(form.get("email") || "");
        body.phone = String(form.get("phone") || "");
        body.address = String(form.get("address") || "");
        body.companyName = String(form.get("companyName") || "");
        body.gstDetails = String(form.get("gstDetails") || "");
        body.installationLocation = String(form.get("installationLocation") || "");
        body.referralSource = "Admin assisted purchase";
      }

      const result = await apiRequest<ManualOrderResponse>("/admin/orders/manual", {
        method: "POST",
        token,
        body
      });

      const extra = result.createdNewCustomer && result.setupResetToken
        ? ` Setup token for customer login: ${result.setupResetToken}`
        : "";

      setPurchaseFeedback({
        type: "success",
        message: `Order created for ${result.customer.fullName}.${extra}`
      });
      formElement.reset();
      setPurchaseMode("existing");
      await load();
    } catch (err) {
      setPurchaseFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Unable to create order."
      });
    } finally {
      setSubmittingPurchase(false);
    }
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

            <section className="panel" style={{ padding: "1.2rem", marginBottom: 22 }}>
              <h2 style={{ marginTop: 0 }}>Create assisted purchase</h2>
              <p style={{ color: "var(--muted)", marginTop: 0 }}>Use this when the customer cannot register and buy on their own. You can attach the order to an existing customer or create the customer account during checkout.</p>
              <form className="grid" onSubmit={submitManualOrder}>
                <label className="field">
                  <span>Customer mode</span>
                  <select name="customerMode" value={purchaseMode} onChange={(event) => setPurchaseMode(event.target.value as "existing" | "new")}>
                    <option value="existing">Existing customer</option>
                    <option value="new">New customer</option>
                  </select>
                </label>

                {purchaseMode === "existing" ? (
                  <label className="field">
                    <span>Select customer</span>
                    <select name="existingCustomerId" required>
                      <option value="">Choose a customer</option>
                      {customers.map((customer) => (
                        <option key={customer._id || customer.id} value={customer._id || customer.id}>
                          {customer.fullName} ({customer.email})
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <>
                    <label className="field"><span>Full name</span><input name="fullName" required={purchaseMode === "new"} /></label>
                    <label className="field"><span>Email</span><input name="email" type="email" required={purchaseMode === "new"} /></label>
                    <label className="field"><span>Phone</span><input name="phone" required={purchaseMode === "new"} /></label>
                    <label className="field"><span>Address</span><textarea name="address" rows={3} required={purchaseMode === "new"} /></label>
                    <label className="field"><span>Company name</span><input name="companyName" /></label>
                    <label className="field"><span>GST details</span><input name="gstDetails" /></label>
                    <label className="field"><span>Installation location</span><input name="installationLocation" /></label>
                  </>
                )}

                <label className="field">
                  <span>Product</span>
                  <select name="productId" required>
                    <option value="">Choose a product</option>
                    {products.filter((product) => product.isActive).map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name} - INR {product.price}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Payment method</span>
                  <select name="paymentMethod" defaultValue="manual">
                    <option value="manual">Manual</option>
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank transfer</option>
                    <option value="upi">UPI</option>
                  </select>
                </label>

                <label className="field">
                  <span>Payment status</span>
                  <select name="markAsPaid" defaultValue="yes">
                    <option value="yes">Mark as paid</option>
                    <option value="no">Keep payment pending</option>
                  </select>
                </label>

                {purchaseFeedback ? (
                  <p style={{ margin: 0, color: purchaseFeedback.type === "success" ? "var(--success)" : "var(--danger)" }}>
                    {purchaseFeedback.message}
                  </p>
                ) : null}

                <button className="btn btn-primary" disabled={submittingPurchase}>
                  {submittingPurchase ? "Creating order..." : "Create order for customer"}
                </button>
              </form>
            </section>

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
                        <p style={{ color: "var(--muted)", marginTop: 0 }}>Placed by: {order.placedBy?.fullName || "Customer self-service"}</p>
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
