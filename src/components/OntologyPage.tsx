"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { SavySiteHeader } from "@/components/SavySiteHeader";
import { OntologyNetwork } from "@/components/OntologyNetwork";
import type { CorrelationPair, CategoryStats } from "@/lib/types";

const CRIMSON = "#DC143C";

interface AnalysisRow {
  correlations: CorrelationPair[];
  category_stats: CategoryStats[];
}

export default function OntologyPage() {
  const [correlations, setCorrelations] = useState<CorrelationPair[]>([]);
  const [lagged, setLagged] = useState<CorrelationPair[]>([]);
  const [stats, setStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const supabase = getSupabase();
        const { data, error: fetchErr } = await supabase
          .from("correlation_analyses")
          .select("correlations, category_stats")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (fetchErr) throw fetchErr;

        const row = data as AnalysisRow;
        const instant = row.correlations.filter((c) => c.lag === 0);
        const laggedPairs = row.correlations.filter((c) => c.lag !== 0);
        setCorrelations(instant);
        setLagged(laggedPairs);
        setStats(row.category_stats);
      } catch (e) {
        const msg = e instanceof Error ? e.message : (typeof e === "object" && e !== null && "message" in e) ? String((e as { message: string }).message) : String(e);
        if (msg.includes("rows returned")) {
          setError("No correlation data yet. Run a correlation analysis in Understood.app first.");
        } else {
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A" }}>
      <SavySiteHeader />
      <div style={{ background: "#F5F0E8", minHeight: "calc(100vh - 60px)" }}>
        <div style={{ padding: "40px 24px 16px", maxWidth: 720, margin: "0 auto" }}>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: CRIMSON,
            }}
          >
            ONTOLOGY
          </span>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(32px, 7vw, 44px)",
              fontWeight: 400,
              fontStyle: "italic",
              color: "#1A1A1A",
              lineHeight: 1.15,
              margin: "8px 0 0 0",
            }}
          >
            Adam&rsquo;s Ontology
          </h1>
        </div>

        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 16px 40px" }}>
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              padding: "24px 16px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            {loading && (
              <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(0,0,0,0.3)", fontFamily: "'Inter', sans-serif", fontSize: 14 }}>
                Loading network...
              </div>
            )}
            {error && (
              <div style={{ textAlign: "center", padding: "80px 0", color: CRIMSON, fontFamily: "'Inter', sans-serif", fontSize: 14 }}>
                {error}
              </div>
            )}
            {!loading && !error && stats.length > 0 && (
              <OntologyNetwork correlations={correlations} lagged={lagged} stats={stats} />
            )}
            {!loading && !error && stats.length === 0 && (
              <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(0,0,0,0.3)", fontFamily: "'Inter', sans-serif", fontSize: 14 }}>
                No ontology data yet. Run a correlation analysis in Understood.app first.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
