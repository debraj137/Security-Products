"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { authStorage } from "@/lib/auth";
import { formatCurrency } from "@/lib/currency";
import { Product, User } from "@/types";

export function ProductCard({ product, showAction = true }: { product: Product; showAction?: boolean }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(authStorage.getUser());
  }, []);

  const ctaHref: Route =
    user?.role === "customer"
      ? (`/products?selected=${product._id}` as Route)
      : user?.role === "admin"
        ? "/admin"
        : (`/register?plan=${product._id}` as Route);

  const ctaLabel =
    user?.role === "customer"
      ? "Choose Plan"
      : user?.role === "admin"
        ? "Open Admin"
        : "Buy / Choose Plan";

  return (
    <article
      className="panel"
      style={{
        padding: "1.35rem",
        display: "grid",
        gap: "1rem",
        height: "100%",
        gridTemplateRows: "auto auto auto 1fr auto"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16 }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 8 }}>
            {product.productCode}
          </p>
          <h3 style={{ margin: 0, fontSize: "1.6rem", fontFamily: "var(--font-display)" }}>{product.name}</h3>
        </div>
        <span className={`status-badge ${product.isActive ? "status-active" : "status-inactive"}`}>
          {product.isActive ? "available" : "inactive"}
        </span>
      </div>
      <p style={{ margin: 0, color: "var(--muted)" }}>{product.description}</p>
      <div style={{ fontSize: "2rem", fontWeight: 700 }}>{formatCurrency(product.price, product.currency)}</div>
      <ul
        style={{
          margin: 0,
          paddingLeft: "1.1rem",
          display: "grid",
          gap: "0.55rem",
          color: "var(--muted)",
          alignContent: "start"
        }}
      >
        {product.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      {showAction ? (
        <Link href={ctaHref} className="btn btn-primary" style={{ textAlign: "center", alignSelf: "end" }}>
          {ctaLabel}
        </Link>
      ) : null}
    </article>
  );
}
