"use client";

import { ReactNode } from "react";
import { useEditMode } from "@/lib/useEditMode";
import type { Fill } from "@/lib/fills";

/**
 * Wraps a region of the page so it becomes interactive in edit mode.
 *
 * Each Editable has a unique string id. In edit mode, the region gets a thin
 * dashed outline plus a floating label; tapping it opens the color/pattern/
 * image sheet bound to that id. Off: renders children untouched.
 *
 * allowFills (default true) controls whether the sheet exposes Pattern and
 * Image tabs, or only plain Color. Text elements should pass allowFills=false
 * since patterns and images don't make sense as text color.
 */
export function Editable({
  id,
  label,
  description,
  value,
  onChange,
  children,
  inline = false,
  allowFills = true,
}: {
  id: string;
  label: string;
  description: string;
  value: Fill;
  onChange: (next: Fill) => void;
  children: ReactNode;
  /** If true, render as an inline-block so it doesn't break inline flow. */
  inline?: boolean;
  /** If false, the sheet shows only the Color tab (good for text elements). */
  allowFills?: boolean;
}) {
  const ctx = useEditMode();
  if (!ctx || !ctx.enabled) return <>{children}</>;

  const isActive = ctx.active?.id === id;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        ctx.setActive({ id, label, description, currentValue: value, onChange, allowFills });
      }}
      style={{
        position: "relative",
        display: inline ? "inline-block" : "block",
        outline: isActive
          ? "2px solid #DC143C"
          : "2px dashed rgba(220,20,60,0.55)",
        outlineOffset: 4,
        borderRadius: 6,
        cursor: "pointer",
        transition: "outline 0.15s ease",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: -11,
          left: 8,
          background: "#DC143C",
          color: "#FFFFFF",
          fontFamily: "'Inter', -apple-system, sans-serif",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          padding: "3px 7px",
          borderRadius: 4,
          whiteSpace: "nowrap",
          zIndex: 10,
          pointerEvents: "none",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}
