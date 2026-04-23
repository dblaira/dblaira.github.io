"use client";

import { useState, useEffect, useCallback } from "react";
import { SavySiteHeader } from "@/components/SavySiteHeader";
import { getSupabase } from "@/lib/supabase";
import { useTheme } from "@/lib/useTheme";
import { beginEntryEdit } from "@/components/sleepDashboardActions";
import { EditModeProvider, useEditMode } from "@/lib/useEditMode";
import { Editable } from "@/components/Editable";
import { EditColorSheet } from "@/components/EditColorSheet";
import { EditToast } from "@/components/EditToast";

// Tier colors encode data meaning (quality of score), not branding.
// These stay fixed so "red = bad, purple = great" never changes.
const TIER_VERY_HIGH = "#FF9A1F"; // 9-10
const TIER_HIGH      = "#FFB347"; // 7-8
const TIER_MID       = "#FFEB00"; // 5-6
const TIER_LOW       = "#FFC928"; // 3-4
const TIER_VERY_LOW  = "#FF6A00"; // 0-2

// Brand/look defaults used if Studio hasn't supplied accents yet.
const DEFAULT_INK        = "#FFE36A"; // headline + section labels + score number
const DEFAULT_SURFACE    = "#FEBF14"; // card backgrounds
const DEFAULT_RING       = "#FFEB00"; // donut stroke + area-chart line
const DEFAULT_ATMOSPHERE = "#FFC928"; // page dot pattern tint
const DEFAULT_CTA        = "#FF9A1F"; // Add button + error accent

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
  if (averageScore === null) return TIER_VERY_LOW;
  if (averageScore >= 9) return TIER_VERY_HIGH;
  if (averageScore >= 7) return TIER_HIGH;
  if (averageScore >= 5) return TIER_MID;
  if (averageScore >= 3) return TIER_LOW;
  return TIER_VERY_LOW;
}

function DonutChart({
  score,
  averageScore,
  ring,
  ink,
}: {
  score: number;
  averageScore: number | null;
  ring: string;
  ink: string;
}) {
  const size = 240;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 10) * circumference;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ring}
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
            fontFamily: "'The Psychedelic Peace', 'Playfair Display', Georgia, serif",
            fontSize: 76,
            fontWeight: 400,
            color: ink,
            lineHeight: 0.92,
          }}
        >
          {averageScore !== null ? averageScore.toFixed(1) : "—"}
        </span>
      </div>
    </div>
  );
}

