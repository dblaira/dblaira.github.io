"use client";

import { useState, useEffect, useCallback } from "react";
import { SavySiteHeader } from "@/components/SavySiteHeader";
import { getSupabase } from "@/lib/supabase";

const CRIMSON = "#DC143C";

const PLACEHOLDERS = {
  what: "e.g. I want a comparison of the top 4 search APIs for structured data extraction",
  how: "e.g. When I'm choosing a search API, I like to find the top 4 options so I can understand where one is stronger than another — so I can pick the best fit for each use case",
  done: "e.g. 4 APIs chosen and ranked with pros/cons and a recommendation for each use case",
};

interface DelegationBrief {
  id: string;
  what: string;
  how: string | null;
  done: string;
  status: "draft" | "sent" | "in_progress" | "complete";
  sent_at: string;
}

const STATUS_CONFIG: Record<DelegationBrief["status"], { label: string; bg: string; color: string }> = {
  draft:       { label: "Draft",       bg: "rgba(0,0,0,0.06)",    color: "rgba(0,0,0,0.45)" },
  sent:        { label: "Sent",        bg: "rgba(217,119,6,0.12)", color: "#B45309" },
  in_progress: { label: "In Progress", bg: "rgba(37,99,235,0.12)", color: "#1D4ED8" },
  complete:    { label: "Complete",     bg: "rgba(22,163,74,0.12)", color: "#15803D" },
};

const STATUS_CYCLE: Record<string, DelegationBrief["status"]> = {
  sent: "in_progress",
  in_progress: "complete",
  complete: "sent",
};

