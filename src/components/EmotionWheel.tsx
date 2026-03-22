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
  outer: string[];
}

export const FAMILIES: EmotionFamily[] = [
  { name: "Joy",          color: "#FACC15", energy: "high",  valence: "pleasant",    inner: "Joy",          outer: ["Ecstasy", "Serenity"] },
  { name: "Trust",        color: "#86EFAC", energy: "low",   valence: "pleasant",    inner: "Trust",        outer: ["Admiration", "Acceptance"] },
  { name: "Fear",         color: "#6EE7B7", energy: "high",  valence: "unpleasant",  inner: "Fear",         outer: ["Terror", "Apprehension"] },
  { name: "Surprise",     color: "#67E8F9", energy: "high",  valence: "unpleasant",  inner: "Surprise",     outer: ["Amazement", "Distraction"] },
  { name: "Sadness",      color: "#93C5FD", energy: "low",   valence: "unpleasant",  inner: "Sadness",      outer: ["Grief", "Pensiveness"] },
  { name: "Disgust",      color: "#C4B5FD", energy: "low",   valence: "unpleasant",  inner: "Disgust",      outer: ["Loathing", "Boredom"] },
  { name: "Anger",        color: "#FCA5A5", energy: "high",  valence: "unpleasant",  inner: "Anger",        outer: ["Rage", "Annoyance"] },
  { name: "Anticipation", color: "#FDBA74", energy: "high",  valence: "pleasant",    inner: "Anticipation", outer: ["Vigilance", "Interest"] },
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

interface Props {
  selected: EmotionSelection | null;
  onSelect: (sel: EmotionSelection) => void;
  getLabel?: (canonical: string) => string;
}

export function EmotionWheel({ selected, onSelect, getLabel }: Props) {
  const label = getLabel ?? ((s: string) => s);
  const [hovered, setHovered] = useState<string | null>(null);

  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const innerR = 50;
  const midR = 110;
  const outerR = 155;
  const sliceAngle = 360 / FAMILIES.length;

  const segments = useMemo(() => {
    const result: {
      path: string;
      label: string;
      labelPos: { x: number; y: number };
      color: string;
      emotion: string;
      family: EmotionFamily;
      ring: "inner" | "outer";
      outerIndex?: number;
    }[] = [];

    FAMILIES.forEach((fam, i) => {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const midAngle = startAngle + sliceAngle / 2;

      // Inner ring (core emotion)
      const innerPath = arcPath(cx, cy, innerR, midR, startAngle, endAngle);
      const innerLabel = polarToCartesian(cx, cy, (innerR + midR) / 2, midAngle);
      result.push({
        path: innerPath,
        label: fam.inner,
        labelPos: innerLabel,
        color: fam.color,
        emotion: fam.inner,
        family: fam,
        ring: "inner",
      });

      // Outer ring (2 variants per family)
      const outerSlice = sliceAngle / fam.outer.length;
      fam.outer.forEach((variant, j) => {
        const oStart = startAngle + j * outerSlice;
        const oEnd = oStart + outerSlice;
        const oMid = oStart + outerSlice / 2;
        const outerPath = arcPath(cx, cy, midR, outerR, oStart, oEnd);
        const outerLabel = polarToCartesian(cx, cy, (midR + outerR) / 2, oMid);
        result.push({
          path: outerPath,
          label: variant,
          labelPos: outerLabel,
          color: fam.color,
          emotion: variant,
          family: fam,
          ring: "outer",
          outerIndex: j,
        });
      });
    });

    return result;
  }, [cx, cy, sliceAngle]);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      style={{ width: "100%", maxWidth: size, display: "block", margin: "0 auto", touchAction: "manipulation" }}
    >
      {segments.map((seg) => {
        const displayLabel = label(seg.emotion);
        const isSelected = selected?.emotion === displayLabel;
        const isHovered = hovered === seg.emotion;
        const isFamily = selected?.family === seg.family.name;
        const dimmed = selected && !isFamily;
        const baseOpacity = seg.ring === "inner" ? 0.9 : 0.65;
        const opacity = dimmed ? 0.25 : isSelected ? 1 : isHovered ? 0.95 : baseOpacity;

        return (
          <g key={seg.emotion + seg.ring}>
            <path
              d={seg.path}
              fill={seg.color}
              opacity={opacity}
              stroke={isSelected ? "#DC143C" : "#FFFFFF"}
              strokeWidth={isSelected ? 3 : 1}
              style={{ cursor: "pointer", transition: "opacity 0.15s, stroke-width 0.15s" }}
              onClick={() =>
                onSelect({
                  emotion: displayLabel,
                  family: seg.family.name,
                  energy: seg.family.energy,
                  valence: seg.family.valence,
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
              fill={dimmed ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.75)"}
              fontFamily="'Inter', sans-serif"
              fontWeight={seg.ring === "inner" ? 700 : 500}
              fontSize={seg.ring === "inner" ? 11 : 9}
              style={{ pointerEvents: "none", transition: "fill 0.15s" }}
            >
              {displayLabel}
            </text>
          </g>
        );
      })}

      {/* Center circle */}
      <circle cx={cx} cy={cy} r={innerR} fill="#F5F0E8" stroke="rgba(0,0,0,0.08)" strokeWidth={1} />
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        dominantBaseline="central"
        fill={selected ? "#DC143C" : "rgba(0,0,0,0.25)"}
        fontFamily="'Playfair Display', Georgia, serif"
        fontWeight={400}
        fontStyle="italic"
        fontSize={selected ? 13 : 11}
        style={{ transition: "all 0.2s" }}
      >
        {selected?.emotion ?? "How do"}
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        dominantBaseline="central"
        fill={selected ? "rgba(220,20,60,0.6)" : "rgba(0,0,0,0.2)"}
        fontFamily="'Inter', sans-serif"
        fontWeight={500}
        fontSize={9}
        style={{ transition: "all 0.2s" }}
      >
        {selected ? selected.family : "you feel?"}
      </text>
    </svg>
  );
}
