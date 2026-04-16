"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ComponentKind =
  | "feed-tiles"
  | "meal-blocks"
  | "rings-grid"
  | "emotion-wheel"
  | "graph-nodes"
  | "card-stack";

type Theme = {
  route: string;
  label: string;
  canvas: string;
  ink: string;
  accents: string[];
  heading_font: string;
  body_font: string;
  component_kind: ComponentKind;
  notes: string;
  sort_order?: number;
  updated_at?: string;
};

const SEED_THEMES: Theme[] = [
  {
    route: "/",
    label: "Home",
    canvas: "#F5F0E8",
    ink: "#1A1A1A",
    accents: ["#DC143C", "#22C55E", "#0A0A0A"],
    heading_font: "'Playfair Display', Georgia, serif",
    body_font: "'Inter', -apple-system, sans-serif",
    component_kind: "feed-tiles",
    notes: "Magazine. Editorial. Becomes a Pinterest-style feed.",
  },
  {
    route: "/nutrition",
    label: "Nutrition",
    canvas: "#F4D160",
    ink: "#2C2C2C",
    accents: ["#B01E68", "#1D5D9B", "#F49D1A", "#DC3535"],
    heading_font: "'Playfair Display', serif",
    body_font: "'Inter', sans-serif",
    component_kind: "meal-blocks",
    notes: "Food app. Saturated. Every meal is its own colored room.",
  },
  {
    route: "/sleep",
    label: "Sleep",
    canvas: "#FF7A1E",
    ink: "#1A1A1A",
    accents: ["#1D5D9B", "#0A0A0A", "#FFFFFF"],
    heading_font: "'Playfair Display', serif",
    body_font: "'Inter', sans-serif",
    component_kind: "rings-grid",
    notes: "Sunrise warmth. Donut + area chart. ACM CHI-informed.",
  },
  {
    route: "/mood",
    label: "Mood",
    canvas: "#1D5D9B",
    ink: "#FFFFFF",
    accents: ["#B01E68", "#F49D1A", "#1A8D5F", "#DC3535"],
    heading_font: "'Playfair Display', serif",
    body_font: "'Inter', sans-serif",
    component_kind: "emotion-wheel",
    notes: "Emotion wheel. Tap. Tag trigger.",
  },
  {
    route: "/ontology",
    label: "Ontology",
    canvas: "#0A0A0A",
    ink: "#FFFFFF",
    accents: ["#DC143C", "#0E918C", "#F49D1A"],
    heading_font: "'Playfair Display', serif",
    body_font: "'Inter', sans-serif",
    component_kind: "graph-nodes",
    notes: "Dark mode. Nodes and edges. 13 categories, 92 weeks.",
  },
  {
    route: "/beliefs",
    label: "Beliefs",
    canvas: "#E8DFD3",
    ink: "#2C2C2C",
    accents: ["#B01E68", "#1A8D5F"],
    heading_font: "'Playfair Display', serif",
    body_font: "'Inter', sans-serif",
    component_kind: "card-stack",
    notes: "Paper. Tactile. Identity anchors.",
  },
];

async function seedThemes() {
  const { error } = await supabase
    .from("studio_themes")
    .upsert(SEED_THEMES, { onConflict: "route" });
  if (error) console.error("seed error", error);
  return !error;
}

const isLight = (hex: string) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 140;
};
const contrastInk = (bg: string) => (isLight(bg) ? "#1A1A1A" : "#FFFFFF");
const copy = (text: string) => navigator.clipboard.writeText(text);