function AreaChart({
  data,
  line,
  fill,
  label,
}: {
  data: SleepEntry[];
  line: string;
  fill: string;
  label: string;
}) {
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

      <path d={areaPath} fill={fill} />
      <path d={linePath} fill="none" stroke={line} strokeWidth={2.5} strokeLinejoin="round" />

      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill={line} stroke={line} strokeWidth={2} />
          {(i === points.length - 1 || i % pointLabelStep === 0) && (
            <text
              x={p.x}
              y={p.y - 12}
              textAnchor="middle"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                fill: label,
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

// Plain-English labels for the six editable roles on this page.
const ROLE_LABEL: Record<string, string> = {
  canvas: "Page Background",
  "accent-0": "Highlight Text",
  "accent-1": "Card Background",
  "accent-2": "Donut Ring & Trend Line",
  "accent-3": "Page Dots & Chart Fill",
  "accent-4": "Add Button",
};

export default function SleepDashboard() {
  return (
    <EditModeProvider>
      <SleepDashboardBody />
      <EditColorSheet />
      <EditToast />
    </EditModeProvider>
  );
}

function SleepDashboardBody() {
  const theme = useTheme("/sleep");
  const edit = useEditMode();

  // Optimistic local state. Every save updates this instantly, then persists
  // to Supabase in the background. Realtime push from Supabase reconciles.
  const [overrideCanvas, setOverrideCanvas] = useState<string | null>(null);
  const [overrideAccents, setOverrideAccents] = useState<(string | undefined)[]>([]);
  const [localOverrides, setLocalOverrides] = useState<Record<string, string>>({});

  const canvas     = overrideCanvas    ?? theme.canvas;
  const ink        = overrideAccents[0] ?? theme.accents[0] ?? DEFAULT_INK;
  const surface    = overrideAccents[1] ?? theme.accents[1] ?? DEFAULT_SURFACE;
  const ring       = overrideAccents[2] ?? theme.accents[2] ?? DEFAULT_RING;
  const atmosphere = overrideAccents[3] ?? theme.accents[3] ?? DEFAULT_ATMOSPHERE;
  const cta        = overrideAccents[4] ?? theme.accents[4] ?? DEFAULT_CTA;

  // Per-element color lookup: local optimistic override → stored override → role fallback.
  const colorFor = (elementId: string, fallback: string): string =>
    localOverrides[elementId] ?? theme.overrides?.[elementId] ?? fallback;

  // Writes a per-element color override to the studio_themes.overrides JSONB
  // column. Optimistic: local state updates instantly, Supabase write happens
  // in background, realtime subscription reconciles.
  async function saveOverride(
    elementId: string,
    label: string,
    next: string,
    opts?: { silent?: boolean }
  ) {
    const previous = localOverrides[elementId] ?? theme.overrides?.[elementId];

    // Optimistic local update
    setLocalOverrides((curr) => ({ ...curr, [elementId]: next }));

    // Persist: merge into the stored overrides map
    const merged = { ...(theme.overrides ?? {}), ...localOverrides, [elementId]: next };
    await getSupabase()
      .from("studio_themes")
      .update({ overrides: merged })
      .eq("route", "/sleep");

    if (!opts?.silent) {
      edit?.showToast({
        label,
        message: "Saved",
        onUndo: async () => {
          if (previous === undefined) {
            // Remove from both local state and stored map
            setLocalOverrides((curr) => {
              const next = { ...curr };
              delete next[elementId];
              return next;
            });
            const cleared = { ...(theme.overrides ?? {}), ...localOverrides };
            delete cleared[elementId];
            await getSupabase().from("studio_themes").update({ overrides: cleared }).eq("route", "/sleep");
          } else {
            await saveOverride(elementId, label, previous, { silent: true });
          }
        },
      });
    }
  }

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

  // Writes a new color into one of the five accent slots. Updates local
  // state instantly (so the page repaints right away), then persists to
  // Supabase in the background, then pops a toast with an Undo button.
  async function saveAccent(slot: number, next: string, opts?: { silent?: boolean }) {
    const previous = overrideAccents[slot] ?? theme.accents[slot] ?? "";

    // 1. Optimistic local update
    setOverrideAccents((curr) => {
      const a = [...curr];
      while (a.length <= slot) a.push(undefined);
      a[slot] = next;
      return a;
    });

    // 2. Persist
    const persisted = [...(theme.accents ?? [])];
    while (persisted.length <= slot) persisted.push("#888888");
    persisted[slot] = next;
    await getSupabase()
      .from("studio_themes")
      .update({ accents: persisted })
      .eq("route", "/sleep");

    // 3. Toast with Undo (skipped when triggered BY undo, to avoid recursion)
    if (!opts?.silent) {
      edit?.showToast({
        label: ROLE_LABEL[`accent-${slot}`] ?? `Accent ${slot}`,
        message: "Saved",
        onUndo: previous ? () => saveAccent(slot, previous, { silent: true }) : undefined,
      });
    }
  }

  async function saveCanvas(next: string, opts?: { silent?: boolean }) {
    const previous = overrideCanvas ?? theme.canvas ?? "";

    setOverrideCanvas(next);

    await getSupabase()
      .from("studio_themes")
      .update({ canvas: next })
      .eq("route", "/sleep");

    if (!opts?.silent) {
      edit?.showToast({
        label: ROLE_LABEL.canvas,
        message: "Saved",
        onUndo: previous ? () => saveCanvas(previous, { silent: true }) : undefined,
      });
    }
  }

  if (loading) {
    return (
      <div style={{ background: canvas, minHeight: "100vh" }}>
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
        backgroundColor: canvas,
        backgroundImage: `radial-gradient(circle, ${ring} 0 3px, transparent 3px), radial-gradient(circle, ${atmosphere}40 0 88px, transparent 88px)`,
        backgroundSize: "18px 18px, 320px 320px",
        backgroundPosition: "0 0, 50% 120px",
        minHeight: "100vh",
      }}
    >
      <SavySiteHeader />
      <PageColorsToolbar
        enabled={edit?.enabled ?? false}
        canvas={canvas}
        atmosphere={atmosphere}
        onEditCanvas={() =>
          edit?.setActive({
            id: "canvas",
            label: ROLE_LABEL.canvas,
            description:
              "The color filling the page behind everything — the warm orange you see around the edges of every card, outside the dot pattern.",
            currentValue: canvas,
            onChange: (v) => saveCanvas(v),
          })
        }
        onEditAtmosphere={() =>
          edit?.setActive({
            id: "accent-3",
            label: ROLE_LABEL["accent-3"],
            description:
              "The soft halo behind the donut card and the gentle fill color under the TREND chart line. This sits between the page background and the cards — the quiet atmospheric layer.",
            currentValue: atmosphere,
            onChange: (v) => saveAccent(3, v),
          })
        }
      />

      <div className="content-width" style={{ padding: "38px 24px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Editable
            id="headline"
            label="Headline"
            description="The big 'How You Slept' title at the top of the page. Just this headline — nothing else."
            value={colorFor("headline", ink)}
            onChange={(v) => saveOverride("headline", "Headline", v)}
          >
            <h1
              style={{
                fontFamily: "'The Psychedelic Peace', 'Playfair Display', Georgia, serif",
                fontSize: "clamp(48px, 11vw, 92px)",
                fontWeight: 400,
                color: colorFor("headline", ink),
                lineHeight: 0.9,
                margin: 0,
              }}
            >
              How You
              <br />
              Slept
            </h1>
          </Editable>
        </div>
      </div>

      {error && (
        <div className="content-width" style={{ padding: "0 24px 16px" }}>
          <div
            style={{
              background: "rgba(0,0,0,0.06)",
              border: `1px solid ${cta}`,
              borderRadius: 12,
              padding: "12px 16px",
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: cta,
            }}
          >
            {error}
          </div>
        </div>
      )}

      {latest && (
        <div className="content-width" style={{ padding: "0 24px 28px" }}>
          <Editable
            id="donut-card-bg"
            label="Donut Card Background"
            description="Just the background of the card containing the big score donut. Changing this only affects this one card."
            value={colorFor("donut-card-bg", surface)}
            onChange={(v) => saveOverride("donut-card-bg", "Donut Card Background", v)}
          >
            <div
              style={{
                background: colorFor("donut-card-bg", surface),
                border: `1px solid ${colorFor("donut-card-bg", surface)}`,
                borderRadius: 28,
                padding: "28px 24px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 18,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
              }}
            >
              <Editable
                id="donut-ring"
                label="Donut Ring"
                description="Just the colored ring around the sleep score number in the middle of the card."
                value={colorFor("donut-ring", ring)}
                onChange={(v) => saveOverride("donut-ring", "Donut Ring", v)}
              >
                <DonutChart
                  score={latest.score}
                  averageScore={averageScore}
                  ring={colorFor("donut-ring", ring)}
                  ink={colorFor("donut-number", ink)}
                />
              </Editable>
            </div>
          </Editable>
        </div>
      )}

      {/* Add entry */}
      <div className="content-width" style={{ padding: "0 24px 24px" }}>
        <Editable
          id="log-card-bg"
          label="Log Night Card Background"
          description="Just the background of the 'LOG A NIGHT' card. Only this card is recolored."
          value={colorFor("log-card-bg", surface)}
          onChange={(v) => saveOverride("log-card-bg", "Log Night Card Background", v)}
        >
        <div style={{ background: colorFor("log-card-bg", surface), border: `1px solid ${colorFor("log-card-bg", surface)}`, borderRadius: 28, padding: "24px" }}>
          <Editable
            id="log-heading"
            label="LOG A NIGHT Heading"
            description="Just the big 'LOG A NIGHT' text above the date and score inputs."
            value={colorFor("log-heading", ring)}
            onChange={(v) => saveOverride("log-heading", "LOG A NIGHT Heading", v)}
          >
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: colorFor("log-heading", ring), display: "block" }}>
              LOG A NIGHT
            </span>
          </Editable>
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
            <Editable
              id="add-button"
              label="Add Button"
              description="The 'Add' button that saves a sleep entry."
              value={colorFor("add-button", cta)}
              onChange={(v) => saveOverride("add-button", "Add Button", v)}
              inline
            >
              <button
                onClick={addEntry}
                disabled={saving}
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", background: added ? ring : colorFor("add-button", cta), color: "#FFFFFF", border: "none", borderRadius: 8, padding: "10px 20px", cursor: saving ? "wait" : "pointer", transition: "background 0.3s", opacity: saving ? 0.7 : 1 }}
              >
                {added ? "✓ Added" : saving ? "Saving..." : "Add"}
              </button>
            </Editable>
          </div>
        </div>
        </Editable>
      </div>

      {/* Area chart — trend */}
      {entries.length >= 2 && (
        <div className="content-width" style={{ padding: "0 24px 24px" }}>
          <Editable
            id="trend-card-bg"
            label="Trend Card Background"
            description="Just the background of the TREND card (the area chart showing your recent scores)."
            value={colorFor("trend-card-bg", surface)}
            onChange={(v) => saveOverride("trend-card-bg", "Trend Card Background", v)}
          >
          <div
            style={{
              background: colorFor("trend-card-bg", surface),
              border: `1px solid ${colorFor("trend-card-bg", surface)}`,
              borderRadius: 28,
              padding: "24px 20px",
            }}
          >
            <Editable
              id="trend-label"
              label="TREND Label"
              description="Just the small 'TREND' uppercase label above the area chart."
              value={colorFor("trend-label", ink)}
              onChange={(v) => saveOverride("trend-label", "TREND Label", v)}
              inline
            >
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: colorFor("trend-label", ink),
                  paddingLeft: 8,
                }}
              >
                TREND
              </span>
            </Editable>
            <div style={{ marginTop: 16 }}>
              <AreaChart data={entries} line={colorFor("chart-line", ring)} fill={`${atmosphere}55`} label={colorFor("chart-labels", ink)} />
            </div>
          </div>
          </Editable>
        </div>
      )}

      {/* Logged entries — editable */}
      {entries.length > 0 && (
        <div className="content-width" style={{ padding: "0 24px 24px" }}>
          <Editable
            id="entries-card-bg"
            label="Your Entries Card Background"
            description="Just the background of the 'YOUR ENTRIES' card (the list of logged nights with edit/delete buttons)."
            value={colorFor("entries-card-bg", surface)}
            onChange={(v) => saveOverride("entries-card-bg", "Your Entries Card Background", v)}
          >
          <div style={{ background: colorFor("entries-card-bg", surface), border: `1px solid ${colorFor("entries-card-bg", surface)}`, borderRadius: 28, padding: "24px" }}>
            <Editable
              id="entries-label"
              label="YOUR ENTRIES Label"
              description="Just the small 'YOUR ENTRIES' uppercase label above the list of logged nights."
              value={colorFor("entries-label", ink)}
              onChange={(v) => saveOverride("entries-label", "YOUR ENTRIES Label", v)}
              inline
            >
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: colorFor("entries-label", ink) }}>
                YOUR ENTRIES
              </span>
            </Editable>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column" as const, borderRadius: 20, overflow: "hidden", border: `1px solid ${atmosphere}48` }}>
              {entriesDesc.map((e, i) => {
                const rating = SLEEP_RATINGS.find(r => r.score === e.score);
                const bg = i % 2 === 0 ? `${ink}66` : `${ink}55`;
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
                      style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, color: TIER_VERY_LOW, background: "rgba(252,0,25,0.08)", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          </Editable>
        </div>
      )}

      {/* Rating scale reference */}
      <div className="content-width" style={{ padding: "0 24px 24px" }}>
        <Editable
          id="rating-card-bg"
          label="Rating Scale Card Background"
          description="Just the background of the 'RATING SCALE' card at the bottom that explains what each score means."
          value={colorFor("rating-card-bg", surface)}
          onChange={(v) => saveOverride("rating-card-bg", "Rating Scale Card Background", v)}
        >
        <div style={{ background: colorFor("rating-card-bg", surface), border: `1px solid ${colorFor("rating-card-bg", surface)}`, borderRadius: 28, padding: "24px" }}>
          <Editable
            id="rating-label"
            label="RATING SCALE Label"
            description="Just the small 'RATING SCALE' uppercase label above the 1–10 quality reference list."
            value={colorFor("rating-label", ink)}
            onChange={(v) => saveOverride("rating-label", "RATING SCALE Label", v)}
            inline
          >
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: colorFor("rating-label", ink) }}>
              RATING SCALE
            </span>
          </Editable>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column" as const, borderRadius: 20, overflow: "hidden", border: `1px solid ${atmosphere}48` }}>
            {SLEEP_RATINGS.map((r, i) => {
              const scoreColor = getAverageColor(r.score);
              const bg = i % 2 === 0 ? `${ink}66` : `${ink}55`;
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
        </Editable>
      </div>

      {/* CHI research note */}
      <div className="content-width" style={{ padding: "0 24px 40px" }}>
        <Editable
          id="quote-card-bg"
          label="Research Quote Card Background"
          description="Just the background of the italic research-quote card at the very bottom of the page."
          value={colorFor("quote-card-bg", surface)}
          onChange={(v) => saveOverride("quote-card-bg", "Research Quote Card Background", v)}
        >
        <div
          style={{
            background: colorFor("quote-card-bg", surface),
            border: `1px solid ${colorFor("quote-card-bg", surface)}`,
            borderRadius: 28,
            padding: "24px",
            display: "flex",
            gap: 16,
          }}
        >
          <Editable
            id="quote-bar"
            label="Research Quote Accent Bar"
            description="Just the thin vertical colored bar to the left of the italic research quote."
            value={colorFor("quote-bar", cta)}
            onChange={(v) => saveOverride("quote-bar", "Research Quote Accent Bar", v)}
          >
            <div
              style={{
                width: 3,
                height: "100%",
                background: colorFor("quote-bar", cta),
                borderRadius: 2,
                flexShrink: 0,
              }}
            />
          </Editable>
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
        </Editable>
      </div>
    </div>
  );
}

/**
 * Small floating pill bar that appears below the header when edit mode is on.
 * Exposes editable page-level roles (canvas, atmosphere) that don't wrap a
 * specific region of the page content.
 */
function PageColorsToolbar({
  enabled,
  canvas,
  atmosphere,
  onEditCanvas,
  onEditAtmosphere,
}: {
  enabled: boolean;
  canvas: string;
  atmosphere: string;
  onEditCanvas: () => void;
  onEditAtmosphere: () => void;
}) {
  if (!enabled) return null;
  const chipBtn = (bg: string, label: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px 6px 6px",
        background: "rgba(0,0,0,0.55)",
        color: "#FFFFFF",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 999,
        fontFamily: "'Inter', -apple-system, sans-serif",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        cursor: "pointer",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: bg,
          border: "1px solid rgba(255,255,255,0.22)",
          display: "inline-block",
        }}
      />
      {label}
    </button>
  );
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        display: "flex",
        justifyContent: "center",
        padding: "10px 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {chipBtn(canvas, "Page Background", onEditCanvas)}
        {chipBtn(atmosphere, "Page Dots & Fill", onEditAtmosphere)}
      </div>
    </div>
  );
}
