import { HeroActions } from "@/components/HeroActions";
import { ProductCard } from "@/components/ProductCard";
import { SupportPanelAction } from "@/components/SupportPanelAction";
import { apiRequest } from "@/lib/api";
import { Product } from "@/types";

async function getProducts(): Promise<Product[]> {
  try {
    return await apiRequest<Product[]>("/products/public");
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const products = await getProducts();
  console.log('products: ',products)
  return (
    <main>
      <section className="container" style={{ padding: "36px 0 22px" }}>
        <div className="panel" style={{ padding: "clamp(1.5rem, 4vw, 4rem)", background: "linear-gradient(135deg, rgba(255,250,242,0.95), rgba(240,226,199,0.9)), url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22%3E%3Cg fill=%22none%22 stroke=%22rgba(111,51,16,0.06)%22 stroke-width=%221%22%3E%3Cpath d=%22M0 20h40M20 0v40%22/%3E%3C/g%3E%3C/svg%3E')" }}>
          <div className="hero-grid">
            <div style={{ display: "grid", gap: "1.25rem", alignContent: "start" }}>
              <div className="eyebrow">AI-powered site protection</div>
              <h1 className="section-title" style={{ maxWidth: 720 }}>
                Smarter security platform to protect your site with faster alerts and response.
              </h1>
              <p className="hero-text">
                Explore smart security plans for your site, choose the features that fit your needs, and start with a solution built for reliable alerts and fast response.
              </p>
              <div className="hero-note">
                <span className="hero-dot" />
                Intruder detection plans built for monitored spaces, stores, offices, and industrial sites.
              </div>
              <HeroActions />
            </div>

            <div className="hero-side">
              <div className="hero-mockup">
                <div className="hero-mockup-top">
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 6 }}>Live monitoring</div>
                    <strong style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem" }}>Site Protection Overview</strong>
                  </div>
                  <div className="hero-chip">
                    <span className="hero-chip-dot" />
                    System ready
                  </div>
                </div>

                <div className="hero-screen">
                  <div className="hero-screen-row">
                    <div>
                      <div className="hero-screen-label">Current mode</div>
                      <div className="hero-screen-value">Active monitoring</div>
                    </div>
                    <div className="hero-chip">
                      <span className="hero-chip-dot" />
                      AI detection online
                    </div>
                  </div>

                  <div className="hero-screen-grid">
                    <div className="hero-stat">
                      <strong>Instant alerting</strong>
                      <p>Respond quickly when a person enters a monitored zone.</p>
                    </div>
                    <div className="hero-stat">
                      <strong>Upgrade-friendly</strong>
                      <p>Add email, WhatsApp, and alarm features as needed.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hero-feature-list">
                <div className="hero-feature">
                  <div className="hero-icon">!</div>
                  <div>
                    <strong>Alerts that matter</strong>
                    <p>Capture attention quickly with event-driven notifications built for real environments.</p>
                  </div>
                </div>
                <div className="hero-feature">
                  <div className="hero-icon">+</div>
                  <div>
                    <strong>Plans that scale</strong>
                    <p>Start simple, then move to richer communication and alarm workflows without friction.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="plans" className="container" style={{ padding: "28px 0" }}>
        <div className="eyebrow">Pricing</div>
        <h2 className="section-title" style={{ marginBottom: 18 }}>Security plans built for clear upgrades</h2>
        <div className="grid products-grid">
          {products.map((product) => <ProductCard key={product._id} product={product} />)}
        </div>
      </section>

      <section id="why-us" className="container" style={{ padding: "28px 0" }}>
        <div className="grid home-split">
          <div className="panel" style={{ padding: "1.5rem" }}>
            <div className="eyebrow">Why choose us</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", marginTop: 0 }}>
              Protection that is simple to choose and dependable to use
            </h2>
            <p style={{ color: "var(--muted)", marginBottom: 0 }}>
              Whether you need essential intruder alerts or a more advanced setup with email, WhatsApp, and alarm support, our plans are designed to give you clear options, quick setup, and confidence that your site stays monitored.
            </p>
          </div>
          <div className="panel" style={{ padding: "1.5rem", display: "grid", gap: "1rem", alignContent: "start" }}>
            <div>
              <div className="eyebrow">Support</div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", marginTop: 0, marginBottom: 12 }}>
                Help when you need it
              </h2>
              <p style={{ color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
                Want a product walkthrough, help choosing the right plan, or assistance with installation? Reach out to our team and we will guide you to the best setup for your site.
              </p>
            </div>
            <SupportPanelAction />
          </div>
        </div>
      </section>
    </main>
  );
}
