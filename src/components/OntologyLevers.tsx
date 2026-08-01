"use client";

import { useMemo } from "react";
import type { CorrelationPair } from "@/lib/types";
import { getCategoryColor } from "@/lib/types";

interface LeverScore {
  category: string;
  directScore: number;
  predictiveScore: number;
  totalScore: number;
  directCount: number;
  predictiveCount: number;
  cascadesInto: Array<{ category: string; strength: number }>;
  risesWithFrom: string[];
}

function computeLevers(
  correlations: CorrelationPair[],
  lagged: CorrelationPair[]
): LeverScore[] {
  const scores: Record<string, LeverScore> = {};

  const ensureEntry = (cat: string) => {
    if (!scores[cat]) {
      scores[cat] = {
        category: cat,
        directScore: 0,
        predictiveScore: 0,
        totalScore: 0,
        directCount: 0,
        predictiveCount: 0,
        cascadesInto: [],
        risesWithFrom: [],
      };
    }
  };

  for (const c of correlations) {
    ensureEntry(c.categoryA);
    ensureEntry(c.categoryB);
    const strength = Math.abs(c.coefficient);
    scores[c.categoryA].directScore += strength;
    scores[c.categoryB].directScore += strength;
    scores[c.categoryA].directCount++;
    scores[c.categoryB].directCount++;
    if (c.coefficient > 0) {
      scores[c.categoryA].risesWithFrom.push(c.categoryB);
      scores[c.categoryB].risesWithFrom.push(c.categoryA);
    }
  }

  for (const c of lagged) {
    ensureEntry(c.categoryA);
    ensureEntry(c.categoryB);
    const strength = Math.abs(c.coefficient);
    scores[c.categoryA].predictiveScore += strength;
    scores[c.categoryA].predictiveCount++;
    scores[c.categoryA].cascadesInto.push({ category: c.categoryB, strength });
  }

  for (const entry of Object.values(scores)) {
    // Predictive links get a 1.5× bonus: influencing future state is higher leverage than co-movement
    entry.totalScore = entry.directScore + entry.predictiveScore * 1.5;
    entry.cascadesInto.sort((a, b) => b.strength - a.strength);
  }

  return Object.values(scores)
    .filter((s) => s.totalScore > 0)
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 5);
}

interface OntologyLeversProps {
  correlations: CorrelationPair[];
  lagged: CorrelationPair[];
}

export function OntologyLevers({ correlations, lagged }: OntologyLeversProps) {
  const levers = useMemo(() => computeLevers(correlations, lagged), [correlations, lagged]);

  if (levers.length === 0) return null;

  const maxScore = levers[0].totalScore;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#DC143C",
          }}
        >
          HIGHEST LEVERAGE
        </span>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            color: "rgba(0,0,0,0.45)",
            margin: "4px 0 0 0",
            lineHeight: 1.5,
          }}
        >
          Categories with the strongest ripple effect across your behavior system.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {levers.map((lever, i) => {
          const color = getCategoryColor(lever.category);
          const barWidth = Math.round((lever.totalScore / maxScore) * 100);
          const cascadeLabels = lever.cascadesInto.slice(0, 3).map((c) => c.category);
          const riseLabels = lever.risesWithFrom.slice(0, 3);
          const hasCascade = cascadeLabels.length > 0;
          const hasRise = riseLabels.length > 0;

          return (
            <div
              key={lever.category}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "14px 16px",
                background: "rgba(0,0,0,0.025)",
                borderRadius: 10,
                borderLeft: `3px solid ${color}`,
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(0,0,0,0.22)",
                  width: 18,
                  flexShrink: 0,
                  paddingTop: 2,
                }}
              >
                #{i + 1}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "rgba(0,0,0,0.8)",
                    }}
                  >
                    {lever.category}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 11,
                      color: "rgba(0,0,0,0.3)",
                      marginLeft: "auto",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {lever.directCount} direct
                    {lever.predictiveCount > 0
                      ? ` · ${lever.predictiveCount} predictive`
                      : ""}
                  </span>
                </div>

                <div
                  style={{
                    height: 4,
                    background: "rgba(0,0,0,0.07)",
                    borderRadius: 2,
                    overflow: "hidden",
                    marginBottom: hasCascade || hasRise ? 8 : 0,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${barWidth}%`,
                      background: color,
                      borderRadius: 2,
                    }}
                  />
                </div>

                {hasCascade && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 11,
                        color: "#A74D4D",
                        fontWeight: 600,
                      }}
                    >
                      predicts →
                    </span>
                    {cascadeLabels.map((cat) => (
                      <span
                        key={cat}
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 11,
                          color: "rgba(0,0,0,0.6)",
                          background: `${getCategoryColor(cat)}18`,
                          border: `1px solid ${getCategoryColor(cat)}44`,
                          borderRadius: 4,
                          padding: "1px 7px",
                        }}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                {!hasCascade && hasRise && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 11,
                        color: "#4F7F63",
                        fontWeight: 600,
                      }}
                    >
                      rises with →
                    </span>
                    {riseLabels.map((cat) => (
                      <span
                        key={cat}
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 11,
                          color: "rgba(0,0,0,0.6)",
                          background: `${getCategoryColor(cat)}18`,
                          border: `1px solid ${getCategoryColor(cat)}44`,
                          borderRadius: 4,
                          padding: "1px 7px",
                        }}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
