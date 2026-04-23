"use client";

import { useEditMode } from "@/lib/useEditMode";

/**
 * Small pill-shaped toast that appears near the bottom of the screen after
 * every save. Shows the region name + a short "Saved" message, and an
 * "Undo" button when the change can be reverted. Auto-dismisses after ~4
 * seconds (handled in the provider).
 */
export function EditToast() {
  const ctx = useEditMode();
  if (!ctx || !ctx.toast) return null;

  const { label, message, onUndo } = ctx.toast;

  const handleUndo = async () => {
    if (onUndo) await onUndo();
    ctx.dismissToast();
  };

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        left: "50%",
        bottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
        transform: "translateX(-50%)",
        zIndex: 9997,
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: "#121212",
        color: "#FFFFFF",
        padding: "12px 8px 12px 18px",
        borderRadius: 999,
        boxShadow: "0 8px 28px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06)",
        fontFamily: "'Inter', -apple-system, sans-serif",
        fontSize: 13,
        maxWidth: "calc(100vw - 32px)",
        animation: "toastIn 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}
    >
      <style>{`
        @keyframes toastIn {
          from { transform: translate(-50%, 12px); opacity: 0; }
          to   { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
      <span style={{ color: "#22C55E", fontWeight: 700, letterSpacing: "0.04em" }}>{message}</span>
      <span style={{ color: "rgba(255,255,255,0.6)" }}>·</span>
      <span style={{ color: "#FFFFFF", fontWeight: 500 }}>{label}</span>
      {onUndo && (
        <button
          type="button"
          onClick={handleUndo}
          style={{
            background: "rgba(220,20,60,0.18)",
            color: "#FFFFFF",
            border: "1px solid rgba(220,20,60,0.4)",
            borderRadius: 999,
            padding: "6px 14px",
            fontFamily: "inherit",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.04em",
            cursor: "pointer",
            marginLeft: 2,
          }}
        >
          Undo
        </button>
      )}
    </div>
  );
}
