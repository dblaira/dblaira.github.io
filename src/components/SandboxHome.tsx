"use client";

const CRIMSON = "#DC143C";

interface ExperimentCard {
  label: string;
  title: string;
  desc: string;
  status: "live" | "building" | "planned";
  href?: string;
}

const EXPERIMENTS: ExperimentCard[] = [
  {
    label: "SLEEP",
    title: "Sleep Dashboard",
    desc: "Daily score tracking with donut + area chart visualizations. ACM CHI research-backed design.",
    status: "live",
    href: "/sleep",
  },
  {
    label: "CORRELATIONS",
    title: "Life Network Graph",
    desc: "How 13 life categories connect. Pearson correlations across 92 weeks of data.",
    status: "planned",
  },
  {
    label: "SYSTEM",
    title: "INBOX Workflow",
    desc: "Single capture point. Zero decisions at capture time. Everything finds its home later.",
    status: "live",
    href: "/inbox",
  },
];

const QUOTE = {
  text: "Anything that gives me a feeling of momentum is worthwhile. Anything that gives me the feeling of stagnation is worth avoiding.",
  page: "1 / 3",
};

function StatusDot({ status }: { status: ExperimentCard["status"] }) {
  const color =
    status === "live"
      ? "#22C55E"
      : status === "building"
      ? CRIMSON
      : "rgba(0,0,0,0.2)";
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        marginRight: 8,
        flexShrink: 0,
      }}
    />
  );
}

export default function SandboxHome() {
  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A" }}>
      {/* Nav bar — black, extends into safe area */}
      <div
        style={{
          background: "#0A0A0A",
          paddingTop: "env(safe-area-inset-top, 0px)",
        }}
      >
        <div
          style={{
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: 720,
            margin: "0 auto",
          }}
        >
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "#FFFFFF",
            }}
          >
            TODIEFOR.
          </span>
          <span style={{ fontSize: 20, color: "rgba(255,255,255,0.5)" }}>☰</span>
        </div>
      </div>

      {/* Content area — cream background starts here */}
      <div style={{ background: "#F5F0E8" }}>

      {/* Hero section */}
      <div
        style={{
          padding: "48px 24px 40px",
          maxWidth: 720,
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(40px, 8vw, 56px)",
            fontWeight: 400,
            fontStyle: "italic",
            color: CRIMSON,
            lineHeight: 1.1,
            margin: "0 0 8px 0",
          }}
        >
          Sandbox
        </h1>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "rgba(0,0,0,0.4)",
            margin: 0,
          }}
        >
          EXPERIMENTS IN PROGRESS
        </p>
      </div>

      {/* Quote card */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "0 24px 32px",
        }}
      >
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 12,
            padding: "32px 28px 24px",
          }}
        >
          <div style={{ display: "flex", gap: 16 }}>
            {/* Crimson left border */}
            <div
              style={{
                width: 3,
                background: CRIMSON,
                borderRadius: 2,
                flexShrink: 0,
              }}
            />
            <p
              style={{
                fontFamily: "Georgia, 'Playfair Display', serif",
                fontSize: 20,
                fontStyle: "italic",
                color: "#1A1A1A",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              &ldquo;{QUOTE.text}&rdquo;
            </p>
          </div>

          {/* Pagination dots */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 20,
            }}
          >
            <span
              style={{
                width: 20,
                height: 6,
                borderRadius: 3,
                background: CRIMSON,
              }}
            />
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                background: "rgba(0,0,0,0.12)",
              }}
            />
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                background: "rgba(0,0,0,0.12)",
              }}
            />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                color: "rgba(0,0,0,0.3)",
                marginLeft: 8,
              }}
            >
              {QUOTE.page}
            </span>
          </div>
        </div>
      </div>

      {/* Section header */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "16px 24px 16px",
          background: "rgba(0,0,0,0.03)",
        }}
      >
        <h2
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 15,
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#1A1A1A",
            margin: 0,
          }}
        >
          LATEST EXPERIMENTS
        </h2>
      </div>

      {/* Experiment cards */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "16px 24px 80px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {EXPERIMENTS.map((card) => {
          const inner = (
            <div
              key={card.label}
              style={{
                background: "#FFFFFF",
                borderRadius: 12,
                padding: "24px",
                cursor: card.href ? "pointer" : "default",
                transition: "box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 4px 20px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Status + label row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <StatusDot status={card.status} />
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "rgba(0,0,0,0.4)",
                  }}
                >
                  {card.label}
                </span>
              </div>

              <h3
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 22,
                  fontWeight: 400,
                  color: "#1A1A1A",
                  margin: "0 0 8px 0",
                }}
              >
                {card.title}
              </h3>

              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  color: "rgba(0,0,0,0.5)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {card.desc}
              </p>
            </div>
          );

          return card.href ? (
            <a
              key={card.label}
              href={card.href}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {inner}
            </a>
          ) : (
            inner
          );
        })}
      </div>

      {/* FAB */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: CRIMSON,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(220, 20, 60, 0.3)",
          cursor: "pointer",
        }}
      >
        <span style={{ color: "#FFF", fontSize: 28, lineHeight: 1 }}>+</span>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid rgba(0,0,0,0.06)",
          padding: "20px 24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            color: "rgba(0,0,0,0.3)",
          }}
        >
          Built with Understood · Powered by curiosity
        </p>
      </div>

      </div>{/* end cream wrapper */}
    </div>
  );
}
