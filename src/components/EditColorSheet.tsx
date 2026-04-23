"use client";

import { useEffect, useState, CSSProperties } from "react";
import { useEditMode } from "@/lib/useEditMode";
import { fillStyle, fillColor, IMAGE_PRESETS, type Fill } from "@/lib/fills";

type Mode = "color" | "pattern" | "image";

/**
 * Bottom panel (a small slide-up sheet at the bottom of the viewport) that
 * appears when a region has been tapped in edit mode.
 *
 * Has three tabs when allowFills is true:
 *   - Color:   plain solid hex
 *   - Pattern: dots / stripes / grid built from two colors
 *   - Image:   paste a URL or pick from the built-in gallery
 *
 * Text elements are passed allowFills=false and see only the Color tab.
 *
 * Changes are applied live as the user adjusts controls.
 */
export function EditColorSheet() {
  const ctx = useEditMode();

  const [mode, setMode] = useState<Mode>("color");
  const [colorValue, setColorValue] = useState("#888888");
  const [pattern, setPattern] = useState<"dots" | "stripes" | "grid">("dots");
  const [patternFg, setPatternFg] = useState("#1A1A1A");
  const [patternBg, setPatternBg] = useState("#F5F0E8");
  const [imageUrl, setImageUrl] = useState("");
  const [imageSize, setImageSize] = useState<"cover" | "contain" | "tile">("cover");

  // Seed the controls whenever a new region is tapped.
  useEffect(() => {
    const fill = ctx?.active?.currentValue;
    if (!fill) return;
    if (typeof fill === "string") {
      setMode("color");
      setColorValue(fill);
      return;
    }
    if (fill.kind === "color") {
      setMode("color");
      setColorValue(fill.value);
      return;
    }
    if (fill.kind === "pattern") {
      setMode("pattern");
      setPattern(fill.pattern);
      setPatternFg(fill.fg);
      setPatternBg(fill.bg);
      return;
    }
    if (fill.kind === "image") {
      setMode("image");
      setImageUrl(fill.url);
      setImageSize(fill.size ?? "cover");
    }
  }, [ctx?.active?.id]);

  if (!ctx || !ctx.active) return null;

  const { label, description, onChange, allowFills } = ctx.active;

  // Publish a Fill to the parent (and optimistically to local state).
  const apply = (next: Fill) => {
    if (typeof next === "string" && /^#[0-9a-fA-F]{6}$/.test(next)) {
      ctx.addRecentColor(next);
    }
    onChange(next);
  };

  const applyColor = (hex: string) => {
    setColorValue(hex);
    apply(hex);
  };
  const applyPattern = (p: Partial<{ pattern: typeof pattern; fg: string; bg: string }>) => {
    const next = {
      pattern: p.pattern ?? pattern,
      fg: p.fg ?? patternFg,
      bg: p.bg ?? patternBg,
    };
    setPattern(next.pattern);
    setPatternFg(next.fg);
    setPatternBg(next.bg);
    apply({ kind: "pattern", pattern: next.pattern, fg: next.fg, bg: next.bg });
  };
  const applyImage = (p: Partial<{ url: string; size: typeof imageSize }>) => {
    const url = p.url ?? imageUrl;
    const size = p.size ?? imageSize;
    setImageUrl(url);
    setImageSize(size);
    if (!url) return;
    apply({ kind: "image", url, size });
  };

  const closeAndRemember = () => ctx.setActive(null);

  return (
    <>
      {/* Tap-away scrim behind the sheet */}
      <div
        onClick={closeAndRemember}
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          zIndex: 9998,
        }}
      />
      <div
        role="dialog"
        aria-label={`Edit ${label}`}
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          background: "#121212",
          color: "#FFFFFF",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: "18px 20px calc(28px + env(safe-area-inset-bottom, 0px))",
          zIndex: 9999,
          boxShadow: "0 -16px 48px rgba(0,0,0,0.45)",
          fontFamily: "'Inter', -apple-system, sans-serif",
          maxWidth: 520,
          margin: "0 auto",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <div style={{ width: 42, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.18)", margin: "0 auto 16px" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#DC143C" }}>
            Editing
          </span>
          <button type="button" onClick={closeAndRemember} style={dismissBtnStyle}>
            Done
          </button>
        </div>

        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 26, fontWeight: 500, lineHeight: 1.15, margin: "0 0 8px" }}>
          {label}
        </h2>

        <p style={{ fontSize: 13, lineHeight: 1.45, color: "rgba(255,255,255,0.7)", margin: "0 0 16px" }}>
          {description}
        </p>

        {/* Tabs */}
        {allowFills !== false && (
          <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "rgba(255,255,255,0.04)", padding: 4, borderRadius: 999 }}>
            {(["color", "pattern", "image"] as Mode[]).map((m) => {
              const active = mode === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    background: active ? "#DC143C" : "transparent",
                    color: active ? "#FFFFFF" : "rgba(255,255,255,0.65)",
                    border: "none",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "capitalize",
                    cursor: "pointer",
                  }}
                >
                  {m}
                </button>
              );
            })}
          </div>
        )}

        {mode === "color" && (
          <ColorControls
            value={colorValue}
            recentColors={ctx.recentColors}
            onChange={applyColor}
          />
        )}

        {mode === "pattern" && allowFills !== false && (
          <PatternControls
            pattern={pattern}
            fg={patternFg}
            bg={patternBg}
            onChange={applyPattern}
          />
        )}

        {mode === "image" && allowFills !== false && (
          <ImageControls
            url={imageUrl}
            size={imageSize}
            onChange={applyImage}
          />
        )}

        <button type="button" onClick={closeAndRemember} style={saveBtnStyle}>
          Save & close
        </button>
      </div>
    </>
  );
}

