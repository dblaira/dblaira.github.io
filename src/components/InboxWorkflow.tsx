"use client";

import { useState } from "react";

interface WorkflowChoice {
  label: string;
  desc: string;
  dest?: string;
}

interface WorkflowStep {
  num: number;
  label: string;
  who: string;
  what: string;
  where?: string;
  choices?: WorkflowChoice[];
}

interface InboxItem {
  id: number;
  date: string;
  text: string;
  age: string;
  stale: boolean;
}

interface Destination {
  name: string;
  desc: string;
  icon: string;
}

const CRIMSON = "#DC143C";
const CRIMSON_SOFT = "rgba(220, 20, 60, 0.08)";
const CRIMSON_BORDER = "rgba(220, 20, 60, 0.2)";

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    num: 1,
    label: "Capture",
    who: "You",
    what: "An idea, decision, or rule pops into your head. You say \"log this\" to whichever agent is nearby.",
    where: "Telegram → Rhino  |  Mac Studio → Po",
  },
  {
    num: 2,
    label: "Land",
    who: "Agent",
    what: "The agent writes it to INBOX.md with a timestamp and the next number. No categories, no folders, no decisions. Just captured.",
    where: "~/.openclaw/workspace/INBOX.md",
  },
  {
    num: 3,
    label: "Watch",
    who: "Heartbeat",
    what: "Every 30 minutes, the Mac Studio agent checks: are there items older than 24 hours? If yes, it nudges you with a count. If no, silence.",
    where: "Runs automatically in background",
  },
  {
    num: 4,
    label: "Review",
    who: "You",
    what: "When you're ready (not when the agent tells you to), you open the inbox and go through each item. One by one.",
    where: "On your schedule, not the system's",
  },
  {
    num: 5,
    label: "Decide",
    who: "You",
    what: "For each item, you make exactly one choice:",
    choices: [
      {
        label: "Move it",
        desc: "It's a rule, convention, or instruction → goes to a permanent file",
        dest: "SOUL.md, CONVENTIONS.md, .cursorrules, project docs, Notion",
      },
      { label: "Act on it", desc: "It's a reminder or task → do it now or set a real reminder" },
      { label: "Delete it", desc: "It's handled, outdated, or not useful anymore" },
      { label: "Leave it", desc: "Not sure yet → the heartbeat will remind you tomorrow" },
    ],
  },
];

const SAMPLE_INBOX: InboxItem[] = [
  {
    id: 1,
    date: "Mar 2, 10:39 PM",
    text: "How does AI change the equation of building or adopting an ontology? The right ontology could unearth context I'd never see with it.",
    age: "1 day",
    stale: true,
  },
  {
    id: 2,
    date: "Mar 3, 9:15 AM",
    text: "Font size on mobile should never be smaller than 16px — add to design conventions when that doc exists.",
    age: "3 hrs",
    stale: false,
  },
  {
    id: 3,
    date: "Mar 3, 10:02 AM",
    text: "Idea: what if heartbeat checked calendar and prepped context for meetings automatically?",
    age: "2 hrs",
    stale: false,
  },
  {
    id: 4,
    date: "Mar 3, 11:30 AM",
    text: "Cursor works better when I give it the whole file, not snippets. Log as a convention.",
    age: "1 hr",
    stale: false,
  },
  {
    id: 5,
    date: "Mar 3, 11:45 AM",
    text: "Check if AppleCare can still be added to Mac Studio — within 60 day window.",
    age: "45 min",
    stale: false,
  },
];

const DESTINATIONS: Destination[] = [
  { name: "SOUL.md", desc: "Agent personality & rules", icon: "🧠" },
  { name: "CONVENTIONS.md", desc: "Design & code rules", icon: "📐" },
  { name: ".cursorrules", desc: "Cursor AI instructions", icon: "⌨️" },
  { name: "Project docs", desc: "App-specific notes", icon: "📁" },
  { name: "Notion", desc: "Strategy & planning", icon: "📋" },
  { name: "🗑️ Delete", desc: "Done or not needed", icon: "" },
];

const label = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08rem",
};

