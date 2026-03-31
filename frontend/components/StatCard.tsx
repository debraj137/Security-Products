export function StatCard({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) {
  return (
    <div className="panel" style={{ padding: "1.1rem" }}>
      <div style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{title}</div>
      <div style={{ fontSize: "2rem", fontWeight: 700, marginTop: 8 }}>{value}</div>
      {subtitle ? <div style={{ color: "var(--muted)", marginTop: 6 }}>{subtitle}</div> : null}
    </div>
  );
}
