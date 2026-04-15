"use client";

import { useState, useEffect, useCallback } from "react";
import { SavySiteHeader } from "@/components/SavySiteHeader";
import { getSupabase } from "@/lib/supabase";
import { beginEntryEdit } from "@/components/sleepDashboardActions";

// Psychedelic poster palette
const PSY_BG     = "#FF7A1E";
const PSY_PURPLE = "#FF9A1F";
const PSY_CYAN   = "#FFB347";
const PSY_YELLOW = "#FFEB00";
const PSY_PINK   = "#FFC928";
const PSY_RED    = "#FF6A00";
const PSY_MAROON = "#FFB347";
const PSY_CREAM  = "#FFF1CC";
const ROLLING_WINDOW_SIZE = 7;

const SLEEP_RATINGS = [
  { score: 10, label: "Perfect", desc: "Peak sleep. Fully restored, sharp, energized." },
  { score: 9,  label: "Excellent", desc: "Slept through, woke up feeling strong." },
  { score: 8,  label: "Very Good", desc: "Deep sleep, well rested, minor nothing." },
  { score: 7,  label: "Good", desc: "Solid sleep. Woke once maybe, still recovered." },
  { score: 6,  label: "Decent", desc: "Mostly solid. Minor disruption or early wake." },
  { score: 5,  label: "Average", desc: "Slept but not deeply. Functional." },
  { score: 4,  label: "Below Average", desc: "Light sleep, some disruption, a bit flat." },
  { score: 3,  label: "Poor", desc: "Restless. Under 5 hours or broken throughout." },
  { score: 2,  label: "Very Poor", desc: "Multiple wake-ups. Unrefreshed." },
  { score: 1,  label: "Terrible", desc: "Barely slept. Noticeable impairment." },
];

interface SleepEntry {
  id: string;
  date: string;
  score: number;
}

function formatLabel(date: string): string {
  return new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDayOnly(date: string): string {
  return new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    day: "numeric",
  });
}

function getAverageColor(averageScore: number | null): string {
  if (averageScore === null) return PSY_RED;
  if (averageScore >= 9) return PSY_PURPLE; // 9-10
  if (averageScore >= 7) return PSY_CYAN;   // 7-8
  if (averageScore >= 5) return PSY_YELLOW; // 5-6
  if (averageScore >= 3) return PSY_PINK;   // 3-4
  return PSY_RED;                           // 0-2
}

function DonutChart({ score, averageScore }: { score: number; averageScore: number | null }) {
  const size = 240;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 10) * circumference;
  const color = "#FFEB00";

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference - progress}`}
          strokeDashoffset={circumference * 0.25}
          style={{ transition: "stroke-dasharray 0.8s ease", filter: "drop-shadow(0 0 12px rgba(255,235,0,0.32))" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "'The Psychedelic Peace', 'Playfair Display', Georgia, serif",
            fontSize: 76,
            fontWeight: 400,
            color: "#FFD54A",
            lineHeight: 0.92,
          }}
        >
          {averageScore !== null ? averageScore.toFixed(1) : "—"}
        </span>
      </div>
    </div>
  );
}

function AreaChart({ data }: { data: SleepEntry[] }) {
  const width = 320;
  const height = 140;
  const padX = 32;
  const padTop = 16;
  const padBottom = 28;
  const chartW = width - padX * 2;
  const chartH = height - padTop - padBottom;

  const points = data.map((d, i) => ({
    x: padX + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW),
    y: padTop + chartH - (d.score / 10) * chartH,
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padTop + chartH} L ${points[0].x} ${padTop + chartH} Z`;
  const pointLabelStep = data.length <= 10 ? 1 : data.length <= 16 ? 2 : 3;
  const dateLabelStep = data.length <= 7 ? 1 : data.length <= 14 ? 2 : data.length <= 21 ? 3 : 4;

  const gridLines = [2, 4, 6, 8].map((v) => padTop + chartH - (v / 10) * chartH);

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block" }}
    >
      {gridLines.map((y, i) => (
        <line
          key={i}
          x1={padX}
          y1={y}
          x2={width - padX}
          y2={y}
          stroke="rgba(0,0,0,0.06)"
          strokeWidth={1}
        />
      ))}

      <path d={areaPath} fill="rgba(177, 74, 0, 0.55)" />
      <path d={linePath} fill="none" stroke={PSY_PURPLE} strokeWidth={2.5} strokeLinejoin="round" />

      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="rgba(177, 74, 0, 1)" stroke={PSY_PURPLE} strokeWidth={2} />
          {(i === points.length - 1 || i % pointLabelStep === 0) && (
            <text
              x={p.x}
              y={p.y - 12}
              textAnchor="middle"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                fill: "#FFEB00",
              }}
            >
              {p.score}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