export default function StudioPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [activeRoute, setActiveRoute] = useState<string>("/nutrition");
  const [loading, setLoading] = useState(true);
  const [justCopied, setJustCopied] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("studio_themes")
        .select("*")
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("route");
      const loaded = data && data.length > 0 ? (data as Theme[]) : SEED_THEMES;
      setThemes(loaded);

      if (typeof window !== "undefined") {
        const param = new URLSearchParams(window.location.search).get("route");
        if (param && loaded.some((t) => t.route === param)) {
          setActiveRoute(param);
        }
      }
      setLoading(false);
    })();
  }, []);

  const active = themes.find((t) => t.route === activeRoute);

  const patch = useCallback(
    async (updates: Partial<Theme>) => {
      if (!active) return;
      const merged = { ...active, ...updates };
      setThemes((prev) => prev.map((t) => (t.route === active.route ? merged : t)));
      await supabase.from("studio_themes").update(updates).eq("route", active.route);
    },
    [active]
  );

  const flash = (key: string) => {
    copy(key);
    setJustCopied(key);
    setTimeout(() => setJustCopied(null), 900);
  };

  const addRoom = useCallback(async () => {
    const route = prompt("Route path (e.g. /timeline):")?.trim();
    if (!route || !route.startsWith("/")) return;
    if (themes.some((t) => t.route === route)) {
      alert(`A room already exists for ${route}`);
      return;
    }
    const label = prompt("Label:", route.replace("/", "") || "Home")?.trim() || route;
    const nextOrder = Math.max(-1, ...themes.map((t) => t.sort_order ?? 0)) + 1;
    const newTheme: Theme = {
      route,
      label,
      canvas: "#F5F0E8",
      ink: "#1A1A1A",
      accents: ["#DC143C"],
      heading_font: "'Playfair Display', Georgia, serif",
      body_font: "'Inter', -apple-system, sans-serif",
      component_kind: "feed-tiles",
      notes: "",
      sort_order: nextOrder,
    };
    setThemes((prev) => [...prev, newTheme]);
    setActiveRoute(route);
    await supabase.from("studio_themes").insert(newTheme);
  }, [themes]);

  const deleteRoom = useCallback(
    async (route: string) => {
      if (!confirm(`Delete the "${route}" room? This removes its theme data.`)) return;
      const remaining = themes.filter((t) => t.route !== route);
      setThemes(remaining);
      if (activeRoute === route && remaining.length > 0) {
        setActiveRoute(remaining[0].route);
      }
      await supabase.from("studio_themes").delete().eq("route", route);
    },
    [themes, activeRoute]
  );

  const moveRoom = useCallback(
    async (route: string, direction: -1 | 1) => {
      const idx = themes.findIndex((t) => t.route === route);
      if (idx < 0) return;
      const swap = idx + direction;
      if (swap < 0 || swap >= themes.length) return;
      const next = [...themes];
      [next[idx], next[swap]] = [next[swap], next[idx]];
      const reindexed = next.map((t, i) => ({ ...t, sort_order: i }));
      setThemes(reindexed);
      await Promise.all(
        reindexed.map((t) =>
          supabase.from("studio_themes").update({ sort_order: t.sort_order }).eq("route", t.route)
        )
      );
    },
    [themes]
  );

  if (loading) {
    return (
      <div style={{ padding: 80, fontFamily: "system-ui", textAlign: "center" }}>
        Loading studio…
      </div>
    );
  }
  if (!active) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        color: "#fff",
        fontFamily: "'Inter', -apple-system, sans-serif",
        display: "grid",
        gridTemplateColumns: "220px 1fr 340px",
      }}
    >
      <aside style={{ borderRight: "1px solid rgba(255,255,255,0.08)", padding: "24px 16px" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: "#DC143C", fontSize: 28, marginBottom: 4 }}>
          studio
        </div>
        <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>
          one shell · many rooms
        </div>
        {themes.map((t, i) => {
          const isActive = t.route === activeRoute;
          return (
            <div
              key={t.route}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginBottom: 4,
                padding: "2px 4px",
                background: isActive ? "rgba(220,20,60,0.12)" : "transparent",
                borderRadius: 8,
              }}
            >
              <button
                onClick={() => setActiveRoute(t.route)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0,
                  padding: "8px 6px",
                  background: "transparent",
                  border: "none", borderRadius: 8, color: "#fff", textAlign: "left",
                  cursor: "pointer", fontSize: 14, fontFamily: "inherit",
                }}
              >
                <span style={{ width: 18, height: 18, borderRadius: 4, background: t.canvas, flexShrink: 0, border: "1px solid rgba(255,255,255,0.15)" }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.label}</span>
                <span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.35)", flexShrink: 0 }}>{t.route}</span>
              </button>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                <button
                  onClick={() => moveRoom(t.route, -1)}
                  disabled={i === 0}
                  aria-label={`Move ${t.label} up`}
                  style={rowIconBtn(i === 0)}
                >
                  ▲
                </button>
                <button
                  onClick={() => moveRoom(t.route, 1)}
                  disabled={i === themes.length - 1}
                  aria-label={`Move ${t.label} down`}
                  style={rowIconBtn(i === themes.length - 1)}
                >
                  ▼
                </button>
              </div>
              <button
                onClick={() => deleteRoom(t.route)}
                aria-label={`Delete ${t.label}`}
                style={{
                  background: "none", border: "none",
                  color: "rgba(255,255,255,0.3)",
                  cursor: "pointer", fontSize: 14,
                  padding: "0 6px",
                }}
              >
                ×
              </button>
            </div>
          );
        })}
        <button
          onClick={addRoom}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            width: "100%", marginTop: 12, padding: "10px",
            background: "transparent",
            border: "1px dashed rgba(255,255,255,0.2)",
            borderRadius: 8,
            color: "rgba(255,255,255,0.6)",
            cursor: "pointer", fontSize: 12,
            fontFamily: "inherit", letterSpacing: "0.08em", textTransform: "uppercase",
          }}
        >
          + new room
        </button>
      </aside>

      <main style={{ padding: 32, overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
              now designing
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, margin: "4px 0 0", fontWeight: 500 }}>
              {active.label}
              <span style={{ fontSize: 14, fontFamily: "ui-monospace, monospace", color: "rgba(255,255,255,0.35)", marginLeft: 12 }}>
                {active.route}
              </span>
            </h1>
          </div>
          <a href={active.route} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#DC143C", textDecoration: "none", padding: "8px 14px", border: "1px solid rgba(220,20,60,0.4)", borderRadius: 8 }}>
            open live ↗
          </a>
        </div>

        <div style={{ background: active.canvas, borderRadius: 16, padding: 24, minHeight: 520, color: active.ink, position: "relative" }}>
          <LivePreview theme={active} />
        </div>

        <TokenStrip theme={active} flash={flash} justCopied={justCopied} />
      </main>

      <aside style={{ borderLeft: "1px solid rgba(255,255,255,0.08)", padding: "24px 20px", overflow: "auto" }}>
        <Section label="canvas">
          <ColorField hex={active.canvas} onChange={(hex) => patch({ canvas: hex, ink: contrastInk(hex) })} />
        </Section>
        <Section label="accents">
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {active.accents.map((hex, i) => (
              <ColorField
                key={i} hex={hex} compact
                onChange={(next) => {
                  const copy = [...active.accents]; copy[i] = next;
                  patch({ accents: copy });
                }}
                onRemove={() => patch({ accents: active.accents.filter((_, j) => j !== i) })}
              />
            ))}
            <button onClick={() => patch({ accents: [...active.accents, "#888888"] })} style={addBtn}>+</button>
          </div>
        </Section>
        <Section label="heading font">
          <FontPicker value={active.heading_font} onChange={(f) => patch({ heading_font: f })} />
        </Section>
        <Section label="body font">
          <FontPicker value={active.body_font} onChange={(f) => patch({ body_font: f })} />
        </Section>
        <Section label="component kind">
          <select value={active.component_kind} onChange={(e) => patch({ component_kind: e.target.value as ComponentKind })} style={selectStyle}>
            <option value="feed-tiles">feed tiles (Pinterest)</option>
            <option value="meal-blocks">meal blocks</option>
            <option value="rings-grid">rings grid</option>
            <option value="emotion-wheel">emotion wheel</option>
            <option value="graph-nodes">graph nodes</option>
            <option value="card-stack">card stack</option>
          </select>
        </Section>
        <Section label="notes">
          <textarea value={active.notes} onChange={(e) => patch({ notes: e.target.value })} rows={3}
            style={{ ...selectStyle, resize: "vertical", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 14 }} />
        </Section>
        <button onClick={() => flash(JSON.stringify(active, null, 2))}
          style={{ ...addBtn, width: "100%", padding: "12px", marginTop: 20, background: "#DC143C", color: "#fff", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>
          {justCopied?.startsWith("{") ? "copied ✓" : "copy theme JSON"}
        </button>
      </aside>
    </div>
  );
}