function WorkflowView() {
  return (
    <div>
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 15,
          color: "#666666",
          lineHeight: 1.6,
          marginBottom: 32,
        }}
      >
        Think of it like a conveyor belt. Things go in one end, move through at your pace, and come
        out the other end in their permanent home. Nothing gets lost. Nothing requires you to decide
        where it goes in the moment.
      </p>

      <div style={{ position: "relative" }}>
        {/* Connecting line */}
        <div
          style={{
            position: "absolute",
            left: 23,
            top: 24,
            bottom: 24,
            width: 2,
            background: CRIMSON,
            borderRadius: 1,
            opacity: 0.25,
            zIndex: 0,
          }}
        />

        {WORKFLOW_STEPS.map((step, i) => (
          <div
            key={step.num}
            style={{
              display: "flex",
              gap: 20,
              marginBottom: i < WORKFLOW_STEPS.length - 1 ? 8 : 0,
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Number circle */}
            <div
              style={{
                width: 48,
                minWidth: 48,
                height: 48,
                borderRadius: "50%",
                background: "#FFFFFF",
                border: `2px solid ${CRIMSON}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Inter', sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: CRIMSON,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              {step.num}
            </div>

            {/* Content card */}
            <div
              style={{
                flex: 1,
                background: "#FFFFFF",
                borderRadius: 12,
                padding: "16px 20px",
                marginBottom: 12,
                border: "1px solid rgba(0,0,0,0.1)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 20,
                    fontWeight: 400,
                    color: "#000000",
                  }}
                >
                  {step.label}
                </span>
                <span
                  style={{
                    ...label,
                    color: "#666666",
                    background: "rgba(0,0,0,0.05)",
                    padding: "3px 8px",
                    borderRadius: 4,
                  }}
                >
                  {step.who}
                </span>
              </div>

              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 17,
                  color: "#1A1A1A",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {step.what}
              </p>

              {step.choices && (
                <div
                  style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}
                >
                  {step.choices.map((c, ci) => (
                    <div
                      key={ci}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        background: "#FAFAFA",
                        borderRadius: 8,
                        padding: "10px 12px",
                        border: "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 15,
                          fontWeight: 600,
                          color: CRIMSON,
                          minWidth: 72,
                          whiteSpace: "nowrap" as const,
                        }}
                      >
                        {c.label}
                      </span>
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 15,
                          color: "#666666",
                          lineHeight: 1.5,
                        }}
                      >
                        {c.desc}
                        {c.dest && (
                          <span
                            style={{
                              display: "block",
                              ...label,
                              fontSize: 12,
                              color: "#999999",
                              marginTop: 4,
                              fontWeight: 500,
                              textTransform: "none" as const,
                              letterSpacing: 0,
                            }}
                          >
                            → {c.dest}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {step.where && !step.choices && (
                <div
                  style={{
                    marginTop: 10,
                    ...label,
                    color: "#999999",
                  }}
                >
                  {step.where}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Permanent Homes */}
      <div
        style={{
          marginTop: 32,
          padding: "20px",
          background: "#F5F0E8",
          borderRadius: 12,
          borderBottom: `2px solid ${CRIMSON}`,
        }}
      >
        <h3
          style={{
            ...label,
            color: "#666666",
            margin: "0 0 16px 0",
          }}
        >
          Permanent Homes (where items end up)
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
          }}
        >
          {DESTINATIONS.map((d, i) => (
            <div
              key={i}
              style={{
                background: "#FFFFFF",
                borderRadius: 8,
                padding: "12px",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 6 }}>{d.icon}</div>
              <div
                style={{
                  ...label,
                  color: "#000000",
                  fontSize: 11,
                }}
              >
                {d.name}
              </div>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  color: "#666666",
                  marginTop: 3,
                  lineHeight: 1.4,
                }}
              >
                {d.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InboxView() {
  const [items, setItems] = useState<InboxItem[]>(SAMPLE_INBOX);

  const staleCount = items.filter((i) => i.stale).length;

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div>
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 15,
          color: "#666666",
          lineHeight: 1.6,
          marginBottom: 24,
        }}
      >
        Clean numbered list, newest at bottom, stale items flagged. No categories to manage — just
        scan, decide, move on.
      </p>

      {/* Summary bar */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 20,
          background: "#FAFAFA",
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        {[
          { value: items.length, sublabel: "Total", color: "#000000" },
          {
            value: staleCount,
            sublabel: "Older than 24h",
            color: staleCount > 0 ? CRIMSON : "#1A1A1A",
          },
          { value: items.length - staleCount, sublabel: "Fresh today", color: "#1A1A1A" },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "16px 8px",
              borderRight: i < 2 ? "1px solid rgba(0,0,0,0.1)" : "none",
            }}
          >
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 28,
                fontWeight: 700,
                color: stat.color,
                lineHeight: 1,
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                ...label,
                color: "#999999",
                marginTop: 6,
              }}
            >
              {stat.sublabel}
            </div>
          </div>
        ))}
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              gap: 14,
              padding: "16px",
              background: "#FFFFFF",
              borderRadius: 10,
              border: item.stale
                ? `1px solid ${CRIMSON_BORDER}`
                : "1px solid rgba(0,0,0,0.05)",
              alignItems: "flex-start",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            {/* Number */}
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 15,
                fontWeight: 700,
                color: item.stale ? CRIMSON : "rgba(0,0,0,0.2)",
                minWidth: 32,
                textAlign: "right",
                paddingTop: 2,
              }}
            >
              #{item.id}
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 17,
                  color: "#1A1A1A",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {item.text}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 10,
                  alignItems: "center",
                  flexWrap: "wrap" as const,
                }}
              >
                <span
                  style={{
                    ...label,
                    color: "#999999",
                    fontWeight: 500,
                  }}
                >
                  {item.date}
                </span>
                {item.stale ? (
                  <span
                    style={{
                      ...label,
                      color: CRIMSON,
                      background: CRIMSON_SOFT,
                      padding: "3px 10px",
                      borderRadius: 4,
                    }}
                  >
                    Stale — {item.age}
                  </span>
                ) : (
                  <span style={{ ...label, color: "#999999", fontWeight: 500 }}>
                    {item.age} ago
                  </span>
                )}
              </div>
            </div>

            {/* Dismiss */}
            <button
              onClick={() => removeItem(item.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(0,0,0,0.25)",
                fontSize: 20,
                padding: "0 4px",
                lineHeight: 1,
                flexShrink: 0,
              }}
              aria-label="Remove item"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Heartbeat callout */}
      <div
        style={{
          marginTop: 24,
          padding: "16px 20px",
          background: "#F5F0E8",
          borderRadius: 10,
          border: "1px solid rgba(0,0,0,0.1)",
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: 20, lineHeight: 1.4 }}>🦏</span>
        <div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 15,
              color: "#666666",
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: "#1A1A1A" }}>Heartbeat nudge example:</strong>
            <br />
            &ldquo;You have {staleCount} item{staleCount !== 1 ? "s" : ""} in your inbox older
            than 24 hours. Want to review?&rdquo;
          </div>
          <div
            style={{
              ...label,
              color: "#999999",
              marginTop: 8,
              fontWeight: 500,
            }}
          >
            Only sends the count. Never lists items. You review when ready.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InboxWorkflow() {
  const [tab, setTab] = useState<"workflow" | "inbox">("workflow");

  const tabs = [
    { id: "workflow" as const, label: "How It Works" },
    { id: "inbox" as const, label: "Inbox View" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFFFFF",
        padding: "40px 20px 64px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 32,
              fontWeight: 400,
              color: "#000000",
              margin: "0 0 8px 0",
              lineHeight: 1.2,
            }}
          >
            The INBOX System
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 15,
              color: "#666666",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            One file. Zero decisions at capture time. Everything finds its home later.
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 0,
            marginBottom: 32,
            borderBottom: "1px solid rgba(0,0,0,0.1)",
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                padding: "12px 16px",
                border: "none",
                borderBottom: tab === t.id ? `2px solid ${CRIMSON}` : "2px solid transparent",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                fontSize: 15,
                fontWeight: 600,
                background: "transparent",
                color: tab === t.id ? CRIMSON : "#999999",
                textTransform: "uppercase",
                letterSpacing: "0.06rem",
                transition: "color 0.15s ease, border-color 0.15s ease",
                marginBottom: -1,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "workflow" ? <WorkflowView /> : <InboxView />}
      </div>
    </div>
  );
}
