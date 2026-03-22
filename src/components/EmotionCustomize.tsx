"use client";

import { useState } from "react";
import { FAMILIES } from "./EmotionWheel";
import type { useEmotionConfig } from "@/lib/useEmotionConfig";

const CRIMSON = "#DC143C";

const DEFAULT_TRIGGERS = [
  "Work",
  "Relationship",
  "Health",
  "Money",
  "Uncertainty",
  "Boredom",
  "Rejection",
  "Momentum",
];

interface Props {
  config: ReturnType<typeof useEmotionConfig>;
}

function EditableLabel({
  canonical,
  current,
  color,
  onSave,
}: {
  canonical: string;
  current: string;
  color: string;
  onSave: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(current);
  const [saved, setSaved] = useState(false);
  const isCustom = current !== canonical;

  const commit = () => {
    onSave(draft);
    setEditing(false);
    if (draft.trim() !== current) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  };

  if (editing) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: color,
            flexShrink: 0,
          }}
        />
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(current);
              setEditing(false);
            }
          }}
          placeholder={canonical}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: `2px solid ${CRIMSON}`,
            borderRadius: 8,
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            outline: "none",
            background: "#FFFFFF",
            boxSizing: "border-box",
          }}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(current);
        setEditing(true);
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "10px 12px",
        background: isCustom ? "rgba(220, 20, 60, 0.04)" : "transparent",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.15s",
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: "#1A1A1A",
          flex: 1,
        }}
      >
        {current}
      </span>
      {isCustom && (
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            color: "rgba(0,0,0,0.3)",
          }}
        >
          was {canonical}
        </span>
      )}
      {saved ? (
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            color: "#22C55E",
            animation: "savyMenuFadeIn 0.15s ease-out",
          }}
        >
          Saved
        </span>
      ) : (
        <span
          style={{
            fontSize: 12,
            color: "rgba(0,0,0,0.2)",
          }}
        >
          ✎
        </span>
      )}
    </button>
  );
}

export function EmotionCustomize({ config }: Props) {
  const { getEmotionLabel, getTriggerLabel, setEmotionLabel, setTriggerLabel } = config;

  const allEmotions: { canonical: string; color: string }[] = [];
  for (const fam of FAMILIES) {
    allEmotions.push({ canonical: fam.inner, color: fam.color });
    for (const v of fam.outer) {
      allEmotions.push({ canonical: v, color: fam.color });
    }
  }

  return (
    <div>
      {/* Emotion labels */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          padding: "24px 16px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          marginBottom: 24,
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
            display: "block",
            marginBottom: 4,
          }}
        >
          Emotion Words
        </span>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            color: "rgba(0,0,0,0.3)",
            display: "block",
            marginBottom: 16,
          }}
        >
          Tap any word to replace it with your own
        </span>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {allEmotions.map(({ canonical, color }) => (
            <EditableLabel
              key={canonical}
              canonical={canonical}
              current={getEmotionLabel(canonical)}
              color={color}
              onSave={(v) => setEmotionLabel(canonical, v)}
            />
          ))}
        </div>
      </div>

      {/* Trigger labels */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          padding: "24px 16px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
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
            display: "block",
            marginBottom: 4,
          }}
        >
          Trigger Words
        </span>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            color: "rgba(0,0,0,0.3)",
            display: "block",
            marginBottom: 16,
          }}
        >
          Tap any trigger to rename it
        </span>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {DEFAULT_TRIGGERS.map((canonical) => (
            <EditableLabel
              key={canonical}
              canonical={canonical}
              current={getTriggerLabel(canonical)}
              color="rgba(0,0,0,0.15)"
              onSave={(v) => setTriggerLabel(canonical, v)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