function LivePreview({ theme }: { theme: Theme }) {
  const k = theme.component_kind;
  if (k === "feed-tiles") return <FeedTilesPreview theme={theme} />;
  if (k === "meal-blocks") return <MealBlocksPreview theme={theme} />;
  if (k === "rings-grid") return <RingsGridPreview theme={theme} />;
  if (k === "emotion-wheel") return <EmotionWheelPreview theme={theme} />;
  if (k === "graph-nodes") return <GraphNodesPreview theme={theme} />;
  if (k === "card-stack") return <CardStackPreview theme={theme} />;
  return null;
}

function FeedTilesPreview({ theme }: { theme: Theme }) {
  const heights = [160, 220, 180, 240, 200, 170];
  return (
    <div>
      <h2 style={{ fontFamily: theme.heading_font, fontStyle: "italic", color: theme.accents[0], fontSize: 44, margin: 0 }}>SAVY</h2>
      <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: theme.ink, opacity: 0.4, marginBottom: 20 }}>experiments in progress</div>
      <div style={{ columnCount: 3, columnGap: 10 }}>
        {heights.map((h, i) => (
          <div key={i} style={{ breakInside: "avoid", marginBottom: 10, background: "#fff", height: h, borderRadius: 10, padding: 14, fontFamily: theme.body_font, fontSize: 11, color: theme.ink, opacity: 0.7 }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: theme.accents[1] || theme.accents[0], marginBottom: 6 }} />
            tile {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

function MealBlocksPreview({ theme }: { theme: Theme }) {
  const meals = ["Breakfast", "Lunch", "Dinner", "Snack"];
  return (
    <div>
      <h2 style={{ fontFamily: theme.heading_font, fontSize: 28, margin: 0, color: theme.ink }}>{theme.label}</h2>
      <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.ink, opacity: 0.5, marginBottom: 18 }}>every ounce, every macro</div>
      {meals.map((m, i) => {
        const bg = theme.accents[i % theme.accents.length];
        return (
          <div key={m} style={{ background: bg, borderRadius: 14, padding: 16, marginBottom: 10, color: contrastInk(bg), fontFamily: theme.heading_font, fontSize: 17, fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{m}</span>
            <span style={{ opacity: 0.6, fontSize: 18 }}>+</span>
          </div>
        );
      })}
    </div>
  );
}

function RingsGridPreview({ theme }: { theme: Theme }) {
  return (
    <div>
      <h2 style={{ fontFamily: theme.heading_font, fontSize: 28, margin: "0 0 16px", color: theme.ink }}>Sleep score</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { label: "Duration", v: 7.2, max: 9, c: theme.accents[0] },
          { label: "Deep", v: 1.8, max: 2.5, c: theme.accents[1] || theme.accents[0] },
          { label: "REM", v: 1.4, max: 2, c: theme.accents[2] || theme.accents[0] },
          { label: "Score", v: 82, max: 100, c: theme.accents[0] },
        ].map((d, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.35)", borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", alignItems: "center", color: theme.ink }}>
            <Donut value={d.v} max={d.max} color={d.c} />
            <div style={{ fontSize: 11, marginTop: 8, opacity: 0.7 }}>{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Donut({ value, max, color, size = 80 }: { value: number; max: number; color: string; size?: number }) {
  const pct = value / max;
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth={6} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6} strokeDasharray={`${circ * pct} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "ui-monospace, monospace", fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

function EmotionWheelPreview({ theme }: { theme: Theme }) {
  const slices = 8;
  return (
    <div style={{ textAlign: "center" }}>
      <h2 style={{ fontFamily: theme.heading_font, fontSize: 28, margin: "0 0 16px", color: theme.ink }}>How do you feel?</h2>
      <svg width={280} height={280} viewBox="-150 -150 300 300">
        {Array.from({ length: slices }).map((_, i) => {
          const a0 = (i / slices) * Math.PI * 2 - Math.PI / 2;
          const a1 = ((i + 1) / slices) * Math.PI * 2 - Math.PI / 2;
          const r = 130;
          const x0 = Math.cos(a0) * r, y0 = Math.sin(a0) * r;
          const x1 = Math.cos(a1) * r, y1 = Math.sin(a1) * r;
          const color = theme.accents[i % theme.accents.length];
          return <path key={i} d={`M 0 0 L ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1} Z`} fill={color} stroke={theme.canvas} strokeWidth={3} />;
        })}
        <circle r="40" fill={theme.canvas} />
      </svg>
    </div>
  );
}

function GraphNodesPreview({ theme }: { theme: Theme }) {
  const nodes = [
    { x: 50, y: 30, label: "sleep" },
    { x: 200, y: 50, label: "food" },
    { x: 300, y: 140, label: "mood" },
    { x: 220, y: 220, label: "work" },
    { x: 80, y: 200, label: "spend" },
    { x: 150, y: 130, label: "you" },
  ];
  return (
    <div>
      <h2 style={{ fontFamily: theme.heading_font, fontSize: 28, margin: "0 0 16px", color: theme.ink }}>Ontology</h2>
      <svg width="100%" height={280} viewBox="0 0 380 280">
        {nodes.slice(0, 5).map((n, i) => (
          <line key={i} x1={nodes[5].x} y1={nodes[5].y} x2={n.x} y2={n.y} stroke={theme.accents[i % theme.accents.length]} strokeWidth={1.5} opacity={0.6} />
        ))}
        {nodes.map((n, i) => (
          <g key={i} transform={`translate(${n.x}, ${n.y})`}>
            <circle r={n.label === "you" ? 28 : 20} fill={theme.accents[i % theme.accents.length] || theme.accents[0]} />
            <text y={n.label === "you" ? 5 : 4} textAnchor="middle" fill={contrastInk(theme.accents[i % theme.accents.length] || theme.accents[0])} fontSize={11} fontWeight={600}>{n.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function CardStackPreview({ theme }: { theme: Theme }) {
  return (
    <div>
      <h2 style={{ fontFamily: theme.heading_font, fontSize: 28, margin: "0 0 16px", color: theme.ink }}>Beliefs</h2>
      <div style={{ position: "relative", height: 280 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", inset: 0, transform: `translate(${i * 8}px, ${i * 8}px) rotate(${(i - 1) * 2}deg)`, background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", zIndex: 10 - i }}>
            <div style={{ width: 30, height: 3, background: theme.accents[i % theme.accents.length], marginBottom: 12 }} />
            <div style={{ fontFamily: theme.heading_font, fontStyle: "italic", fontSize: 22, color: "#1A1A1A", lineHeight: 1.3 }}>
              {i === 0 ? "Anything that gives me momentum is worthwhile." : i === 1 ? "Focus on what's in your control." : "The era of text is ending."}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TokenStrip({ theme, flash, justCopied }: { theme: Theme; flash: (v: string) => void; justCopied: string | null }) {
  const tokens = [
    { label: "canvas", value: theme.canvas },
    { label: "ink", value: theme.ink },
    ...theme.accents.map((c, i) => ({ label: `accent ${i + 1}`, value: c })),
  ];
  return (
    <div style={{ marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
      {tokens.map((t) => (
        <button key={t.label + t.value} onClick={() => flash(t.value)}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 10px 6px 6px", cursor: "pointer", color: "#fff", fontFamily: "inherit", fontSize: 12 }}>
          <span style={{ width: 20, height: 20, borderRadius: 4, background: t.value, border: "1px solid rgba(255,255,255,0.15)" }} />
          <span style={{ color: "rgba(255,255,255,0.5)" }}>{t.label}</span>
          <span style={{ fontFamily: "ui-monospace, monospace" }}>{justCopied === t.value ? "copied ✓" : t.value}</span>
        </button>
      ))}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

function ColorField({ hex, onChange, onRemove, compact }: { hex: string; onChange: (hex: string) => void; onRemove?: () => void; compact?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: 4, width: compact ? "auto" : "100%" }}>
      <input type="color" value={hex} onChange={(e) => onChange(e.target.value)} style={{ width: 28, height: 28, border: "none", background: "transparent", cursor: "pointer", padding: 0 }} />
      {!compact && (
        <input type="text" value={hex} onChange={(e) => onChange(e.target.value)} style={{ flex: 1, background: "transparent", border: "none", color: "#fff", fontFamily: "ui-monospace, monospace", fontSize: 13, outline: "none" }} />
      )}
      {onRemove && (
        <button onClick={onRemove} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 14, padding: "0 4px" }}>×</button>
      )}
    </div>
  );
}

function FontPicker({ value, onChange }: { value: string; onChange: (f: string) => void }) {
  const options = [
    "'Playfair Display', Georgia, serif",
    "'Inter', -apple-system, sans-serif",
    "Georgia, serif",
    "'Courier New', ui-monospace, monospace",
    "system-ui, sans-serif",
  ];
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={selectStyle}>
      {options.map((o) => <option key={o} value={o}>{o.split(",")[0].replace(/'/g, "")}</option>)}
    </select>
  );
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  padding: "8px 10px",
  color: "#fff",
  fontFamily: "inherit",
  fontSize: 13,
  outline: "none",
};

const rowIconBtn = (disabled: boolean): React.CSSProperties => ({
  background: "none",
  border: "none",
  color: disabled ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.4)",
  cursor: disabled ? "default" : "pointer",
  fontSize: 8,
  padding: "1px 4px",
  lineHeight: 1,
});

const addBtn: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 8,
  background: "rgba(255,255,255,0.06)",
  border: "1px dashed rgba(255,255,255,0.2)",
  color: "#fff",
  cursor: "pointer",
  fontSize: 16,
};
