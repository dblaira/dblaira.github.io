"use client";

import { useState, useEffect } from "react";
import { SavySiteHeader } from "@/components/SavySiteHeader";
import { OntologyNetwork } from "@/components/OntologyNetwork";
import { useTheme } from "@/lib/useTheme";
import { EditModeProvider } from "@/lib/useEditMode";
import { EditColorSheet } from "@/components/EditColorSheet";
import { EditToast } from "@/components/EditToast";
import { usePageEditing } from "@/lib/usePageEditing";
import { Editable } from "@/components/Editable";
import { fillStyle } from "@/lib/fills";
import type { CorrelationPair, CategoryStats } from "@/lib/types";

const CRIMSON = "#DC143C";
const DEFAULT_NETWORK_CARD = "#FFFFFF";

interface AnalysisRow {
  correlations: CorrelationPair[];
  category_stats: CategoryStats[];
}

function splitCorrelationPairs(pairs: CorrelationPair[]): { instant: CorrelationPair[]; lagged: CorrelationPair[] } {
  const lagged = pairs.filter((c) => c.lag !== 0 || c.type === "leading");
  const instant = pairs.filter((c) => c.lag === 0 && c.type !== "leading");
  return { instant, lagged };
}

export default function OntologyPage() {
  return (
    <EditModeProvider>
      <OntologyPageBody />
      <EditColorSheet />
      <EditToast />
    </EditModeProvider>
  );
}

function OntologyPageBody() {
  const theme = useTheme("/ontology");
  const { colorFor, fillFor, saveOverride } = usePageEditing("/ontology");
  const [correlations, setCorrelations] = useState<CorrelationPair[]>([]);
  const [lagged, setLagged] = useState<CorrelationPair[]>([]);
  const [stats, setStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const res = await fetch(
          `${url}/rest/v1/correlation_analyses?select=correlations,category_stats&order=created_at.desc&limit=8`,
          {
            headers: {
              apikey: key,
              Authorization: `Bearer ${key}`
            },
          }
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || `HTTP ${res.status}`);
        }
        const rows = (await res.json()) as AnalysisRow[];
        if (!Array.isArray(rows) || rows.length === 0) {
          throw new Error("No correlation analyses found.");
        }

        // Prefer the most recent run that includes predictive/lagged links.
        let row = rows[0];
        let split = splitCorrelationPairs(row.correlations ?? []);
        if (split.lagged.length === 0) {
          for (const candidate of rows.slice(1)) {
            const candidateSplit = splitCorrelationPairs(candidate.correlations ?? []);
            if (candidateSplit.lagged.length > 0) {
              row = candidate;
              split = candidateSplit;
              break;
            }
          }
        }

        setCorrelations(split.instant);
        setLagged(split.lagged);
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
      <div style={{ ...fillStyle(fillFor("canvas", theme.canvas), theme.canvas), minHeight: "calc(100vh - 60px)" }}>
        <div className="content-width" style={{ padding: "40px 24px 16px" }}>
          <Editable
            id="ontology-eyebrow"
            label="ONTOLOGY Eyebrow"
            description="The small crimson 'ONTOLOGY' label above the title."
            value={colorFor("ontology-eyebrow", CRIMSON)}
            onChange={(v) => saveOverride("ontology-eyebrow", "ONTOLOGY Eyebrow", v)}
            allowFills={false}
            inline
          >
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: colorFor("ontology-eyebrow", CRIMSON),
              }}
            >
              ONTOLOGY
            </span>
          </Editable>
          <Editable
            id="ontology-headline"
            label="Adam's Ontology Headline"
            description="The big italic title."
            value={colorFor("ontology-headline", theme.ink)}
            onChange={(v) => saveOverride("ontology-headline", "Adam's Ontology Headline", v)}
            allowFills={false}
          >
            <h1
              style={{
                fontFamily: theme.heading_font,
                fontSize: "clamp(32px, 7vw, 44px)",
                fontWeight: 400,
                fontStyle: "italic",
                color: colorFor("ontology-headline", theme.ink),
                lineHeight: 1.15,
                margin: "8px 0 0 0",
              }}
            >
              Adam&rsquo;s Ontology
            </h1>
          </Editable>
        </div>

        <div className="content-width" style={{ padding: "0 16px 40px" }}>
          <Editable
            id="network-card-bg"
            label="Network Card Background"
            description="The card holding the 13-category network graph. The node and edge colors inside are not editable — they encode data meaning."
            value={fillFor("network-card-bg", DEFAULT_NETWORK_CARD)}
            onChange={(v) => saveOverride("network-card-bg", "Network Card Background", v)}
          >
          <div
            style={{
              ...fillStyle(fillFor("network-card-bg", DEFAULT_NETWORK_CARD), DEFAULT_NETWORK_CARD),
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
          </Editable>
        </div>
      </div>
    </div>
  );
}
