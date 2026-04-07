"use client";

import { SavySiteHeader } from "@/components/SavySiteHeader";
import { CATEGORY_COLORS } from "@/lib/types";
import dynamic from "next/dynamic";

const MarkmapViewer = dynamic(() => import("@/components/MarkmapViewer"), {
  ssr: false,
});
const AgentChatPanel = dynamic(() => import("@/components/AgentChatPanel"), {
  ssr: false,
});

const CRIMSON = "#DC143C";
const CREAM = "#F5F0E8";

const CATEGORIES = [
  "exercise", "nutrition", "ambition", "health", "sleep",
  "social", "work", "purchase", "affect", "insight",
  "belief", "entertainment", "learning",
];

const CATEGORY_COUNTS: Record<string, number> = {
  exercise: 3071,
  nutrition: 674,
  ambition: 638,
  health: 624,
  sleep: 592,
  social: 592,
  work: 510,
  purchase: 433,
  affect: 0,
  insight: 0,
  belief: 0,
  entertainment: 0,
  learning: 0,
};

const ACTIVITY = [
  {
    emoji: "🐼",
    agent: "Po",
    action: "Upgraded to Opus 4.6 + Gemma 4",
    detail: "primary: claude-opus-4-6 · local: gemma4:26b · cost routing enabled",
    date: "Apr 7",
  },
  {
    emoji: "🐼",
    agent: "Po",
    action: "Hermes agent deployed",
    detail: "replaced OpenClaw · Telegram + web chat · MCP integrations",
    date: "Apr 7",
  },
  {
    emoji: "🐼",
    agent: "Po",
    action: "Web chat panel live",
    detail: "mind map responses · todiefor.app/agents",
    date: "Apr 7",
  },
];

function hex(color: string, opacity: number): string {
  // Convert hex to rgba
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default function AgentsDashboard() {
  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A" }}>
      <SavySiteHeader />

      <div style={{ background: CREAM }}>

        {/* Hero */}
        <div className="content-width" style={{ padding: "48px 24px 32px" }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(32px, 6vw, 44px)",
              fontWeight: 400,
              fontStyle: "italic",
              color: CRIMSON,
              lineHeight: 1.1,
              margin: "0 0 8px 0",
            }}
          >
            Agent Workflow
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
            Savy + Po · MacBook Pro + Mac Studio
          </p>
        </div>

        {/* Agent Cards */}
        <div className="content-width" style={{ padding: "0 24px 32px" }}>

          {/* Section label */}
          <div style={{ marginBottom: 12 }}>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "rgba(0,0,0,0.35)",
              }}
            >
              Agents
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {/* Po */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 12,
                padding: "24px",
                borderLeft: `3px solid #22C55E`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 32 }}>🐼</span>
                <div>
                  <div
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: 20,
                      fontWeight: 400,
                      color: "#1A1A1A",
                    }}
                  >
                    Po
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 11,
                      color: "rgba(0,0,0,0.4)",
                      fontWeight: 500,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    Mac Studio
                  </div>
                </div>
              </div>

              {/* Status */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <span
                  style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "#22C55E",
                    display: "inline-block",
                    boxShadow: "0 0 6px #22C55E",
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#22C55E",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Online
                </span>
              </div>

              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: "rgba(0,0,0,0.45)",
                  lineHeight: 1.7,
                }}
              >
                <div>Orchestrator</div>
                <div style={{ marginTop: 4, color: "rgba(0,0,0,0.3)" }}>
                  claude-opus-4-6
                </div>
              </div>
            </div>

            {/* Savy */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 12,
                padding: "24px",
                borderLeft: `3px solid #22C55E`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 32 }}>🦊</span>
                <div>
                  <div
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: 20,
                      fontWeight: 400,
                      color: "#1A1A1A",
                    }}
                  >
                    Savy
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 11,
                      color: "rgba(0,0,0,0.4)",
                      fontWeight: 500,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    MacBook Pro
                  </div>
                </div>
              </div>

              {/* Status */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <span
                  style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "#22C55E",
                    display: "inline-block",
                    boxShadow: "0 0 6px #22C55E",
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#22C55E",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Online
                </span>
              </div>

              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: "rgba(0,0,0,0.45)",
                  lineHeight: 1.7,
                }}
              >
                <div>Primary Agent</div>
                <div style={{ marginTop: 4, color: "rgba(0,0,0,0.3)" }}>
                  claude-opus-4-6
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="content-width" style={{ padding: "0 24px 32px" }}>
          <AgentChatPanel agent="savy" />
        </div>

        {/* Markmap — Savy's live mind map */}
        <div className="content-width" style={{ padding: "0 24px 32px" }}>
          <div style={{ marginBottom: 12 }}>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "rgba(0,0,0,0.35)",
              }}
            >
              Live Outline
            </span>
          </div>
          <MarkmapViewer />
        </div>

        {/* Ontology Section */}
        <div className="content-width" style={{ padding: "0 24px 32px" }}>

          <div style={{ marginBottom: 12 }}>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "rgba(0,0,0,0.35)",
              }}
            >
              Understood Ontology
            </span>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 12,
              padding: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20 }}>
              <span
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 20,
                  fontWeight: 400,
                  color: "#1A1A1A",
                }}
              >
                13 Categories
              </span>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: "rgba(0,0,0,0.35)",
                }}
              >
                8,069 extractions · 92 weeks
              </span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CATEGORIES.map((cat) => {
                const color = CATEGORY_COLORS[cat] ?? "#64748B";
                const count = CATEGORY_COUNTS[cat];
                return (
                  <div
                    key={cat}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: hex(color, 0.08),
                      border: `1px solid ${hex(color, 0.3)}`,
                      borderRadius: 20,
                      padding: "5px 12px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 12,
                        fontWeight: 600,
                        color: color,
                        textTransform: "capitalize",
                      }}
                    >
                      {cat}
                    </span>
                    {count > 0 && (
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 10,
                          fontWeight: 500,
                          color: hex(color, 0.7),
                        }}
                      >
                        {count.toLocaleString()}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="content-width" style={{ padding: "0 24px 80px" }}>

          <div style={{ marginBottom: 12 }}>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "rgba(0,0,0,0.35)",
              }}
            >
              Recent Activity
            </span>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 12,
              padding: "8px 0",
            }}
          >
            {ACTIVITY.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "16px 24px",
                  borderBottom: i < ACTIVITY.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                }}
              >
                {/* Left dot */}
                <div style={{ position: "relative", paddingTop: 4 }}>
                  <div
                    style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: CRIMSON,
                      flexShrink: 0,
                    }}
                  />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#1A1A1A",
                      marginBottom: 2,
                    }}
                  >
                    {item.emoji} {item.agent} · {item.action}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12,
                      color: "rgba(0,0,0,0.4)",
                    }}
                  >
                    {item.detail}
                  </div>
                </div>

                {/* Date */}
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11,
                    fontWeight: 500,
                    color: "rgba(0,0,0,0.3)",
                    flexShrink: 0,
                    paddingTop: 2,
                  }}
                >
                  {item.date}
                </div>
              </div>
            ))}
          </div>
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

      </div>
    </div>
  );
}
