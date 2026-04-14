"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";

const MarkmapView = dynamic(() => import("@/components/MarkmapView"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <span style={{ color: "#666", fontSize: 14 }}>Rendering map…</span>
    </div>
  ),
});

interface MarkmapRecord {
  id: string;
  markdown: string;
  title: string;
  source: string;
  created_at: string;
}

const POLL_INTERVAL = 15000;

export default function AgentsPage() {
  const [record, setRecord] = useState<MarkmapRecord | null>(null);
  const [lastId, setLastId] = useState<string | null>(null);
  const [pulse, setPulse] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLatest = useCallback(async () => {
    try {
      const res = await fetch("/api/markmap", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: MarkmapRecord = await res.json();
      if (data.id !== lastId) {
        setRecord(data);
        setLastId(data.id);
        setPulse(true);
        setTimeout(() => setPulse(false), 800);
      }
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "fetch failed");
    }
  }, [lastId]);

  useEffect(() => {
    fetchLatest();
    const id = setInterval(fetchLatest, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchLatest]);

  const ago = (iso: string) => {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div style={{
      background: "#0a0a0a",
      color: "#e5e5e5",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      fontFamily: "Inter, system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 20px",
        borderBottom: "1px solid #1f1f1f",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexShrink: 0,
      }}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: pulse ? "#22c55e" : error ? "#ef4444" : "#3b82f6",
          boxShadow: pulse ? "0 0 8px #22c55e" : error ? "0 0 8px #ef4444" : "none",
          transition: "all 0.3s",
        }} />
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", color: "#a3a3a3" }}>
          SPARK AGENTS
        </span>
        {record && (
          <>
            <span style={{ color: "#404040", fontSize: 13 }}>·</span>
            <span style={{ fontSize: 13, color: "#737373" }}>{record.title}</span>
            <span style={{ color: "#404040", fontSize: 13 }}>·</span>
            <span style={{ fontSize: 12, color: "#525252" }}>{ago(record.created_at)}</span>
          </>
        )}
        {error && (
          <span style={{ fontSize: 12, color: "#ef4444", marginLeft: "auto" }}>
            ⚠ {error}
          </span>
        )}
        <span style={{
          marginLeft: "auto",
          fontSize: 11,
          color: "#404040",
          fontVariantNumeric: "tabular-nums",
        }}>
          polls every 15s
        </span>
      </div>

      {/* Map */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {record ? (
          <MarkmapView key={record.id} markdown={record.markdown} />
        ) : !error ? (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#525252",
            fontSize: 14,
          }}>
            Waiting for first spark…
          </div>
        ) : (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#ef4444",
            fontSize: 14,
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
