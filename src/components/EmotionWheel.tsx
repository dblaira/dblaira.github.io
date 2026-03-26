"use client";

import { useState, useMemo } from "react";

export interface EmotionSelection {
  emotion: string;
  family: string;
  energy: "high" | "low";
  valence: "pleasant" | "unpleasant";
}

export interface EmotionFamily {
  name: string;
  color: string;
  energy: "high" | "low";
  valence: "pleasant" | "unpleasant";
  inner: string;
  mid: string[];
  outer: string[];
}

export const FAMILIES: EmotionFamily[] = [
  { name: "Joy",          color: "#FFD700", energy: "high",  valence: "pleasant",   inner: "Joy",          mid: ["Ecstasy",   "Serenity"],  outer: ["Cheerful", "Pleased"]   },
  { name: "Trust",        color: "#00C000", energy: "low",   valence: "pleasant",   inner: "Trust",        mid: ["Admiration","Acceptance"], outer: ["Devoted",  "Confident"] },
  { name: "Fear",         color: "#00A86B", energy: "high",  valence: "unpleasant", inner: "Fear",         mid: ["Terror",    "Uneasy"],     outer: ["Scared",   "Nervous"]   },
  { name: "Surprise",     color: "#00BFFF", energy: "high",  valence: "unpleasant", inner: "Surprise",     mid: ["Amazement", "Dazed"],      outer: ["Stunned",  "Puzzled"]   },
  { name: "Sadness",      color: "#0000FF", energy: "low",   valence: "unpleasant", inner: "Sadness",      mid: ["Grief",     "Wistful"],    outer: ["Lonely",   "Lost"]      },
  { name: "Disgust",      color: "#8000FF", energy: "low",   valence: "unpleasant", inner: "Disgust",      mid: ["Loathing",  "Boredom"],    outer: ["Sick",     "Numb"]      },
  { name: "Anger",        color: "#FF0000", energy: "high",  valence: "unpleasant", inner: "Anger",        mid: ["Rage",      "Irked"],      outer: ["Furious",  "Testy"]     },
  { name: "Anticipation", color: "#FF8000", energy: "high",  valence: "pleasant",   inner: "Anticipation", mid: ["Alert",     "Interest"],   outer: ["Eager",    "Curious"]   },
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, rInner: number, rOuter: number, startAngle: number, endAngle: number) {
  const s1 = polarToCartesian(cx, cy, rOuter, endAngle);
  const s2 = polarToCartesian(cx, cy, rOuter, startAngle);
  const s3 = polarToCartesian(cx, cy, rInner, startAngle);
  const s4 = polarToCartesian(cx, cy, rInner, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${s1.x} ${s1.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${s2.x} ${s2.y}`,
    `L ${s3.x} ${s3.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 1 ${s4.x} ${s4.y}`,
    "Z",
  ].join(" ");
}

// Radial text: right side reads inward→outward, left side flipped to stay legible
function radialTextRotation(midAngleDeg: number): number {
  const a = ((midAngleDeg % 360) + 360) % 360;
  return a > 180 ? midAngleDeg + 90 : midAngleDeg - 90;
}

interface SegmentData {
  path: string;
  labelText: string;
  labelPos: { x: number; y: number };
  labelRotate: number;
  color: string;
  baseOpacity: number;
  emotion: string;
  family: EmotionFamily;
  ring: "inner" | "mid" | "outer";
  rotated: boolean;
}

interface Props {
  selected: EmotionSelection | null;
  onSelect: (sel: EmotionSelection) => void;
  getLabel?: (canonical: string) => string;
}

export function EmotionWheel({ selected, onSelect, getLabel }: Props) {
  const label = getLabel ?? ((s: string) => s);
  const [hovered, setHovered] = useState<string | null>(null);

  const size    = 440;
  const cx      = size / 2;
  const cy      = size / 2;
  const centerR = 50;   // white center circle
  const ring1In = 50;   // inner ring start
  const ring1Out= 120;  // inner ring end / mid ring start
  const ring2Out= 175;  // mid ring end / outer ring start
  const ring3Out= 215;  // outer ring end

  const sliceAngle    = 360 / FAMILIES.length;  // 45°
  const subSliceAngle = sliceAngle / 2;          // 22.5°

  const segments = useMemo((): SegmentData[] => {
    const result: SegmentData[] = [];

    FAMILIES.forEach((fam, i) => {
      const startAngle = i * sliceAngle;
      const endAngle   = startAngle + sliceAngle;
      const midAngle   = startAngle + sliceAngle / 2;

      // Inner ring — full 45° slice, core emotion
      result.push({
        path:        arcPath(cx, cy, ring1In, ring1Out, startAngle, endAngle),
        labelText:   fam.inner,
        labelPos:    polarToCartesian(cx, cy, (ring1In + ring1Out) / 2, midAngle),
        labelRotate: 0,
        color:       fam.color,
        baseOpacity: 1,
        emotion:     fam.inner,
        family:      fam,
        ring:        "inner",
        rotated:     false,
      });

      // Mid ring — 2 sub-slices of 22.5° each
      fam.mid.forEach((variant, j) => {
        const sA = startAngle + j * subSliceAngle;
        const eA = sA + subSliceAngle;
        const mA = sA + subSliceAngle / 2;
        result.push({
          path:        arcPath(cx, cy, ring1Out, ring2Out, sA, eA),
          labelText:   variant,
          labelPos:    polarToCartesian(cx, cy, (ring1Out + ring2Out) / 2, mA),
          labelRotate: radialTextRotation(mA),
          color:       fam.color,
          baseOpacity: 0.80,
          emotion:     variant,
          family:      fam,
          ring:        "mid",
          rotated:     true,
        });
      });

      // Outer ring — 2 sub-slices of 22.5° each
      fam.outer.forEach((variant, j) => {
        const sA = startAngle + j * subSliceAngle;
        const eA = sA + subSliceAngle;
        const mA = sA + subSliceAngle / 2;
        result.push({
          path:        arcPath(cx, cy, ring2Out, ring3Out, sA, eA),
          labelText:   variant,
          labelPos:    polarToCartesian(cx, cy, (ring2Out + ring3Out) / 2, mA),
          labelRotate: radialTextRotation(mA),
          color:       fam.color,
          baseOpacity: 0.62,
          emotion:     variant,
          family:      fam,
          ring:        "outer",
          rotated:     true,
        });
      });
    });

    return result;
  }, [cx, cy, sliceAngle, subSliceAngle]);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      style={{ width: "100%", maxWidth: size, display: "block", margin: "0 auto", touchAction: "manipulation" }}
    >
      {segments.map((seg) => {
        const displayLabel = label(seg.emotion);
        const isSelected   = selected?.emotion === displayLabel;
        const isHovered    = hovered === seg.emotion;
        const isFamily     = selected?.family === seg.family.name;
        const dimmed       = !!(selected && !isFamily);
        const opacity      = dimmed ? 0.18 : isSelected ? 1 : isHovered ? 0.97 : seg.baseOpacity;

        const textFill  = dimmed ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.95)";
        const fontSize  = seg.ring === "inner" ? 13 : seg.ring === "mid" ? 10 : 9;
        const fontWeight= seg.ring === "inner" ? 700 : 600;

        return (
          <g key={`${seg.emotion}-${seg.ring}`}>
            <path
              d={seg.path}
              fill={seg.color}
              opacity={opacity}
              stroke={isSelected ? "#1a1a1a" : "#FFFFFF"}
              strokeWidth={isSelected ? 2.5 : 0.8}
              style={{ cursor: "pointer", transition: "opacity 0.15s" }}
              onClick={() =>
                onSelect({
                  emotion:  displayLabel,
                  family:   seg.family.name,
                  energy:   seg.family.energy,
                  valence:  seg.family.valence,
                })
              }
              onMouseEnter={() => setHovered(seg.emotion)}
              onMouseLeave={() => setHovered(null)}
            />
            <text
              x={seg.labelPos.x}
              y={seg.labelPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={textFill}
              fontFamily="'Inter', sans-serif"
              fontWeight={fontWeight}
              fontSize={fontSize}
              transform={seg.rotated ? `rotate(${seg.labelRotate}, ${seg.labelPos.x}, ${seg.labelPos.y})` : undefined}
              style={{ pointerEvents: "none", transition: "fill 0.15s" }}
            >
              {displayLabel}
            </text>
          </g>
        );
      })}

      {/* Centre circle */}
      <circle cx={cx} cy={cy} r={centerR} fill="#F5F0E8" stroke="rgba(0,0,0,0.08)" strokeWidth={1} />
      <text
        x={cx} y={cy - 7}
        textAnchor="middle" dominantBaseline="central"
        fill={selected ? "#DC143C" : "rgba(0,0,0,0.25)"}
        fontFamily="'Playfair Display', Georgia, serif"
        fontWeight={400} fontStyle="italic"
        fontSize={selected ? 13 : 11}
        style={{ transition: "all 0.2s" }}
      >
        {selected?.emotion ?? "How do"}
      </text>
      <text
        x={cx} y={cy + 10}
        textAnchor="middle" dominantBaseline="central"
        fill={selected ? "rgba(220,20,60,0.6)" : "rgba(0,0,0,0.2)"}
        fontFamily="'Inter', sans-serif"
        fontWeight={500} fontSize={9}
        style={{ transition: "all 0.2s" }}
      >
        {selected ? selected.family : "you feel?"}
      </text>
    </svg>
  );
}
