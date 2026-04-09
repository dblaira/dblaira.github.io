"use client";

import { useState, useEffect, useCallback } from "react";
import { SavySiteHeader } from "@/components/SavySiteHeader";
import { getSupabase } from "@/lib/supabase";

const CRIMSON = "#DC143C";
const CREAM = "#F5F0E8";

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

function getAverageColor(averageScore: number | null): string {
  if (averageScore === null) return CRIMSON;
  if (averageScore >= 7) return CRIMSON;
  if (averageScore >= 5) return "#22C55E";
  return "#111111";
}

function DonutChart({ score, averageScore }: { score: number; averageScore: number | null }) {
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 10) * circumference;
  const color = getAverageColor(averageScore);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth={strokeWidth}
        />
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
          style={{ transition: "stroke-dasharray 0.8s ease" }}
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
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 48,
            fontWeight: 400,
            color: "#1A1A1A",
            lineHeight: 1,
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(0,0,0,0.35)",
            marginTop: 4,
          }}
        >
          / 10
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

      <path d={areaPath} fill={`${CRIMSON}15`} />
      <path d={linePath} fill="none" stroke={CRIMSON} strokeWidth={2.5} strokeLinejoin="round" />

      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="#FFFFFF" stroke={CRIMSON} strokeWidth={2} />
          {(i === points.length - 1 || i % pointLabelStep === 0) && (
            <text
              x={p.x}
              y={p.y - 12}
              textAnchor="middle"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                fill: "#1A1A1A",
              }}
            >
              {p.score}
            </text>
          )}
          {(i === 0 || i === points.length - 1 || i % dateLabelStep === 0) && (
            <text
              x={p.x}
              y={height - 6}
              textAnchor="middle"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 10,
                fill: "rgba(0,0,0,0.35)",
              }}
            >
              {formatLabel(p.date)}
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
      <div style={{ background: CREAM, minHeight: "100vh" }}>
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
    ? entries.reduce((s, d) => s + d.score, 0) / entries.length
    : null;
  const averageColor = getAverageColor(averageScore);
  const avg = averageScore !== null ? averageScore.toFixed(1) : "—";
  const entriesAsc = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const entriesDesc = [...entriesAsc].reverse();
  const rollingColorById: Record<string, string> = {};
  let rollingTotal = 0;
  entriesAsc.forEach((entry, idx) => {
    rollingTotal += entry.score;
    const rollingAverage = rollingTotal / (idx + 1);
    rollingColorById[entry.id] = getAverageColor(rollingAverage);
  });

  return (
    <div style={{ background: CREAM, minHeight: "100vh" }}>
      <SavySiteHeader />

      {/* Header */}
      <div className="content-width" style={{ padding: "40px 24px 24px" }}>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: CRIMSON,
          }}
        >
          SLEEP
        </span>
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(32px, 7vw, 44px)",
            fontWeight: 400,
            fontStyle: "italic",
            color: "#1A1A1A",
            lineHeight: 1.15,
            margin: "8px 0 0 0",
          }}
        >
          How You Slept
        </h1>
      </div>

      {error && (
        <div className="content-width" style={{ padding: "0 24px 16px" }}>
          <div
            style={{
              background: "rgba(220,20,60,0.06)",
              border: `1px solid ${CRIMSON}30`,
              borderRadius: 12,
              padding: "12px 16px",
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: CRIMSON,
            }}
          >
            {error}
          </div>
        </div>
      )}

      {/* Today's score — donut */}
      {latest && (
        <div className="content-width" style={{ padding: "0 24px 24px" }}>
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              padding: "32px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(0,0,0,0.35)",
              }}
            >
              LATEST — {formatLabel(latest.date).toUpperCase()}
            </span>
            <DonutChart score={latest.score} averageScore={averageScore} />
            <div style={{ display: "flex", gap: 32, marginTop: 10 }}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 34,
                    color: "#1A1A1A",
                  }}
                >
                  {avg}
                </div>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(0,0,0,0.35)",
                    marginTop: 2,
                  }}
                >
                  AVG
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 34,
                    color: "#1A1A1A",
                  }}
                >
                  {entries.length}
                </div>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(0,0,0,0.35)",
                    marginTop: 2,
                  }}
                >
                  NIGHTS
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Area chart — trend */}
      {entries.length >= 2 && (
        <div className="content-width" style={{ padding: "0 24px 24px" }}>
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              padding: "24px 16px",
            }}
          >
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(0,0,0,0.35)",
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

      {/* Add entry */}
      <div className="content-width" style={{ padding: "0 24px 24px" }}>
        <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "24px" }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "rgba(0,0,0,0.35)" }}>
            LOG A NIGHT
          </span>
          <div style={{ display: "flex", gap: 12, marginTop: 16, alignItems: "flex-end", flexWrap: "wrap" as const }}>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(0,0,0,0.4)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>Date</label>
              <input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, border: "1.5px solid rgba(0,0,0,0.1)", borderRadius: 8, padding: "8px 12px", color: "#1A1A1A", background: CREAM, outline: "none" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(0,0,0,0.4)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>Score</label>
              <select
                value={newScore}
                onChange={e => setNewScore(Number(e.target.value))}
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, border: "1.5px solid rgba(0,0,0,0.1)", borderRadius: 8, padding: "8px 12px", color: "#1A1A1A", background: CREAM, outline: "none" }}
              >
                {SLEEP_RATINGS.map(r => (
                  <option key={r.score} value={r.score}>{r.score} — {r.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={addEntry}
              disabled={saving}
              style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", background: added ? "#22C55E" : CRIMSON, color: "#FFFFFF", border: "none", borderRadius: 8, padding: "10px 20px", cursor: saving ? "wait" : "pointer", transition: "background 0.3s", opacity: saving ? 0.7 : 1 }}
            >
              {added ? "✓ Added" : saving ? "Saving..." : "Add"}
            </button>
          </div>
        </div>
      </div>

      {/* Logged entries — editable */}
      {entries.length > 0 && (
        <div className="content-width" style={{ padding: "0 24px 24px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "24px" }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "rgba(0,0,0,0.35)" }}>
              YOUR ENTRIES
            </span>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column" as const, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,0.07)" }}>
              {entriesDesc.map((e, i) => {
                const rating = SLEEP_RATINGS.find(r => r.score === e.score);
                const bg = i % 2 === 0 ? "#FFFFFF" : "#F5F0E8";
                const rollingColor = rollingColorById[e.id] ?? averageColor;
                return (
                  <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: bg }}>
                    <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 26, fontWeight: 700, color: rollingColor, minWidth: 30, textAlign: "right" as const, lineHeight: 1 }}>{e.score}</span>
                    <div style={{ width: 3, height: 32, borderRadius: 2, background: rollingColor, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700, color: "#1A1A1A" }}>{formatLabel(e.date)}</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(0,0,0,0.4)" }}>{rating?.label}</div>
                    </div>
                    <button
                      onClick={() => { setNewDate(e.date); setNewScore(e.score); deleteEntry(e.id); }}
                      title="Edit"
                      style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, color: "#D97706", background: "rgba(217,119,6,0.08)", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", marginRight: 4 }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEntry(e.id)}
                      title="Delete"
                      style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, color: CRIMSON, background: "rgba(220,20,60,0.08)", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer" }}
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
        <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "24px" }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "rgba(0,0,0,0.35)" }}>
            RATING SCALE
          </span>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column" as const, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,0.07)" }}>
            {SLEEP_RATINGS.map((r, i) => {
              const scoreColor = r.score >= 7 ? CRIMSON : r.score >= 5 ? "#22C55E" : "#111111";
              const bg = i % 2 === 0 ? "#FFFFFF" : "#F5F0E8";
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
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "24px",
            display: "flex",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 3,
              background: CRIMSON,
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
