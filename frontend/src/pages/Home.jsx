import React from "react";
import { Link } from "react-router-dom";

// Lightweight utility styles local to this page so you don't need to hunt in CSS.
// Uses your existing CSS variables (colors/spacing) where possible.
const styles = {
  container: {
    maxWidth: 1160,
    margin: "0 auto",
    padding: "0 24px",
  },
  heroWrap: {
    // roomy hero
    paddingTop: 96,
    paddingBottom: 72,
    background:
      "radial-gradient(1200px 480px at 20% -10%, rgba(56,189,248,.08), transparent 60%), radial-gradient(900px 420px at 90% -20%, rgba(34,197,94,.08), transparent 55%)",
  },
  heroGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: 36,
    alignItems: "center",
  },
  heroTitle: {
    fontSize: "clamp(36px, 6vw, 64px)",
    lineHeight: 1.05,
    letterSpacing: "-0.02em",
    fontWeight: 800,
    margin: 0,
  },
  heroLead: {
    marginTop: 16,
    fontSize: "clamp(16px, 2.4vw, 20px)",
    opacity: 0.9,
    maxWidth: 720,
  },
  heroActions: {
    display: "flex",
    gap: 12,
    marginTop: 24,
    flexWrap: "wrap",
  },
  primaryBtn: {
    background:
      "linear-gradient(90deg, var(--accent,#22d3ee), var(--accent2,#60a5fa))",
    border: 0,
    color: "var(--bg,#0b1220)",
    padding: "14px 18px",
    borderRadius: 12,
    fontWeight: 700,
    textDecoration: "none",
    boxShadow: "0 10px 28px rgba(34,197,94,.18)",
  },
  softBtn: {
    background: "rgba(255,255,255,.05)",
    border: "1px solid rgba(255,255,255,.08)",
    color: "var(--text,#e5eef7)",
    padding: "14px 18px",
    borderRadius: 12,
    fontWeight: 700,
    textDecoration: "none",
  },
  tinyRow: {
    display: "flex",
    gap: 18,
    alignItems: "center",
    marginTop: 18,
    color: "var(--text,#e5eef7)",
    opacity: 0.8,
    fontSize: 14,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  previewCard: {
    background:
      "linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02))",
    border: "1px solid rgba(255,255,255,.07)",
    borderRadius: 16,
    padding: 22,
    boxShadow: "0 22px 48px rgba(0,0,0,.35)",
  },
  previewHeader: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    marginBottom: 18,
    opacity: 0.7,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    background: "rgba(255,255,255,.25)",
  },

  /*  SECTION SPACING — this is what fixes the “too cramped” look  */
  section: {
    paddingTop: 84,     // <— generous vertical rhythm between blocks
    paddingBottom: 84,
  },
  sectionNarrow: {
    paddingTop: 72,
    paddingBottom: 72,
  },

  // Centered section header
  sectionHead: {
    textAlign: "center",
    marginBottom: 36,
  },
  sectionTitle: {
    margin: 0,
    fontSize: "clamp(28px, 3.6vw, 40px)",
    letterSpacing: "-0.02em",
    fontWeight: 800,
  },
  sectionSub: {
    marginTop: 8,
    opacity: 0.8,
  },

  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 18,
  },
  featureCard: {
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(255,255,255,.07)",
    borderRadius: 16,
    padding: 22,
  },
  featureTitle: {
    margin: "12px 0 8px",
    fontSize: 20,
    fontWeight: 800,
  },
  featureBody: {
    opacity: 0.85,
  },

  ctaBand: {
    marginTop: 32,
    background:
      "linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02))",
    border: "1px solid rgba(255,255,255,.07)",
    borderRadius: 18,
    padding: "24px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  ctaHeading: {
    margin: 0,
    fontWeight: 800,
    fontSize: "clamp(18px, 2.6vw, 22px)",
  },

  footer: {
    paddingTop: 48,
    paddingBottom: 72,
    textAlign: "center",
    opacity: 0.55,
    fontSize: 14,
  },

  // Responsive
  "@media(max-width: 980px)": {
    heroGrid: { gridTemplateColumns: "1fr", gap: 28 },
    featuresGrid: { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
  },
  "@media(max-width: 560px)": {
    featuresGrid: { gridTemplateColumns: "1fr" },
  },
};

