"use client";

import { useState, useEffect, useCallback } from "react";
import { SavySiteHeader } from "@/components/SavySiteHeader";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import type { InboxItemRow, InboxItemDisplay } from "@/lib/types";

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

const DESTINATIONS: Destination[] = [
  { name: "SOUL.md", desc: "Agent personality & rules", icon: "🧠" },
  { name: "CONVENTIONS.md", desc: "Design & code rules", icon: "📐" },
  { name: ".cursorrules", desc: "Cursor AI instructions", icon: "⌨️" },
  { name: "Project docs", desc: "App-specific notes", icon: "📁" },
  { name: "Notion", desc: "Strategy & planning", icon: "📋" },
  { name: "🗑️ Delete", desc: "Done or not needed", icon: "" },
];

const labelStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08rem",
};

function formatRelativeAge(createdAt: string): string {
  const now = Date.now();
  const created = new Date(createdAt).getTime();
  const diffMs = now - created;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min`;
  if (diffHrs < 24) return `${diffHrs} hr${diffHrs !== 1 ? "s" : ""}`;
  return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
}

function formatDate(createdAt: string): string {
  const d = new Date(createdAt);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function toDisplay(row: InboxItemRow): InboxItemDisplay {
  const diffMs = Date.now() - new Date(row.created_at).getTime();
  return {
    id: row.id,
    text: row.text,
    created_at: row.created_at,
    date: formatDate(row.created_at),
    age: formatRelativeAge(row.created_at),
    stale: diffMs > 86400000,
  };
}

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
                    ...labelStyle,
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
                              ...labelStyle,
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
                    ...labelStyle,
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
            ...labelStyle,
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
                  ...labelStyle,
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
  const [items, setItems] = useState<InboxItemDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const supabase = createSupabaseBrowser();
      const { data, error } = await supabase
        .from("inbox_items")
        .select("*")
        .is("resolved_at", null)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setItems((data as InboxItemRow[]).map(toDisplay));
      }
    } catch {
      // Supabase not configured yet — show empty state
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async () => {
    const text = newText.trim();
    if (!text || submitting) return;

    setSubmitting(true);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.from("inbox_items").insert({ text });

    if (!error) {
      setNewText("");
      await fetchItems();
    }
    setSubmitting(false);
  };

  const resolveItem = async (id: string, destination: string) => {
    const supabase = createSupabaseBrowser();
    await supabase
      .from("inbox_items")
      .update({ resolved_at: new Date().toISOString(), destination })
      .eq("id", id);

    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const staleCount = items.filter((i) => i.stale).length;

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0", color: "#999999", fontSize: 15 }}>
        Loading...
      </div>
    );
  }

  return (
    <div>
      {/* Capture input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addItem();
        }}
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
        }}
      >
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Capture something..."
          style={{
            flex: 1,
            padding: "12px 16px",
            fontFamily: "'Inter', sans-serif",
            fontSize: 17,
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: 8,
            background: "#FAFAFA",
            color: "#1A1A1A",
            outline: "none",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = CRIMSON;
            e.currentTarget.style.outline = `2px solid ${CRIMSON}`;
            e.currentTarget.style.outlineOffset = "2px";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)";
            e.currentTarget.style.outline = "none";
          }}
        />
        <button
          type="submit"
          disabled={!newText.trim() || submitting}
          style={{
            padding: "12px 20px",
            fontFamily: "'Inter', sans-serif",
            fontSize: 15,
            fontWeight: 600,
            background: newText.trim() ? CRIMSON : "#E5E5E5",
            color: newText.trim() ? "#FFFFFF" : "#999999",
            border: "none",
            borderRadius: 8,
            cursor: newText.trim() ? "pointer" : "default",
            transition: "background 0.15s ease",
            whiteSpace: "nowrap" as const,
          }}
        >
          {submitting ? "..." : "Add"}
        </button>
      </form>

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
                ...labelStyle,
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
      {items.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 20px",
            color: "#999999",
            fontSize: 15,
          }}
        >
          Inbox is empty. Capture something above.
        </div>
      ) : (
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
                      ...labelStyle,
                      color: "#999999",
                      fontWeight: 500,
                    }}
                  >
                    {item.date}
                  </span>
                  {item.stale ? (
                    <span
                      style={{
                        ...labelStyle,
                        color: CRIMSON,
                        background: CRIMSON_SOFT,
                        padding: "3px 10px",
                        borderRadius: 4,
                      }}
                    >
                      Stale — {item.age}
                    </span>
                  ) : (
                    <span style={{ ...labelStyle, color: "#999999", fontWeight: 500 }}>
                      {item.age} ago
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => resolveItem(item.id, "deleted")}
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
      )}

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
              ...labelStyle,
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
    <div style={{ minHeight: "100vh", background: "#0A0A0A" }}>
      <SavySiteHeader />
      <div
        style={{
          minHeight: "calc(100vh - env(safe-area-inset-top, 0px))",
          background: "#FFFFFF",
          padding: "40px 20px 64px",
          fontFamily: "'Inter', sans-serif",
        }}
      >
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
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

        {tab === "workflow" ? <WorkflowView /> : <InboxView />}
      </div>
      </div>
    </div>
  );
}
