"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";

const CRIMSON = "#DC143C";
const INTER = "'Inter', sans-serif";
const PLAYFAIR = "'Playfair Display', Georgia, serif";

interface ModelCost {
  model: string;
  sessions: number;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cost: number;
}

interface DayCost {
  date: string;
  models: ModelCost[];
  total_cost: number;
  total_sessions: number;
}

interface CostReport {
  days: DayCost[];
  total_cost: number;
  generated_at: string;
}

interface ReportRow {
  machine: string;
  report: CostReport;
  created_at: string;
}

function formatCost(n: number): string {
  return n < 0.01 && n > 0 ? "<$0.01" : `$${n.toFixed(2)}`;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

export default function CostDashboard() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const sb = getSupabase();
      // Get most recent report per machine
      const { data } = await sb
        .from("agent_cost_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) {
        // Dedupe by machine — keep latest
        const seen = new Set<string>();
        const deduped: ReportRow[] = [];
        for (const r of data) {
          if (!seen.has(r.machine)) {
            seen.add(r.machine);
            deduped.push(r);
          }
        }
        setReports(deduped);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Merge all reports into one daily view
  const allDays = new Map<string, { cost: number; sessions: number; models: Map<string, ModelCost> }>();
  for (const r of reports) {
    for (const day of r.report.days) {
      const existing = allDays.get(day.date) ?? {
        cost: 0,
        sessions: 0,
        models: new Map(),
      };
      existing.cost += day.total_cost;
      existing.sessions += day.total_sessions;
      for (const m of day.models) {
        const em = existing.models.get(m.model);
        if (em) {
          em.sessions += m.sessions;
          em.input_tokens += m.input_tokens;
          em.output_tokens += m.output_tokens;
          em.cache_read_tokens += m.cache_read_tokens;
          em.cost += m.cost;
        } else {
          existing.models.set(m.model, { ...m });
        }
      }
      allDays.set(day.date, existing);
    }
  }

  const sortedDays = Array.from(allDays.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  const totalCost = sortedDays.reduce((sum, [, d]) => sum + d.cost, 0);
  const todayCost = sortedDays.length > 0 ? sortedDays[0][1].cost : 0;

  if (loading) return null;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <span
          style={{
            fontFamily: INTER,
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "rgba(0,0,0,0.35)",
          }}
        >
          API Costs
        </span>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div
          style={{
            background: todayCost > 10 ? "rgba(220,20,60,0.06)" : "#FFFFFF",
            borderRadius: 14,
            padding: "20px 24px",
            borderLeft: todayCost > 10 ? `4px solid ${CRIMSON}` : "4px solid #22C55E",
          }}
        >
          <div style={{ fontFamily: INTER, fontSize: 12, color: "rgba(0,0,0,0.4)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Today
          </div>
          <div style={{ fontFamily: PLAYFAIR, fontSize: 28, color: todayCost > 10 ? CRIMSON : "#1A1A1A" }}>
            {formatCost(todayCost)}
          </div>
        </div>
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 14,
            padding: "20px 24px",
            borderLeft: "4px solid rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ fontFamily: INTER, fontSize: 12, color: "rgba(0,0,0,0.4)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            7-Day Total
          </div>
          <div style={{ fontFamily: PLAYFAIR, fontSize: 28, color: "#1A1A1A" }}>
            {formatCost(totalCost)}
          </div>
        </div>
      </div>

      {/* Daily breakdown */}
      <div style={{ background: "#FFFFFF", borderRadius: 14, padding: "8px 0" }}>
        {sortedDays.map(([date, day], i) => (
          <div
            key={date}
            style={{
              padding: "14px 24px",
              borderBottom: i < sortedDays.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontFamily: INTER, fontSize: 14, fontWeight: 600, color: "#1A1A1A" }}>
                {new Date(date + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
              </span>
              <span style={{
                fontFamily: INTER,
                fontSize: 15,
                fontWeight: 700,
                color: day.cost > 10 ? CRIMSON : "rgba(0,0,0,0.6)",
              }}>
                {formatCost(day.cost)}
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Array.from(day.models.values()).map((m) => (
                <span
                  key={m.model}
                  style={{
                    fontFamily: INTER,
                    fontSize: 12,
                    color: "rgba(0,0,0,0.4)",
                  }}
                >
                  {m.model.replace("claude-", "")} · {m.sessions}s · {formatTokens(m.output_tokens)} out · {formatCost(m.cost)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Last updated */}
      {reports.length > 0 && (
        <div style={{ fontFamily: INTER, fontSize: 11, color: "rgba(0,0,0,0.25)", marginTop: 8, textAlign: "right" }}>
          Updated: {new Date(reports[0].created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
        </div>
      )}
    </div>
  );
}
