"use client";

import { useState } from "react";
import { SavySiteHeader } from "@/components/SavySiteHeader";
import dynamic from "next/dynamic";

const MarkmapViewer = dynamic(() => import("@/components/MarkmapViewer"), {
  ssr: false,
});
const AgentChatPanel = dynamic(() => import("@/components/AgentChatPanel"), {
  ssr: false,
});
const ChatHistory = dynamic(
  () => import("@/components/AgentChatPanel").then((m) => m.ChatHistory),
  { ssr: false },
);
const CostDashboard = dynamic(() => import("@/components/CostDashboard"), {
  ssr: false,
});

const CRIMSON = "#DC143C";
const CREAM = "#F5F0E8";
const INTER = "'Inter', sans-serif";
const PLAYFAIR = "'Playfair Display', Georgia, serif";

const AGENTS = [
  { id: "savy", label: "Savy", emoji: "🦊", machine: "MacBook Pro", role: "Primary Agent" },
  { id: "po", label: "Po", emoji: "🐼", machine: "Mac Studio", role: "Orchestrator" },
];

export default function AgentsDashboard() {
  const [selectedAgent, setSelectedAgent] = useState("savy");

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A" }}>
      <SavySiteHeader />

      <div style={{ background: CREAM }}>

        {/* Hero */}
        <div className="content-width" style={{ padding: "48px 24px 32px" }}>
          <h1
            style={{
              fontFamily: PLAYFAIR,
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
              fontFamily: INTER,
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

        {/* Agent Cards — clickable as picker */}
        <div className="content-width" style={{ padding: "0 24px 32px" }}>
          <div style={{ marginBottom: 12 }}>
            <span
              style={{
                fontFamily: INTER,
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "rgba(0,0,0,0.35)",
              }}
            >
              Talk to
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            {AGENTS.map((a) => {
              const active = selectedAgent === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => setSelectedAgent(a.id)}
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 16,
                    padding: "28px 24px",
                    border: active ? `2.5px solid ${CRIMSON}` : "2.5px solid transparent",
                    borderLeft: active ? `4px solid ${CRIMSON}` : `4px solid #22C55E`,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                    boxShadow: active ? "0 2px 12px rgba(220,20,60,0.12)" : "none",
                    outline: "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <span style={{ fontSize: 44 }}>{a.emoji}</span>
                    <div>
                      <div
                        style={{
                          fontFamily: PLAYFAIR,
                          fontSize: 24,
                          fontWeight: 400,
                          color: active ? CRIMSON : "#1A1A1A",
                        }}
                      >
                        {a.label}
                      </div>
                      <div
                        style={{
                          fontFamily: INTER,
                          fontSize: 13,
                          color: "rgba(0,0,0,0.4)",
                          fontWeight: 500,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        {a.machine}
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span
                      style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: "#22C55E",
                        display: "inline-block",
                        boxShadow: "0 0 6px #22C55E",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: INTER,
                        fontSize: 13,
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
                      fontFamily: INTER,
                      fontSize: 14,
                      color: "rgba(0,0,0,0.45)",
                      lineHeight: 1.7,
                    }}
                  >
                    <div>{a.role}</div>
                    <div style={{ marginTop: 4, color: "rgba(0,0,0,0.3)" }}>
                      claude-opus-4-6
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Panel — synced with card selection */}
        <div className="content-width" style={{ padding: "0 24px 32px" }}>
          <AgentChatPanel agent={selectedAgent} />
        </div>

        {/* Markmap — Savy's live mind map */}
        <div className="content-width" style={{ padding: "0 24px 32px" }}>
          <div style={{ marginBottom: 12 }}>
            <span
              style={{
                fontFamily: INTER,
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

        {/* API Costs */}
        <div className="content-width" style={{ padding: "0 24px 32px" }}>
          <CostDashboard />
        </div>

        {/* Chat History */}
        <div className="content-width" style={{ padding: "0 24px 80px" }}>
          <ChatHistory />
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
              fontFamily: INTER,
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