function relativeDate(iso: string): string {
  const now = new Date();
  const d = new Date(iso);
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type FormStatus = "idle" | "sending" | "sent" | "error";

export default function DelegatePage() {
  const [what, setWhat] = useState("");
  const [how, setHow] = useState("");
  const [done, setDone] = useState("");
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");

  const [briefs, setBriefs] = useState<DelegationBrief[]>([]);
  const [loadingBriefs, setLoadingBriefs] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filled = what.trim().length > 0 && done.trim().length > 0;

  const fetchBriefs = useCallback(async () => {
    try {
      const { data, error } = await getSupabase()
        .from("delegation_briefs")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      setBriefs(data ?? []);
    } catch {
      // silent — briefs list is non-critical
    } finally {
      setLoadingBriefs(false);
    }
  }, []);

  useEffect(() => {
    fetchBriefs();
  }, [fetchBriefs]);

  async function handleSubmit() {
    if (!filled || formStatus === "sending") return;
    setFormStatus("sending");

    const whatVal = what.trim();
    const howVal = how.trim() || null;
    const doneVal = done.trim();

    try {
      const { error: insertError } = await getSupabase()
        .from("delegation_briefs")
        .insert({ what: whatVal, how: howVal, done: doneVal, status: "sent" });
      if (insertError) throw insertError;

      const brief = [
        "📋 *Delegation Brief*",
        "",
        "*1. What I want:*",
        whatVal,
        "",
        "*2. How I'd think about it:*",
        howVal || "_(not specified)_",
        "",
        "*3. What done looks like:*",
        doneVal,
      ].join("\n");

      await fetch("/api/delegate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
      });

      setFormStatus("sent");
      setWhat("");
      setHow("");
      setDone("");
      await fetchBriefs();
      setTimeout(() => setFormStatus("idle"), 4000);
    } catch {
      setFormStatus("error");
      setTimeout(() => setFormStatus("idle"), 4000);
    }
  }

  async function cycleStatus(b: DelegationBrief) {
    const next = STATUS_CYCLE[b.status];
    if (!next) return;
    setBriefs(prev => prev.map(x => x.id === b.id ? { ...x, status: next } : x));
    try {
      const { error } = await getSupabase()
        .from("delegation_briefs")
        .update({ status: next })
        .eq("id", b.id);
      if (error) throw error;
    } catch {
      await fetchBriefs();
    }
  }

  async function deleteBrief(id: string) {
    setBriefs(prev => prev.filter(x => x.id !== id));
    try {
      const { error } = await getSupabase()
        .from("delegation_briefs")
        .delete()
        .eq("id", id);
      if (error) throw error;
      await fetchBriefs();
    } catch {
      await fetchBriefs();
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A" }}>
      <SavySiteHeader />
      <div style={{ background: "#F5F0E8", minHeight: "calc(100vh - 56px)" }}>
        <div className="content-width" style={{ padding: "48px 24px 80px" }}>

          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(32px, 6vw, 44px)",
            fontWeight: 400,
            fontStyle: "italic",
            color: CRIMSON,
            lineHeight: 1.1,
            margin: "0 0 8px 0",
          }}>
            Delegate
          </h1>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "rgba(0,0,0,0.4)",
            margin: "0 0 40px 0",
          }}>
            Brief Po — thought to action in 3 steps
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <Field
              number="1"
              label="What I want"
              hint="The outcome in one sentence"
              value={what}
              onChange={setWhat}
              placeholder={PLACEHOLDERS.what}
              minRows={2}
            />
            <Field
              number="2"
              label="How I'd think about it"
              hint={'Start with \u201cWhen I\u2019m\u2026 I like to\u2026\u201d \u2014 optional but helps'}
              value={how}
              onChange={setHow}
              placeholder={PLACEHOLDERS.how}
              minRows={3}
              optional
            />
            <Field
              number="3"
              label="What done looks like"
              hint="The specific, measurable finish line"
              value={done}
              onChange={setDone}
              placeholder={PLACEHOLDERS.done}
              minRows={2}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!filled || formStatus === "sending"}
            style={{
              marginTop: 32,
              width: "100%",
              padding: "16px",
              background: filled && formStatus === "idle" ? CRIMSON : "rgba(0,0,0,0.15)",
              color: filled && formStatus === "idle" ? "#FFF" : "rgba(0,0,0,0.35)",
              border: "none",
              borderRadius: 12,
              fontFamily: "'Inter', sans-serif",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              cursor: filled && formStatus === "idle" ? "pointer" : "default",
              transition: "background 0.2s ease, color 0.2s ease",
            }}
          >
            {formStatus === "sending" ? "Delegating\u2026" :
             formStatus === "sent" ? "\u2713 Delegated" :
             formStatus === "error" ? "Error \u2014 try again" :
             "Delegate \u2192"}
          </button>

          {formStatus === "sent" && (
            <p style={{
              marginTop: 16,
              textAlign: "center",
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: "#22C55E",
            }}>
              Brief sent. Po will reply in Telegram.
            </p>
          )}

          {/* Recent briefs */}
          {!loadingBriefs && briefs.length > 0 && (
            <div style={{ marginTop: 48 }}>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(0,0,0,0.35)",
              }}>
                RECENT
              </span>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                {briefs.map(b => {
                  const expanded = expandedId === b.id;
                  const sc = STATUS_CONFIG[b.status];
                  const firstLine = b.what.length > 80 ? b.what.slice(0, 80) + "\u2026" : b.what;
                  return (
                    <div key={b.id} style={{
                      background: "#FFFFFF",
                      borderRadius: 12,
                      overflow: "hidden",
                    }}>
                      <div
                        onClick={() => setExpandedId(expanded ? null : b.id)}
                        style={{
                          padding: "14px 16px",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          cursor: "pointer",
                        }}
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); cycleStatus(b); }}
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            background: sc.bg,
                            color: sc.color,
                            border: "none",
                            borderRadius: 6,
                            padding: "4px 8px",
                            cursor: "pointer",
                            flexShrink: 0,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {sc.label}
                        </button>
                        <span style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 14,
                          fontWeight: 500,
                          color: "#1A1A1A",
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: expanded ? "normal" : "nowrap",
                        }}>
                          {expanded ? b.what : firstLine}
                        </span>
                        <span style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 11,
                          color: "rgba(0,0,0,0.3)",
                          flexShrink: 0,
                          whiteSpace: "nowrap",
                        }}>
                          {relativeDate(b.sent_at)}
                        </span>
                      </div>

                      {expanded && (
                        <div style={{
                          padding: "0 16px 16px",
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                        }}>
                          {b.how && (
                            <div>
                              <span style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                color: "rgba(0,0,0,0.35)",
                              }}>
                                HOW I&apos;D THINK ABOUT IT
                              </span>
                              <p style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: 13,
                                color: "#1A1A1A",
                                lineHeight: 1.5,
                                margin: "4px 0 0 0",
                              }}>
                                {b.how}
                              </p>
                            </div>
                          )}
                          <div>
                            <span style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              color: "rgba(0,0,0,0.35)",
                            }}>
                              WHAT DONE LOOKS LIKE
                            </span>
                            <p style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 13,
                              color: "#1A1A1A",
                              lineHeight: 1.5,
                              margin: "4px 0 0 0",
                            }}>
                              {b.done}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteBrief(b.id)}
                            style={{
                              alignSelf: "flex-end",
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 11,
                              fontWeight: 600,
                              color: CRIMSON,
                              background: "rgba(220,20,60,0.08)",
                              border: "none",
                              borderRadius: 6,
                              padding: "6px 10px",
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

interface FieldProps {
  number: string;
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  minRows: number;
  optional?: boolean;
}

function Field({ number, label, hint, value, onChange, placeholder, minRows, optional }: FieldProps) {
  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: 12,
      padding: "24px",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 11,
          fontWeight: 700,
          color: CRIMSON,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}>
          {number}
        </span>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 15,
          fontWeight: 700,
          color: "#1A1A1A",
        }}>
          {label}
        </span>
        {optional && (
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            color: "rgba(0,0,0,0.35)",
            letterSpacing: "0.06em",
          }}>
            optional
          </span>
        )}
      </div>
      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 12,
        color: "rgba(0,0,0,0.4)",
        margin: "0 0 12px 0",
      }}>
        {hint}
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={minRows}
        style={{
          width: "100%",
          border: "1.5px solid rgba(0,0,0,0.1)",
          borderRadius: 8,
          padding: "12px",
          fontFamily: "'Inter', sans-serif",
          fontSize: 14,
          color: "#1A1A1A",
          background: "#FAFAF8",
          resize: "vertical",
          outline: "none",
          lineHeight: 1.6,
          boxSizing: "border-box",
          transition: "border-color 0.15s ease",
        }}
        onFocus={(e) => { e.target.style.borderColor = CRIMSON; }}
        onBlur={(e) => { e.target.style.borderColor = "rgba(0,0,0,0.1)"; }}
      />
    </div>
  );
}