function ColorControls({
  value,
  recentColors,
  onChange,
}: {
  value: string;
  recentColors: string[];
  onChange: (hex: string) => void;
}) {
  return (
    <>
      {recentColors.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <LabelRow>Recent</LabelRow>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {recentColors.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => onChange(hex)}
                aria-label={`Use ${hex}`}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: hex,
                  border: value.toUpperCase() === hex.toUpperCase() ? "2px solid #FFFFFF" : "1px solid rgba(255,255,255,0.2)",
                  cursor: "pointer",
                  padding: 0,
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <ColorField value={value} onChange={onChange} />
    </>
  );
}

function PatternControls({
  pattern,
  fg,
  bg,
  onChange,
}: {
  pattern: "dots" | "stripes" | "grid";
  fg: string;
  bg: string;
  onChange: (p: Partial<{ pattern: "dots" | "stripes" | "grid"; fg: string; bg: string }>) => void;
}) {
  const options: { id: "dots" | "stripes" | "grid"; label: string }[] = [
    { id: "dots", label: "Dots" },
    { id: "stripes", label: "Stripes" },
    { id: "grid", label: "Grid" },
  ];
  return (
    <>
      <LabelRow>Pattern</LabelRow>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {options.map((o) => {
          const active = pattern === o.id;
          const previewFill: Fill = { kind: "pattern", pattern: o.id, fg, bg };
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange({ pattern: o.id })}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                padding: 8,
                background: "rgba(255,255,255,0.04)",
                border: active ? "2px solid #DC143C" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              <div style={{ width: "100%", height: 44, borderRadius: 6, ...fillStyle(previewFill, bg) }} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: "rgba(255,255,255,0.85)" }}>
                {o.label}
              </span>
            </button>
          );
        })}
      </div>

      <LabelRow>Foreground</LabelRow>
      <ColorField value={fg} onChange={(v) => onChange({ fg: v })} />

      <div style={{ height: 10 }} />

      <LabelRow>Background</LabelRow>
      <ColorField value={bg} onChange={(v) => onChange({ bg: v })} />
    </>
  );
}

function ImageControls({
  url,
  size,
  onChange,
}: {
  url: string;
  size: "cover" | "contain" | "tile";
  onChange: (p: Partial<{ url: string; size: "cover" | "contain" | "tile" }>) => void;
}) {
  const sizes: { id: "cover" | "contain" | "tile"; label: string; desc: string }[] = [
    { id: "cover", label: "Fill", desc: "Crop to fill the region" },
    { id: "contain", label: "Fit", desc: "Show the whole image, letterbox if needed" },
    { id: "tile", label: "Tile", desc: "Repeat the image like wallpaper" },
  ];

  return (
    <>
      <LabelRow>Gallery</LabelRow>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 8, marginBottom: 16 }}>
        {IMAGE_PRESETS.map((p) => {
          const active = p.url === url;
          return (
            <button
              key={p.url}
              type="button"
              onClick={() => onChange({ url: p.url })}
              aria-label={`Use ${p.label}`}
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "1/1",
                padding: 0,
                border: active ? "2px solid #DC143C" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                backgroundImage: `url("${p.url}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                cursor: "pointer",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: "3px 6px",
                  background: "linear-gradient(transparent, rgba(0,0,0,0.75))",
                  color: "#FFFFFF",
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  textAlign: "left",
                }}
              >
                {p.label}
              </span>
            </button>
          );
        })}
      </div>

      <LabelRow>Paste Image URL</LabelRow>
      <input
        type="url"
        value={url}
        onChange={(e) => onChange({ url: e.target.value })}
        placeholder="https://…"
        spellCheck={false}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10,
          padding: "10px 12px",
          color: "#FFFFFF",
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: 13,
          outline: "none",
          marginBottom: 14,
        }}
      />

      <LabelRow>How it fills</LabelRow>
      <div style={{ display: "flex", gap: 6 }}>
        {sizes.map((s) => {
          const active = size === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onChange({ size: s.id })}
              style={{
                flex: 1,
                padding: "8px 6px",
                background: active ? "#DC143C" : "rgba(255,255,255,0.04)",
                color: active ? "#FFFFFF" : "rgba(255,255,255,0.65)",
                border: active ? "1px solid #DC143C" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                cursor: "pointer",
              }}
              title={s.desc}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </>
  );
}

function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10,
        padding: 10,
      }}
    >
      <input
        type="color"
        value={normalizeHex(value)}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: 48,
          height: 48,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          padding: 0,
          flexShrink: 0,
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          color: "#FFFFFF",
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: 15,
          outline: "none",
          minWidth: 0,
        }}
      />
    </div>
  );
}

function LabelRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.45)",
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}

function normalizeHex(v: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
  return "#888888";
}

const dismissBtnStyle: CSSProperties = {
  background: "transparent",
  border: "none",
  color: "rgba(255,255,255,0.7)",
  fontSize: 12,
  cursor: "pointer",
  padding: 0,
};

const saveBtnStyle: CSSProperties = {
  width: "100%",
  marginTop: 18,
  padding: "13px 18px",
  background: "#DC143C",
  color: "#FFFFFF",
  border: "none",
  borderRadius: 999,
  fontFamily: "inherit",
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: "0.04em",
  cursor: "pointer",
};

// Suppress unused-warning for fillColor helper re-export (used by SleepDashboard
// importing from the same module — kept here to avoid a dangling export).
void fillColor;
