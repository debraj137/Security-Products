"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { apiRequest } from "@/lib/api";
import { authStorage } from "@/lib/auth";
import { formatCurrency } from "@/lib/currency";
import { Product } from "@/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const selected = useSearchParams().get("selected");

  useEffect(() => {
    apiRequest<Product[]>("/products/public")
      .then(setProducts)
      .catch(() => setMessage("Unable to load products"));
  }, []);

  const visibleProducts = useMemo(() => {
    if (!selected) {
      return products;
    }

    const selectedProduct = products.find((product) => product._id === selected);
    return selectedProduct ? [selectedProduct] : products;
  }, [products, selected]);

  const purchase = async (productId: string) => {
    const token = authStorage.getToken();
    if (!token) {
      window.location.href = `/register?plan=${productId}`;
      return;
    }

    try {
      setLoadingId(productId);
      await apiRequest("/orders", {
        method: "POST",
        token,
        body: { productId, paymentMethod: "manual", markAsPaid: true }
      });
      window.location.href = "/dashboard?purchase=success";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create order");
    } finally {
      setLoadingId(null);
    }
  };

  const isSelectedView = Boolean(selected);
  const selectedProduct = isSelectedView ? visibleProducts[0] : null;

  return (
    <main className="container" style={{ padding: "28px 0 60px" }}>
      <div style={{ marginBottom: 18, maxWidth: isSelectedView ? 760 : undefined }}>
        <div className="eyebrow">Choose a plan</div>
        <h1 className="page-title">{isSelectedView ? "Confirm your selected plan" : "Checkout-ready products"}</h1>
        {isSelectedView ? (
          <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
            You are reviewing the plan selected from the home page. <Link href="/products" style={{ color: "var(--accent-deep)" }}>View all plans</Link>
          </p>
        ) : null}
        {message ? <p style={{ color: "var(--accent-deep)" }}>{message}</p> : null}
      </div>

      {isSelectedView && selectedProduct ? (
        <section style={{ display: "grid", justifyContent: "center" }}>
          <div className="panel" style={{ width: "min(100%, 760px)", padding: "1.25rem", display: "grid", gap: "1rem", background: "linear-gradient(180deg, rgba(255,250,242,0.96), rgba(240,226,199,0.88))" }}>
            <div style={{ display: "grid", gap: 12 }}>
              <ProductCard product={selectedProduct} showAction={false} />
              <div className="panel" style={{ padding: "1.1rem 1.2rem", borderRadius: 20, background: "rgba(255,255,255,0.62)", display: "grid", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <strong>Selected plan</strong>
                  <strong>{formatCurrency(selectedProduct.price, selectedProduct.currency)}</strong>
                </div>
                <p style={{ margin: 0, color: "var(--muted)" }}>
                  Your order will be created immediately and access will be enabled after admin activation.
                </p>
                <button className="btn btn-primary" onClick={() => purchase(selectedProduct._id)} disabled={loadingId === selectedProduct._id} style={{ outline: "3px solid rgba(200, 107, 42, 0.24)" }}>
                  {loadingId === selectedProduct._id ? "Processing..." : "Confirm Purchase"}
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="grid products-grid">
          {visibleProducts.map((product) => (
            <div key={product._id} style={{ display: "grid", gap: 12 }}>
              <ProductCard product={product} showAction={!selected} />
              <button className="btn btn-primary" onClick={() => purchase(product._id)} disabled={loadingId === product._id}>
                {loadingId === product._id ? "Processing..." : "Confirm Purchase"}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