export default function SleepDashboard() {
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newScore, setNewScore] = useState(7);
  const [added, setAdded] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchEntries = useCallback(async () => {
    try {
      const { data, error: fetchError } = await getSupabase()
        .from("sleep_entries")
        .select("*")
        .order("date");
      if (fetchError) throw fetchError;
      setEntries(data ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load entries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  async function addEntry() {
    setSaving(true);
    try {
      const { error: upsertError } = await getSupabase()
        .from("sleep_entries")
        .upsert({ date: newDate, score: newScore }, { onConflict: "date" });
      if (upsertError) throw upsertError;
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      await fetchEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save entry");
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntry(id: string) {
    try {
      const { error: deleteError } = await getSupabase()
        .from("sleep_entries")
        .delete()
        .eq("id", id);
      if (deleteError) throw deleteError;
      await fetchEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete entry");
    }
  }

  if (loading) {
    return (
      <div style={{ background: PSY_BG, minHeight: "100vh" }}>
        <SavySiteHeader />
        <div className="content-width" style={{ padding: "80px 24px", textAlign: "center" }}>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(0,0,0,0.35)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Loading sleep data...
          </span>
        </div>
      </div>
    );
  }

  const latest = entries.length > 0 ? entries[entries.length - 1] : null;
  const averageScore = entries.length > 0
    ? entries.slice(-ROLLING_WINDOW_SIZE).reduce((s, d) => s + d.score, 0) / Math.min(entries.length, ROLLING_WINDOW_SIZE)
    : null;
  const averageColor = getAverageColor(averageScore);
  const avg = averageScore !== null ? averageScore.toFixed(1) : "—";
  const entriesAsc = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const entriesDesc = [...entriesAsc].reverse();
  const rollingColorById: Record<string, string> = {};
  entriesAsc.forEach((entry, idx) => {
    const start = Math.max(0, idx - (ROLLING_WINDOW_SIZE - 1));
    const windowEntries = entriesAsc.slice(start, idx + 1);
    const rollingAverage =
      windowEntries.reduce((sum, e) => sum + e.score, 0) / windowEntries.length;
    rollingColorById[entry.id] = getAverageColor(rollingAverage);
  });

  return (
    <div
      style={{
        backgroundColor: PSY_BG,
        backgroundImage: "radial-gradient(circle, rgba(255,235,0,0.78) 0 3px, transparent 3px), radial-gradient(circle, rgba(255,201,40,0.22) 0 88px, transparent 88px)",
        backgroundSize: "18px 18px, 320px 320px",
        backgroundPosition: "0 0, 50% 120px",
        minHeight: "100vh",
      }}
    >
      <SavySiteHeader />

      <div className="content-width" style={{ padding: "38px 24px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h1
            style={{
              fontFamily: "'The Psychedelic Peace', 'Playfair Display', Georgia, serif",
              fontSize: "clamp(48px, 11vw, 92px)",
              fontWeight: 400,
              color: "#FFE36A",
              lineHeight: 0.9,
              margin: 0,
            }}
          >
            How You
            <br />
            Slept
          </h1>
        </div>
      </div>

      {error && (
        <div className="content-width" style={{ padding: "0 24px 16px" }}>
          <div
            style={{
              background: "rgba(86,0,204,0.06)",
              border: `1px solid ${PSY_PURPLE}30`,
              borderRadius: 12,
              padding: "12px 16px",
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: PSY_PURPLE,
            }}
          >
            {error}
          </div>
        </div>
      )}

      {latest && (
        <div className="content-width" style={{ padding: "0 24px 28px" }}>
          <div
            style={{
              background: "rgb(254, 191, 20)",
              border: "1px solid rgba(254, 191, 20, 0.32)",
              borderRadius: 28,
              padding: "28px 24px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
            }}
          >
            <DonutChart score={latest.score} averageScore={averageScore} />
          </div>
        </div>
      )}

      {/* Add entry */}
      <div className="content-width" style={{ padding: "0 24px 24px" }}>
        <div style={{ background: "rgb(254, 191, 20)", border: "1px solid rgba(254, 191, 20, 0.32)", borderRadius: 28, padding: "24px" }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#FFEB00" }}>
            LOG A NIGHT
          </span>
          <div style={{ display: "flex", gap: 12, marginTop: 16, alignItems: "flex-end", flexWrap: "wrap" as const }}>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#FFFFFF", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>Date</label>
              <input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, border: "1.5px solid rgba(255,255,255,0.28)", borderRadius: 8, padding: "8px 12px", color: "#FFFFFF", background: "transparent", outline: "none", WebkitAppearance: "none", appearance: "none" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#FFFFFF", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>Score</label>
              <select
                value={newScore}
                onChange={e => setNewScore(Number(e.target.value))}
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, border: "1.5px solid rgba(255,255,255,0.28)", borderRadius: 8, padding: "8px 12px", color: "#FFFFFF", background: "transparent", outline: "none" }}
              >
                {SLEEP_RATINGS.map(r => (
                  <option key={r.score} value={r.score}>{r.score} — {r.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={addEntry}
              disabled={saving}
              style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", background: added ? PSY_CYAN : PSY_PURPLE, color: "#FFFFFF", border: "none", borderRadius: 8, padding: "10px 20px", cursor: saving ? "wait" : "pointer", transition: "background 0.3s", opacity: saving ? 0.7 : 1 }}
            >
              {added ? "✓ Added" : saving ? "Saving..." : "Add"}
            </button>
          </div>
        </div>
      </div>

      {/* Area chart — trend */}
      {entries.length >= 2 && (
        <div className="content-width" style={{ padding: "0 24px 24px" }}>
          <div
            style={{
              background: "rgb(254, 191, 20)",
              border: "1px solid rgba(254, 191, 20, 0.32)",
              borderRadius: 28,
              padding: "24px 20px",
            }}
          >
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#FFE36A",
                paddingLeft: 8,
              }}
            >
              TREND
            </span>
            <div style={{ marginTop: 16 }}>
              <AreaChart data={entries} />
            </div>
          </div>
        </div>
      )}

      {/* Logged entries — editable */}
      {entries.length > 0 && (
        <div className="content-width" style={{ padding: "0 24px 24px" }}>
          <div style={{ background: "rgb(254, 191, 20)", border: "1px solid rgba(254, 191, 20, 0.32)", borderRadius: 28, padding: "24px" }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#FFE36A" }}>
              YOUR ENTRIES
            </span>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column" as const, borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255, 154, 31, 0.28)" }}>
              {entriesDesc.map((e, i) => {
                const rating = SLEEP_RATINGS.find(r => r.score === e.score);
                const bg = i % 2 === 0 ? "rgba(255, 214, 74, 0.45)" : "rgba(255, 227, 106, 0.42)";
                const rollingColor = rollingColorById[e.id] ?? averageColor;
                return (
                  <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: bg }}>
                    <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 42, fontWeight: 900, color: rollingColor, minWidth: 40, textAlign: "right" as const, lineHeight: 1 }}>{e.score}</span>
                    <div style={{ width: 3, height: 32, borderRadius: 2, background: rollingColor, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 42, fontWeight: 900, color: rollingColor }}>{formatDayOnly(e.date)}</div>
                    </div>
                    <button
                      onClick={() => beginEntryEdit(e, setNewDate, setNewScore)}
                      title="Edit"
                      style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, color: "#D97706", background: "rgba(217,119,6,0.08)", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", marginRight: 4 }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEntry(e.id)}
                      title="Delete"
                      style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, color: PSY_RED, background: "rgba(252,0,25,0.08)", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Rating scale reference */}
      <div className="content-width" style={{ padding: "0 24px 24px" }}>
        <div style={{ background: "rgb(254, 191, 20)", border: "1px solid rgba(254, 191, 20, 0.32)", borderRadius: 28, padding: "24px" }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#FFE36A" }}>
            RATING SCALE
          </span>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column" as const, borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255, 154, 31, 0.28)" }}>
            {SLEEP_RATINGS.map((r, i) => {
              const scoreColor = getAverageColor(r.score);
              const bg = i % 2 === 0 ? "rgba(255, 214, 74, 0.45)" : "rgba(255, 227, 106, 0.42)";
              return (
                <div key={r.score} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", background: bg }}>
                  <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 700, color: scoreColor, minWidth: 32, textAlign: "right" as const, lineHeight: 1 }}>{r.score}</span>
                  <div style={{ width: 3, height: 36, borderRadius: 2, background: scoreColor, flexShrink: 0 }} />
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 2 }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700, color: "#1A1A1A", letterSpacing: "-0.01em" }}>{r.label}</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(0,0,0,0.5)", lineHeight: 1.4 }}>{r.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CHI research note */}
      <div className="content-width" style={{ padding: "0 24px 40px" }}>
        <div
          style={{
            background: "rgb(254, 191, 20)",
            border: "1px solid rgba(254, 191, 20, 0.32)",
            borderRadius: 28,
            padding: "24px",
            display: "flex",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 3,
              background: PSY_PURPLE,
              borderRadius: 2,
              flexShrink: 0,
            }}
          />
          <div>
            <p
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 15,
                fontStyle: "italic",
                color: "#1A1A1A",
                lineHeight: 1.6,
                margin: "0 0 8px 0",
              }}
            >
              &ldquo;Visuals beat text in 7 of 8 sleep insight categories. Area charts work best for weekly trends. Donut charts for single-night scores.&rdquo;
            </p>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                color: "rgba(0,0,0,0.3)",
              }}
            >
              ACM CHI 2022 — Sleep Visualization Research
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
