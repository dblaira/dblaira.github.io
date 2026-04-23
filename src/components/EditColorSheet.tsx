"use client";

import { useEffect, useState } from "react";
import { useEditMode } from "@/lib/useEditMode";

/**
 * Bottom panel (a small slide-up sheet at the bottom of the viewport) that
 * appears when a region has been tapped in edit mode. Shows the region's
 * label, a plain-English description, and a native color picker. Changes are
 * applied live to the page as the color is picked.
 */
export function EditColorSheet() {
  const ctx = useEditMode();
  const [localValue, setLocalValue] = useState<string>("");

  useEffect(() => {
    if (ctx?.active) setLocalValue(ctx.active.currentValue);
  }, [ctx?.active]);

  if (!ctx || !ctx.active) return null;

  const { label, description, onChange } = ctx.active;

  const apply = (next: string) => {
    setLocalValue(next);
    onChange(next);
  };

  return (
    <>
      {/* Tap-away scrim behind the sheet */}
      <div
        onClick={() => ctx.setActive(null)}
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
        }}
      >
        <div
          style={{
            width: 42,
            height: 4,
            borderRadius: 2,
            background: "rgba(255,255,255,0.18)",
            margin: "0 auto 16px",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#DC143C",
            }}
          >
            Editing
          </span>
          <button
            type="button"
            onClick={() => ctx.setActive(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.7)",
              fontSize: 12,
              cursor: "pointer",
              padding: 0,
            }}
          >
            Done
          </button>
        </div>

        <h2
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 26,
            fontWeight: 500,
            lineHeight: 1.15,
            margin: "0 0 8px",
          }}
        >
          {label}
        </h2>

        <p
          style={{
            fontSize: 13,
            lineHeight: 1.45,
            color: "rgba(255,255,255,0.7)",
            margin: "0 0 18px",
          }}
        >
          {description}
        </p>

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
            value={normalizeHex(localValue)}
            onChange={(e) => apply(e.target.value)}
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
            value={localValue}
            onChange={(e) => apply(e.target.value)}
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

        <button
          type="button"
          onClick={() => ctx.setActive(null)}
          style={{
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
          }}
        >
          Save & close
        </button>
      </div>
    </>
  );
}

// Native <input type="color"> requires a 7-char #rrggbb. If the stored value
// is anything else (rgb(), too short, etc.), we fall back to a neutral grey so
// the picker opens correctly.
function normalizeHex(v: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
  return "#888888";
}