// A tiny helper to apply “responsive” keys in our local style object.
function useResponsiveStyle(obj) {
  const base = { ...obj };
  // Apply responsive overrides based on window width
  if (typeof window !== "undefined") {
    const w = window.innerWidth;
    if (w <= 560 && obj["@media(max-width: 560px)"]) {
      Object.assign(base, obj["@media(max-width: 560px)"]);
    } else if (w <= 980 && obj["@media(max-width: 980px)"]) {
      Object.assign(base, obj["@media(max-width: 980px)"]);
    }
  }
  // Strip media keys so they don’t end up on the element
  delete base["@media(max-width: 560px)"];
  delete base["@media(max-width: 980px)"];
  return base;
}

export default function Home() {
  const heroGridStyle = useResponsiveStyle(styles.heroGrid);
  const featuresGridStyle = useResponsiveStyle(styles.featuresGrid);

  return (
    <main>
      {/* HERO */}
      <section style={styles.heroWrap}>
        <div style={styles.container}>
          <div style={heroGridStyle}>
            {/* Left: copy + CTAs */}
            <div>
              <h1 style={styles.heroTitle}>
                Find & book <span style={{ color: "var(--accent,#22d3ee)" }}>parking</span> in seconds.
              </h1>
              <p style={styles.heroLead}>
                Real-time availability · Instant booking · Hassle-free cancellations. Choose a
                location, pick a time, and you’re done.
              </p>

              <div style={styles.heroActions}>
                <Link to="/locations" style={styles.primaryBtn}>Browse locations</Link>
                <Link to="/my-bookings" style={styles.softBtn}>My bookings</Link>
                <Link to="/admin" style={styles.softBtn}>Admin console</Link>
              </div>

              <div style={styles.tinyRow}>
                <span style={styles.badge}>⚡ Book under 30s</span>
                <span style={styles.badge}>🔒 Secure & private</span>
                <span style={styles.badge}>🕒 Live availability</span>
              </div>
            </div>

            {/* Right: preview card */}
            <div>
              <div style={styles.previewCard}>
                <div style={styles.previewHeader}>
                  <span style={styles.dot} />
                  <span style={styles.dot} />
                  <span style={styles.dot} />
                </div>
                <p style={{ opacity: 0.7, margin: "0 0 6px" }}>Next available slot</p>
                <h3 style={{ margin: "0 0 4px", fontWeight: 800 }}>Sector 17 • A2</h3>
                <div style={{ opacity: 0.8 }}>₹2 / min</div>
                <div style={{ marginTop: 16 }}>
                  <Link to="/locations" style={{ ...styles.primaryBtn, display: "inline-block" }}>
                    Start booking
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES — centered heading with big breathing room */}
      <section style={styles.section}>
        <div style={styles.container}>
          <header style={styles.sectionHead}>
            <h2 style={styles.sectionTitle}>Why use Car Parking?</h2>
            <p style={styles.sectionSub}>Built for speed, clarity, and control.</p>
          </header>

          <div style={featuresGridStyle}>
            <article style={styles.featureCard}>
              <div style={{ fontSize: 22 }}>⚡</div>
              <h3 style={styles.featureTitle}>Lightning-fast</h3>
              <p style={styles.featureBody}>
                Check availability & reserve a spot in seconds with a clean, no-nonsense flow.
              </p>
            </article>

            <article style={styles.featureCard}>
              <div style={{ fontSize: 22 }}>📍</div>
              <h3 style={styles.featureTitle}>Location-aware</h3>
              <p style={styles.featureBody}>
                Each parking location manages its own slots to reflect reality on the ground.
              </p>
            </article>

            <article style={styles.featureCard}>
              <div style={{ fontSize: 22 }}>🔐</div>
              <h3 style={styles.featureTitle}>Secure by default</h3>
              <p style={styles.featureBody}>
                Role-based access—admins manage locations; users only see their bookings.
              </p>
            </article>

            <article style={styles.featureCard}>
              <div style={{ fontSize: 22 }}>📊</div>
              <h3 style={styles.featureTitle}>Transparent pricing</h3>
              <p style={styles.featureBody}>
                Per-minute pricing with full cost breakdown before you confirm.
              </p>
            </article>
          </div>

          {/* CTA band */}
          <div style={styles.ctaBand}>
            <h4 style={styles.ctaHeading}>Ready to grab a spot?</h4>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link to="/locations" style={styles.primaryBtn}>Browse locations</Link>
              <Link to="/signup" style={styles.softBtn}>Create account</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <section style={styles.sectionNarrow}>
        <div style={{ ...styles.container, ...styles.footer }}>
          © {new Date().getFullYear()} Car Parking System. By Keerat Punia.
        </div>
      </section>
    </main>
  );
}
