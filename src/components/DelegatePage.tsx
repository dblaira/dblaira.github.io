"use client";

import { useState } from "react";
import { SavySiteHeader } from "@/components/SavySiteHeader";

const CRIMSON = "#DC143C";

const PLACEHOLDERS = {
  what: "e.g. I want the best search API assigned to each subagent Po manages in OpenClaw",
  how: "e.g. When I'm choosing a search API, I like to find the top 4 options so I can understand where one is stronger than another — so I can assign specific APIs to specific subagents to improve data quality over time",
  done: "e.g. 4 APIs chosen and ranked for each major business branch, assigned to each subagent — even if that agent is name-only and not yet live",
};

type Status = "idle" | "sending" | "sent" | "error";

export default function DelegatePage() {
  const [what, setWhat] = useState("");
  const [how, setHow] = useState("");
  const [done, setDone] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const filled = what.trim().length > 0 && done.trim().length > 0;

  async function handleSubmit() {
    if (!filled || status === "sending") return;
    setStatus("sending");

    const brief = [
      "📋 *Delegation Brief*",
      "",
      "*1. What I want:*",
      what.trim(),
      "",
      "*2. How I'd think about it:*",
      how.trim() || "_(not specified)_",
      "",
      "*3. What done looks like:*",
      done.trim(),
    ].join("\n");

    try {
      const res = await fetch("/api/delegate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("sent");
      setWhat("");
      setHow("");
      setDone("");
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A" }}>
      <SavySiteHeader />
      <div style={{ background: "#F5F0E8", minHeight: "calc(100vh - 56px)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>

          {/* Header */}
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

          {/* Fields */}
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

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!filled || status === "sending"}
            style={{
              marginTop: 32,
              width: "100%",
              padding: "16px",
              background: filled && status === "idle" ? CRIMSON : "rgba(0,0,0,0.15)",
              color: filled && status === "idle" ? "#FFF" : "rgba(0,0,0,0.35)",
              border: "none",
              borderRadius: 12,
              fontFamily: "'Inter', sans-serif",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              cursor: filled && status === "idle" ? "pointer" : "default",
              transition: "background 0.2s ease, color 0.2s ease",
            }}
          >
            {status === "sending" ? "Sending…" :
             status === "sent" ? "✓ Sent to Po" :
             status === "error" ? "Error — try again" :
             "Send to Po →"}
          </button>

          {status === "sent" && (
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
