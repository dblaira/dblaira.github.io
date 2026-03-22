"use client";

import { useState, useEffect, useMemo } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const CRIMSON = "#DC143C";

interface EmotionLog {
  id: string;
  emotion: string;
  energy: "high" | "low";
  valence: "pleasant" | "unpleasant";
  trigger_tag: string | null;
  created_at: string;
}

const FAMILY_COLORS: Record<string, string> = {
  Joy: "#FACC15",
  Ecstasy: "#FACC15",
  Serenity: "#FACC15",
  Trust: "#86EFAC",
  Admiration: "#86EFAC",
  Acceptance: "#86EFAC",
  Fear: "#6EE7B7",
  Terror: "#6EE7B7",
  Apprehension: "#6EE7B7",
  Surprise: "#67E8F9",
  Amazement: "#67E8F9",
  Distraction: "#67E8F9",
  Sadness: "#93C5FD",
  Grief: "#93C5FD",
  Pensiveness: "#93C5FD",
  Disgust: "#C4B5FD",
  Loathing: "#C4B5FD",
  Boredom: "#C4B5FD",
  Anger: "#FCA5A5",
  Rage: "#FCA5A5",
  Annoyance: "#FCA5A5",
  Anticipation: "#FDBA74",
  Vigilance: "#FDBA74",
  Interest: "#FDBA74",
};

function colorFor(emotion: string) {
  return FAMILY_COLORS[emotion] ?? "rgba(0,0,0,0.2)";
}

function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function daysAgo(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / 86400000);
}

