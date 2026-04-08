"use client";

import { useState } from "react";
import { FAMILIES, type EmotionSelection } from "./EmotionWheel";

function darken(hex: string, factor = 0.7): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)})`;
}

function tint(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface Props {
  selected: EmotionSelection | null;
  onSelect: (sel: EmotionSelection) => void;
  getLabel?: (canonical: string) => string;
}

export function EmotionGrid({ selected, onSelect, getLabel }: Props) {
  const label = getLabel ?? ((s: string) => s);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
      }}
    >
      {FAMILIES.map((fam) => {
        const isActiveFamily = selected?.family === fam.name;
        const coreSelected = selected?.emotion === label(fam.inner);
        const dimmed = !!(selected && !isActiveFamily);

        return (
          <div
            key={fam.name}
            onMouseEnter={() => setHovered(fam.name)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: "#FFFFFF",
              borderRadius: 12,
              padding: "14px 12px 12px",
              borderLeft: `4px solid ${fam.color}`,
              opacity: dimmed ? 0.35 : 1,
              transition: "opacity 0.15s, box-shadow 0.15s",
              boxShadow:
                isActiveFamily
                  ? `0 2px 12px ${tint(fam.color, 0.25)}`
                  : hovered === fam.name
                    ? "0 2px 8px rgba(0,0,0,0.08)"
                    : "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <button
              type="button"
              onClick={() =>
                onSelect({
                  emotion: label(fam.inner),
                  family: fam.name,
                  energy: fam.energy,
                  valence: fam.valence,
                })
              }
              style={{
                background: coreSelected ? tint(fam.color, 0.12) : "none",
                border: "none",
                borderRadius: 6,
                padding: "2px 6px",
                margin: "0 0 8px -6px",
                cursor: "pointer",
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 19,
                fontWeight: 700,
                fontStyle: "italic",
                color: darken(fam.color, 0.75),
                display: "block",
                transition: "background 0.12s",
              }}
            >
              {label(fam.inner)}
            </button>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {[...fam.mid, ...fam.outer].map((variant) => {
                const displayLabel = label(variant);
                const isSelected = selected?.emotion === displayLabel;
                return (
                  <button
                    key={variant}
                    type="button"
                    onClick={() =>
                      onSelect({
                        emotion: displayLabel,
                        family: fam.name,
                        energy: fam.energy,
                        valence: fam.valence,
                      })
                    }
                    style={{
                      padding: "4px 10px",
                      background: isSelected ? fam.color : "rgba(0,0,0,0.04)",
                      color: isSelected ? "#FFFFFF" : "rgba(0,0,0,0.5)",
                      border: isSelected
                        ? `1.5px solid ${fam.color}`
                        : "1.5px solid transparent",
                      borderRadius: 14,
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.12s",
                      lineHeight: 1.4,
                    }}
                  >
                    {displayLabel}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
