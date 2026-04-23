"use client";

import { ReactNode } from "react";
import { usePageEditing } from "@/lib/usePageEditing";
import { useEditMode } from "@/lib/useEditMode";
import { fillStyle, type Fill } from "@/lib/fills";

/**
 * Client wrapper that applies the stored page-background override (if any)
 * around server-rendered page content. Also renders the edit-mode toolbar
 * chip + a top-right pencil button for pages without SavySiteHeader.
 *
 * Use when you want edit mode on a page that should stay mostly server
 * components (essay pages, markdown-driven content). The chip only edits
 * the canvas; per-element editing needs client-side Editable wrappers.
 */
export function EditablePageBackground({
  route,
  fallback,
  children,
  showPencil = false,
}: {
  route: string;
  fallback: string;
  children: ReactNode;
  /** Set true on pages without SavySiteHeader so a floating pencil appears. */
  showPencil?: boolean;
}) {
  const { theme, fillFor, saveOverride } = usePageEditing(route);
  const canvas = theme.canvas || fallback;
  const canvasFill = fillFor("canvas", canvas);

  return (
    <div style={{ minHeight: "100vh", ...fillStyle(canvasFill, canvas) }}>
      {showPencil && <PagePencilButton />}
      <PageCanvasToolbar
        canvasValue={canvasFill}
        canvasFallback={canvas}
        onSaveCanvas={(v) => saveOverride("canvas", "Page Background", v)}
      />
      {children}
    </div>
  );
}

function PagePencilButton() {
  const edit = useEditMode();
  if (!edit) return null;
  const active = edit.enabled;
  return (
    <button
      type="button"
      onClick={edit.toggle}
      aria-label={active ? "Exit edit mode" : "Enter edit mode"}
      aria-pressed={active}
      style={{
        position: "fixed",
        top: "calc(16px + env(safe-area-inset-top, 0px))",
        right: 16,
        zIndex: 50,
        width: 36,
        height: 36,
        borderRadius: 999,
        background: active ? "#DC143C" : "rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.08)",
        color: active ? "#FFFFFF" : "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "background 0.15s ease, color 0.15s ease",
      }}
    >
      {active ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
      )}
    </button>
  );
}

function PageCanvasToolbar({
  canvasValue,
  canvasFallback,
  onSaveCanvas,
}: {
  canvasValue: Fill;
  canvasFallback: string;
  onSaveCanvas: (v: Fill) => void;
}) {
  const edit = useEditMode();
  if (!edit?.enabled) return null;
  const swatchColor =
    typeof canvasValue === "string"
      ? canvasValue
      : canvasValue.kind === "color"
        ? canvasValue.value
        : canvasValue.kind === "pattern"
          ? canvasValue.bg
          : canvasFallback;
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
      <button
        type="button"
        onClick={() =>
          edit.setActive({
            id: "canvas",
            label: "Page Background",
            description:
              "The color behind everything on the page. Solid, pattern, or a full-page image.",
            currentValue: canvasValue,
            onChange: onSaveCanvas,
            allowFills: true,
          })
        }
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
            background: swatchColor,
            border: "1px solid rgba(255,255,255,0.22)",
            display: "inline-block",
          }}
        />
        Page Background
      </button>
    </div>
  );
}
