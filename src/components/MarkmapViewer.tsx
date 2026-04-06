"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Transformer } from "markmap-lib";
import { Markmap } from "markmap-view";

const CRIMSON = "#DC143C";
const INTER = "'Inter', sans-serif";
const PLAYFAIR = "'Playfair Display', Georgia, serif";

const DEFAULT_MD = `# Savy
## Waiting for first outline...
- Push markdown via POST /api/markmap
- \`{ "markdown": "# Title\\n## Branch\\n- leaf" }\``;

const PRESET_COLORS = [
  "#DC143C", "#E85D04", "#F4A261", "#2A9D8F",
  "#264653", "#6A4C93", "#1982C4", "#8AC926",
  "#FF595E", "#606060",
];

interface HistoryEntry {
  id: string;
  title: string | null;
  updated_at: string;
}

interface LayoutOpts {
  spacingH: number;
  spacingV: number;
  maxWidth: number;
}

const DEFAULT_LAYOUT: LayoutOpts = { spacingH: 80, spacingV: 5, maxWidth: 240 };

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function MarkmapViewer() {
  const svgRef = useRef<SVGSVGElement>(null);
  const mmRef = useRef<Markmap | null>(null);

  const [markdown, setMarkdown] = useState<string>(DEFAULT_MD);
  const [title, setTitle] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Feature 1: History
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [browsingHistory, setBrowsingHistory] = useState(false);

  // Feature 2: Layout controls
  const [layout, setLayout] = useState<LayoutOpts>(DEFAULT_LAYOUT);
  const [controlsOpen, setControlsOpen] = useState(false);

  // Feature 3: Branch colors
  const [colorOverrides, setColorOverrides] = useState<Record<string, string>>({});
  const [pickerTarget, setPickerTarget] = useState<{
    nodeId: string;
    x: number;
    y: number;
  } | null>(null);
  const colorOverridesRef = useRef(colorOverrides);
  colorOverridesRef.current = colorOverrides;

  // ── Data fetching ─────────────────────────────────────────────────

  const fetchLatest = useCallback(async () => {
    try {
      const res = await fetch("/api/markmap?source=savy");
      const json = await res.json();
      if (json.data?.markdown) {
        setMarkdown(json.data.markdown);
        setTitle(json.data.title);
        setUpdatedAt(json.data.updated_at);
        setActiveId(json.data.id);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/markmap?source=savy&limit=30");
      const json = await res.json();
      if (Array.isArray(json.data)) setHistory(json.data);
    } catch {
      /* silent */
    }
  }, []);

  const loadEntry = useCallback(async (id: string) => {
    setBrowsingHistory(true);
    try {
      const res = await fetch(`/api/markmap?id=${id}`);
      const json = await res.json();
      if (json.data?.markdown) {
        setMarkdown(json.data.markdown);
        setTitle(json.data.title);
        setUpdatedAt(json.data.updated_at);
        setActiveId(json.data.id);
        setColorOverrides({});
        setPickerTarget(null);
      }
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    if (!browsingHistory) fetchLatest();
    fetchHistory();
    const interval = setInterval(() => {
      if (!browsingHistory) fetchLatest();
      fetchHistory();
    }, 15_000);
    return () => clearInterval(interval);
  }, [fetchLatest, fetchHistory, browsingHistory]);

  // ── Markmap render ────────────────────────────────────────────────

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const transformer = new Transformer();
    const { root } = transformer.transform(markdown);

    let counter = 0;
    const assignIds = (node: typeof root) => {
      node.state = { ...node.state, id: counter++ };
      node.children?.forEach(assignIds);
    };
    assignIds(root);

    if (mmRef.current) {
      mmRef.current.destroy();
      mmRef.current = null;
    }

    mmRef.current = Markmap.create(svg, {
      color: (node: typeof root) => {
        const id = String(node.state?.id ?? "");
        return colorOverridesRef.current[id] || CRIMSON;
      },
      duration: 300,
      maxWidth: layout.maxWidth,
      paddingX: 16,
      spacingHorizontal: layout.spacingH,
      spacingVertical: layout.spacingV,
    });

    mmRef.current.setData(root);
    mmRef.current.fit();

    const handleSvgClick = (e: MouseEvent) => {
      const target = e.target as SVGElement;
      const g = target.closest?.("g.markmap-node");
      if (!g) {
        setPickerTarget(null);
        return;
      }
      if (target.tagName === "circle") return;

      const nodeId = g.getAttribute("data-depth") !== null
        ? Array.from(svg.querySelectorAll("g.markmap-node")).indexOf(g).toString()
        : "0";

      const rect = svg.getBoundingClientRect();
      setPickerTarget({
        nodeId,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    svg.addEventListener("click", handleSvgClick);
    return () => svg.removeEventListener("click", handleSvgClick);
  }, [markdown, layout]);

  // ── Export handler ────────────────────────────────────────────────

  const handleExport = () => {
    const filename = `${slugify(title || "mindmap")}-${new Date().toISOString().slice(0, 10)}.md`;
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Color picker apply ────────────────────────────────────────────

  const applyColor = (color: string) => {
    if (!pickerTarget) return;
    setColorOverrides((prev) => ({ ...prev, [pickerTarget.nodeId]: color }));
    setPickerTarget(null);
  };

  // ── Layout slider change ──────────────────────────────────────────

  const updateLayout = (key: keyof LayoutOpts, value: number) => {
    setLayout((prev) => ({ ...prev, [key]: value }));
  };

  // ── Styles ────────────────────────────────────────────────────────

  const labelStyle: React.CSSProperties = {
    fontFamily: INTER,
    fontSize: 10,
    fontWeight: 600,
    color: "rgba(0,0,0,0.4)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  };

  const iconBtnStyle: React.CSSProperties = {
    background: "none",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: 6,
    padding: "4px 8px",
    cursor: "pointer",
    fontFamily: INTER,
    fontSize: 11,
    color: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    gap: 4,
    transition: "background 0.15s",
  };

  return (
    <div
      style={{
        background: "rgba(0,0,0,0.03)",
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ── Header ────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px 8px",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>🦊</span>
          <span
            style={{
              fontFamily: PLAYFAIR,
              fontSize: 16,
              fontWeight: 400,
              color: "#1A1A1A",
            }}
          >
            {title ?? "Savy Mind Map"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {browsingHistory && (
            <span style={{
              fontFamily: INTER, fontSize: 9, fontWeight: 600,
              color: "#fff", background: "rgba(0,0,0,0.35)",
              borderRadius: 4, padding: "2px 6px", marginRight: 4,
            }}>
              VIEWING HISTORY
            </span>
          )}
          {updatedAt && (
            <span style={{ fontFamily: INTER, fontSize: 10, color: "rgba(0,0,0,0.3)", marginRight: 4 }}>
              {new Date(updatedAt).toLocaleString()}
            </span>
          )}

          <button
            onClick={() => { setHistoryOpen((o) => !o); if (!historyOpen) fetchHistory(); }}
            style={iconBtnStyle}
            title="Mind map history"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            Log
          </button>

          <button
            onClick={() => setControlsOpen((o) => !o)}
            style={iconBtnStyle}
            title="Layout controls"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            Layout
          </button>

          <button onClick={handleExport} style={iconBtnStyle} title="Export markdown for MindNode">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            MindNode
          </button>

          <button
            onClick={() => mmRef.current?.fit()}
            style={iconBtnStyle}
            title="Fit to view"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3m8 0h3a2 2 0 002-2v-3" />
            </svg>
            Fit
          </button>
        </div>
      </div>

      {/* ── Layout Controls Panel ─────────────────────── */}
      {controlsOpen && (
        <div style={{ padding: "8px 24px 12px", display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <label style={labelStyle}>Branch Spread</label>
            <input
              type="range" min={30} max={200} value={layout.spacingH}
              onChange={(e) => updateLayout("spacingH", +e.target.value)}
              style={{ width: 120, accentColor: CRIMSON }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <label style={labelStyle}>Density</label>
            <input
              type="range" min={1} max={30} value={layout.spacingV}
              onChange={(e) => updateLayout("spacingV", +e.target.value)}
              style={{ width: 120, accentColor: CRIMSON }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <label style={labelStyle}>Text Width</label>
            <input
              type="range" min={120} max={500} value={layout.maxWidth}
              onChange={(e) => updateLayout("maxWidth", +e.target.value)}
              style={{ width: 120, accentColor: CRIMSON }}
            />
          </div>
          <button
            onClick={() => setLayout(DEFAULT_LAYOUT)}
            style={{ ...iconBtnStyle, marginTop: 12 }}
          >
            Reset
          </button>
        </div>
      )}

      {/* ── Main area ─────────────────────────────────── */}
      <div style={{ display: "flex", position: "relative" }}>

        {/* ── History sidebar ──────────────────────────── */}
        {historyOpen && (
          <div
            style={{
              width: 220,
              borderRight: "1px solid rgba(0,0,0,0.06)",
              overflowY: "auto",
              maxHeight: "clamp(400px, 60vh, 800px)",
              flexShrink: 0,
              background: "rgba(255,255,255,0.5)",
            }}
          >
            <div style={{ padding: "12px 16px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={labelStyle}>History</span>
              {browsingHistory && (
                <button
                  onClick={() => { setBrowsingHistory(false); fetchLatest(); }}
                  style={{
                    fontFamily: INTER,
                    fontSize: 10,
                    fontWeight: 600,
                    color: CRIMSON,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  ← Live
                </button>
              )}
            </div>
            {history.length === 0 && (
              <div style={{ padding: "8px 16px", fontFamily: INTER, fontSize: 11, color: "rgba(0,0,0,0.3)" }}>
                No entries yet
              </div>
            )}
            {history.map((entry) => (
              <button
                key={entry.id}
                onClick={() => loadEntry(entry.id)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  background: entry.id === activeId ? "rgba(220,20,60,0.06)" : "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(0,0,0,0.04)",
                  padding: "10px 16px",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (entry.id !== activeId)
                    (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.03)";
                }}
                onMouseLeave={(e) => {
                  if (entry.id !== activeId)
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <div style={{
                  fontFamily: INTER,
                  fontSize: 12,
                  fontWeight: entry.id === activeId ? 600 : 400,
                  color: entry.id === activeId ? CRIMSON : "#1A1A1A",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {entry.title || "Untitled"}
                </div>
                <div style={{
                  fontFamily: INTER,
                  fontSize: 10,
                  color: "rgba(0,0,0,0.3)",
                  marginTop: 2,
                }}>
                  {new Date(entry.updated_at).toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── SVG container ────────────────────────────── */}
        <div style={{ flex: 1, height: "clamp(400px, 60vh, 800px)", position: "relative" }}>
          {loading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: INTER,
                fontSize: 13,
                color: "rgba(0,0,0,0.3)",
              }}
            >
              Loading...
            </div>
          )}
          <svg
            ref={svgRef}
            style={{ width: "100%", height: "100%" }}
          />

          {/* ── Color picker popover ───────────────────── */}
          {pickerTarget && (
            <div
              style={{
                position: "absolute",
                left: Math.min(pickerTarget.x, (svgRef.current?.parentElement?.clientWidth ?? 300) - 200),
                top: Math.min(pickerTarget.y + 8, (svgRef.current?.parentElement?.clientHeight ?? 300) - 60),
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                padding: "10px 12px",
                zIndex: 20,
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                maxWidth: 190,
              }}
            >
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => applyColor(c)}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: c,
                    border: c === (colorOverrides[pickerTarget.nodeId] || CRIMSON) ? "2px solid #1A1A1A" : "2px solid transparent",
                    cursor: "pointer",
                    padding: 0,
                    transition: "transform 0.1s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.2)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                  title={c}
                />
              ))}
              <button
                onClick={() => setPickerTarget(null)}
                style={{
                  fontFamily: INTER,
                  fontSize: 9,
                  color: "rgba(0,0,0,0.4)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px 4px",
                  marginLeft: "auto",
                }}
              >
                close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
