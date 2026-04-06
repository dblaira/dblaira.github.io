"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Transformer } from "markmap-lib";
import { Markmap } from "markmap-view";

const CRIMSON = "#DC143C";

const DEFAULT_MD = `# Savy
## Waiting for first outline...
- Push markdown via POST /api/markmap
- \`{ "markdown": "# Title\\n## Branch\\n- leaf" }\``;

export default function MarkmapViewer() {
  const svgRef = useRef<SVGSVGElement>(null);
  const mmRef = useRef<Markmap | null>(null);
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MD);
  const [title, setTitle] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLatest = useCallback(async () => {
    try {
      const res = await fetch("/api/markmap?source=savy");
      const json = await res.json();
      if (json.data?.markdown) {
        setMarkdown(json.data.markdown);
        setTitle(json.data.title);
        setUpdatedAt(json.data.updated_at);
      }
    } catch {
      // silent — keep current content
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + poll every 15s
  useEffect(() => {
    fetchLatest();
    const interval = setInterval(fetchLatest, 15_000);
    return () => clearInterval(interval);
  }, [fetchLatest]);

  // Render / re-render markmap when markdown changes
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const transformer = new Transformer();
    const { root } = transformer.transform(markdown);

    if (!mmRef.current) {
      mmRef.current = Markmap.create(svg, {
        color: () => CRIMSON,
        duration: 300,
        maxWidth: 240,
        paddingX: 16,
      });
    }

    mmRef.current.setData(root);
    mmRef.current.fit();
  }, [markdown]);

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px 8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>🦊</span>
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 16,
              fontWeight: 400,
              color: "#1A1A1A",
            }}
          >
            {title ?? "Savy Mind Map"}
          </span>
        </div>
        {updatedAt && (
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 10,
              color: "rgba(0,0,0,0.3)",
            }}
          >
            {new Date(updatedAt).toLocaleString()}
          </span>
        )}
      </div>

      {/* SVG container */}
      <div style={{ height: 400, position: "relative" }}>
        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: "rgba(0,0,0,0.3)",
            }}
          >
            Loading...
          </div>
        )}
        <svg
          ref={svgRef}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
