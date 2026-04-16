"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { useTheme, type Theme, type ComponentKind } from "@/lib/useTheme";

const isLight = (hex: string) => {
  const h = hex.replace("#", "");
  if (h.length !== 6) return true;
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 140;
};
const contrastInk = (bg: string) => (isLight(bg) ? "#1A1A1A" : "#FFFFFF");

export default function StudioSidebar() {
  const pathname = usePathname() || "/";
  const hidden = pathname.startsWith("/studio");
  const theme = useTheme(pathname);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-studio-sidebar", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-studio-sidebar", onOpen);
    };
  }, []);

  const patch = useCallback(
    async (updates: Partial<Theme>) => {
      const supabase = getSupabase();
      await supabase.from("studio_themes").update(updates).eq("route", pathname);
    },
    [pathname]
  );

  if (hidden || !open) return null;

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "transparent",
        }}
      />
      <aside
        role="dialog"
        aria-label="Studio panel"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(360px, 92vw)",
          zIndex: 9999,
          background: "#0A0A0A",
          color: "#fff",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "-12px 0 32px rgba(0,0,0,0.35)",
          overflowY: "auto",
          fontFamily: "'Inter', -apple-system, sans-serif",
          animation: "studioSlideIn 0.22s ease-out",
          padding: "calc(20px + env(safe-area-inset-top)) 20px calc(80px + env(safe-area-inset-bottom))",
        }}
      >
        <style>{`
          @keyframes studioSlideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: "italic",
                color: "#DC143C",
                fontSize: 24,
                lineHeight: 1,
              }}
            >
              studio
            </div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
                marginTop: 4,
              }}
            >
              editing · {pathname}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close Studio panel"
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.5)",
              cursor: "pointer",
              fontSize: 20,
              lineHeight: 1,
              padding: "4px 6px",
            }}
          >
            ×
          </button>
        </div>

        <Section label="canvas">
          <ColorField
            hex={theme.canvas}
            onChange={(hex) => patch({ canvas: hex, ink: contrastInk(hex) })}
          />
        </Section>

        <Section label="accents">
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {theme.accents.map((hex, i) => (
              <ColorField
                key={`${i}-${hex}`}
                hex={hex}
                compact
                onChange={(next) => {
                  const copy = [...theme.accents];
                  copy[i] = next;
                  patch({ accents: copy });
                }}
                onRemove={() =>
                  patch({ accents: theme.accents.filter((_, j) => j !== i) })
                }
              />
            ))}
            <button
              type="button"
              onClick={() => patch({ accents: [...theme.accents, "#888888"] })}
              style={addBtn}
              aria-label="Add accent"
            >
              +
            </button>
          </div>
        </Section>

        <Section label="heading font">
          <FontPicker
            value={theme.heading_font}
            onChange={(f) => patch({ heading_font: f })}
          />
        </Section>

        <Section label="body font">
          <FontPicker
            value={theme.body_font}
            onChange={(f) => patch({ body_font: f })}
          />
        </Section>

        <Section label="component kind">
          <select
            value={theme.component_kind}
            onChange={(e) =>
              patch({ component_kind: e.target.value as ComponentKind })
            }
            style={selectStyle}
          >
            <option value="feed-tiles">feed tiles (Pinterest)</option>
            <option value="meal-blocks">meal blocks</option>
            <option value="rings-grid">rings grid</option>
            <option value="emotion-wheel">emotion wheel</option>
            <option value="graph-nodes">graph nodes</option>
            <option value="card-stack">card stack</option>
          </select>
        </Section>

        <Section label="notes">
          <textarea
            value={theme.notes}
            onChange={(e) => patch({ notes: e.target.value })}
            rows={3}
            style={{
              ...selectStyle,
              resize: "vertical",
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: 14,
            }}
          />
        </Section>

        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 24,
            paddingTop: 20,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Link
            href={`/studio?route=${encodeURIComponent(pathname)}`}
            onClick={() => setOpen(false)}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "10px 12px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#fff",
              textDecoration: "none",
              fontSize: 12,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            open full studio ↗
          </Link>
        </div>
      </aside>
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.4)",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function ColorField({
  hex,
  onChange,
  onRemove,
  compact,
}: {
  hex: string;
  onChange: (hex: string) => void;
  onRemove?: () => void;
  compact?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(255,255,255,0.06)",
        borderRadius: 8,
        padding: 4,
        width: compact ? "auto" : "100%",
      }}
    >
      <input
        type="color"
        value={hex}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: 28,
          height: 28,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          padding: 0,
        }}
      />
      {!compact && (
        <input
          type="text"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            color: "#fff",
            fontFamily: "ui-monospace, monospace",
            fontSize: 13,
            outline: "none",
          }}
        />
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove accent"
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.3)",
            cursor: "pointer",
            fontSize: 14,
            padding: "0 4px",
          }}
        >
          ×
        </button>
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
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={selectStyle}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o.split(",")[0].replace(/'/g, "")}
        </option>
      ))}
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