function formatDay(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function EmotionHistory() {
  const [logs, setLogs] = useState<EmotionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createSupabaseBrowser();
        const { data } = await supabase
          .from("emotion_logs")
          .select("id, emotion, energy, valence, trigger_tag, created_at")
          .order("created_at", { ascending: false })
          .limit(100);
        if (data) setLogs(data as EmotionLog[]);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const quadrants = useMemo(() => {
    const q = {
      hp: [] as EmotionLog[], // high pleasant
      hu: [] as EmotionLog[], // high unpleasant
      lp: [] as EmotionLog[], // low pleasant
      lu: [] as EmotionLog[], // low unpleasant
    };
    for (const log of logs) {
      const key = `${log.energy === "high" ? "h" : "l"}${log.valence === "pleasant" ? "p" : "u"}` as keyof typeof q;
      q[key].push(log);
    }
    return q;
  }, [logs]);

  const triggerData = useMemo(() => {
    const map = new Map<string, EmotionLog[]>();
    for (const log of logs) {
      const tag = log.trigger_tag || "Untagged";
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag)!.push(log);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1].length - a[1].length);
  }, [logs]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(0,0,0,0.3)", fontFamily: "'Inter', sans-serif", fontSize: 14 }}>
        Loading history...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(0,0,0,0.3)", fontFamily: "'Inter', sans-serif", fontSize: 14 }}>
        No check-ins yet. Log your first emotion above.
      </div>
    );
  }

  const svgSize = 320;
  const pad = 40;
  const inner = svgSize - pad * 2;
  const half = inner / 2;
  const cx = svgSize / 2;
  const cy = svgSize / 2;

  function dotPosition(log: EmotionLog, idx: number, total: number) {
    const h = hashCode(log.id);
    const cols = Math.ceil(Math.sqrt(total));
    const row = Math.floor(idx / cols);
    const col = idx % cols;

    const cellW = half / (cols + 1);
    const cellH = half / (Math.ceil(total / cols) + 1);

    let baseX = log.valence === "pleasant" ? cx + 12 : cx - 12 - half;
    let baseY = log.energy === "high" ? cy - 12 - half : cy + 12;

    const jitterX = ((h % 17) / 17 - 0.5) * cellW * 0.4;
    const jitterY = ((h % 13) / 13 - 0.5) * cellH * 0.4;

    const x = baseX + (col + 1) * cellW + jitterX;
    const y = baseY + (row + 1) * cellH + jitterY;
    return { x: Math.max(pad, Math.min(svgSize - pad, x)), y: Math.max(pad, Math.min(svgSize - pad, y)) };
  }

  const maxTriggerCount = triggerData.length > 0 ? triggerData[0][1].length : 1;

  return (
    <div>
      {/* Quadrant scatter */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          padding: "24px 16px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, padding: "0 8px" }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(0,0,0,0.35)" }}>
            Emotion Map
          </span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(0,0,0,0.3)" }}>
            {logs.length} check-in{logs.length !== 1 ? "s" : ""}
          </span>
        </div>

        <svg viewBox={`0 0 ${svgSize} ${svgSize}`} style={{ width: "100%", maxWidth: svgSize, display: "block", margin: "0 auto" }}>
          {/* Quadrant backgrounds */}
          <rect x={cx} y={pad} width={half} height={half} fill="rgba(250,204,21,0.06)" rx={4} />
          <rect x={pad} y={pad} width={half} height={half} fill="rgba(252,165,165,0.06)" rx={4} />
          <rect x={cx} y={cy} width={half} height={half} fill="rgba(134,239,172,0.06)" rx={4} />
          <rect x={pad} y={cy} width={half} height={half} fill="rgba(147,197,253,0.06)" rx={4} />

          {/* Axes */}
          <line x1={cx} y1={pad} x2={cx} y2={svgSize - pad} stroke="rgba(0,0,0,0.08)" strokeWidth={1} />
          <line x1={pad} y1={cy} x2={svgSize - pad} y2={cy} stroke="rgba(0,0,0,0.08)" strokeWidth={1} />

          {/* Axis labels */}
          <text x={svgSize - pad + 4} y={cy} textAnchor="start" dominantBaseline="central" fill="rgba(0,0,0,0.2)" fontFamily="'Inter', sans-serif" fontSize={8} fontWeight={600} letterSpacing="0.06em">+</text>
          <text x={pad - 4} y={cy} textAnchor="end" dominantBaseline="central" fill="rgba(0,0,0,0.2)" fontFamily="'Inter', sans-serif" fontSize={8} fontWeight={600}>−</text>
          <text x={cx} y={pad - 8} textAnchor="middle" fill="rgba(0,0,0,0.2)" fontFamily="'Inter', sans-serif" fontSize={8} fontWeight={600} letterSpacing="0.06em">HIGH</text>
          <text x={cx} y={svgSize - pad + 14} textAnchor="middle" fill="rgba(0,0,0,0.2)" fontFamily="'Inter', sans-serif" fontSize={8} fontWeight={600} letterSpacing="0.06em">LOW</text>

          {/* Dots */}
          {(["hp", "hu", "lp", "lu"] as const).map((qKey) => {
            const qLogs = quadrants[qKey];
            return qLogs.map((log, i) => {
              const pos = dotPosition(log, i, qLogs.length);
              const age = daysAgo(log.created_at);
              const opacity = Math.max(0.4, 1 - age * 0.03);
              const r = age < 1 ? 7 : age < 7 ? 5.5 : 4;
              return (
                <g key={log.id}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={r}
                    fill={colorFor(log.emotion)}
                    opacity={opacity}
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
                  />
                  <title>{`${log.emotion} — ${formatDay(log.created_at)}${log.trigger_tag ? ` (${log.trigger_tag})` : ""}`}</title>
                </g>
              );
            });
          })}

          {/* Quadrant count badges */}
          {([
            { key: "hp" as const, x: svgSize - pad - 8, y: pad + 14 },
            { key: "hu" as const, x: pad + 8, y: pad + 14 },
            { key: "lp" as const, x: svgSize - pad - 8, y: svgSize - pad - 8 },
            { key: "lu" as const, x: pad + 8, y: svgSize - pad - 8 },
          ]).map(({ key, x, y }) => {
            const count = quadrants[key].length;
            if (count === 0) return null;
            return (
              <text
                key={key}
                x={x}
                y={y}
                textAnchor={key.includes("p") ? "end" : "start"}
                fill="rgba(0,0,0,0.15)"
                fontFamily="'Inter', sans-serif"
                fontSize={20}
                fontWeight={700}
              >
                {count}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Trigger breakdown */}
      {triggerData.length > 0 && (
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "24px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(0,0,0,0.35)", display: "block", marginBottom: 20 }}>
            Triggers
          </span>

          {triggerData.map(([tag, tagLogs]) => (
            <div key={tag} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: "#1A1A1A" }}>
                  {tag}
                </span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(0,0,0,0.3)" }}>
                  {tagLogs.length}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  height: 12,
                  borderRadius: 6,
                  overflow: "hidden",
                  background: "rgba(0,0,0,0.03)",
                }}
              >
                {tagLogs.map((log, i) => (
                  <div
                    key={log.id}
                    title={`${log.emotion} — ${formatDay(log.created_at)}`}
                    style={{
                      flex: `0 0 ${(1 / maxTriggerCount) * 100}%`,
                      background: colorFor(log.emotion),
                      opacity: 0.85,
                      borderRight: i < tagLogs.length - 1 ? "1px solid rgba(255,255,255,0.5)" : undefined,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent timeline strip */}
      {logs.length > 1 && (
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "24px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            marginTop: 24,
          }}
        >
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(0,0,0,0.35)", display: "block", marginBottom: 16 }}>
            Recent
          </span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {logs.slice(0, 30).map((log) => (
              <div
                key={log.id}
                title={`${log.emotion} — ${formatDay(log.created_at)}${log.trigger_tag ? ` (${log.trigger_tag})` : ""}`}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: colorFor(log.emotion),
                  opacity: 0.85,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 8,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  color: "rgba(0,0,0,0.5)",
                }}
              >
                {log.emotion.slice(0, 2)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
