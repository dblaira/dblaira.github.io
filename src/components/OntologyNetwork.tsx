"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  forceSimulation,
  forceCenter,
  forceManyBody,
  forceCollide,
  forceLink,
  forceX,
  forceY,
  SimulationNodeDatum,
} from "d3-force";
import type { CorrelationPair, CategoryStats } from "@/lib/types";
import { getCategoryColor } from "@/lib/types";

interface NetworkNode extends SimulationNodeDatum {
  id: string;
  category: string;
  totalCount: number;
  radius: number;
  color: string;
}

interface NetworkLink {
  source: string | NetworkNode;
  target: string | NetworkNode;
  coefficient: number;
  type: "positive" | "negative" | "lagged";
  lag?: number;
}

interface OntologyNetworkProps {
  correlations: CorrelationPair[];
  lagged: CorrelationPair[];
  stats: CategoryStats[];
}

export function OntologyNetwork({ correlations, lagged, stats }: OntologyNetworkProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [links, setLinks] = useState<NetworkLink[]>([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [hoveredPair, setHoveredPair] = useState<{ catA: string; catB: string } | null>(null);
  const simulationRef = useRef<ReturnType<typeof forceSimulation<NetworkNode>> | null>(null);

  useEffect(() => {
    const container = svgRef.current?.parentElement;
    if (!container) return;
    const obs = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setDimensions({ width: Math.max(340, width), height: Math.max(350, Math.min(520, width * 0.6)) });
    });
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (stats.length === 0) return;

    const maxCount = Math.max(...stats.map((s) => s.totalCount));
    const minR = 18;
    const maxR = 45;

    const newNodes: NetworkNode[] = stats.map((s) => ({
      id: s.category,
      category: s.category,
      totalCount: s.totalCount,
      radius: minR + (Math.log(s.totalCount + 1) / Math.log(maxCount + 1)) * (maxR - minR),
      color: getCategoryColor(s.category),
    }));

    const newLinks: NetworkLink[] = [];

    for (const c of correlations) {
      newLinks.push({
        source: c.categoryA,
        target: c.categoryB,
        coefficient: c.coefficient,
        type: c.coefficient >= 0 ? "positive" : "negative",
      });
    }

    for (const c of lagged) {
      const exists = newLinks.some((l) => {
        const sId = typeof l.source === "string" ? l.source : l.source.id;
        const tId = typeof l.target === "string" ? l.target : l.target.id;
        return (sId === c.categoryA && tId === c.categoryB) || (sId === c.categoryB && tId === c.categoryA);
      });
      if (!exists) {
        newLinks.push({
          source: c.categoryA,
          target: c.categoryB,
          coefficient: c.coefficient,
          type: "lagged",
          lag: c.lag,
        });
      }
    }

    setNodes(newNodes);
    setLinks(newLinks);
  }, [correlations, lagged, stats]);

  useEffect(() => {
    if (nodes.length === 0 || dimensions.width === 0) return;

    if (simulationRef.current) simulationRef.current.stop();

    const sim = forceSimulation<NetworkNode>(nodes)
      .force("center", forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force("charge", forceManyBody<NetworkNode>().strength(-300))
      .force("collide", forceCollide<NetworkNode>((d) => d.radius + 12).strength(0.8).iterations(3))
      .force(
        "link",
        forceLink<NetworkNode, NetworkLink>(links)
          .id((d) => d.id)
          .distance((d) => 180 - Math.abs(d.coefficient) * 80)
          .strength((d) => Math.abs(d.coefficient) * 0.5)
      )
      .force("x", forceX(dimensions.width / 2).strength(0.05))
      .force("y", forceY(dimensions.height / 2).strength(0.05))
      .alpha(0.8)
      .alphaDecay(0.02)
      .on("tick", () => {
        const pad = 50;
        for (const n of nodes) {
          n.x = Math.max(pad, Math.min(dimensions.width - pad, n.x || 0));
          n.y = Math.max(pad, Math.min(dimensions.height - pad, n.y || 0));
        }
        setNodes([...nodes]);
      });

    simulationRef.current = sim;
    return () => { sim.stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length, links.length, dimensions.width, dimensions.height]);

  const edgeOpacity = useCallback(
    (link: NetworkLink) => {
      const sId = typeof link.source === "string" ? link.source : link.source.id;
      const tId = typeof link.target === "string" ? link.target : link.target.id;
      if (hoveredPair) {
        const match =
          (hoveredPair.catA === sId && hoveredPair.catB === tId) ||
          (hoveredPair.catA === tId && hoveredPair.catB === sId) ||
          hoveredPair.catB === "__ALL__" && (hoveredPair.catA === sId || hoveredPair.catA === tId);
        return match ? 1 : 0.08;
      }
      return 0.15 + Math.abs(link.coefficient) * 0.6;
    },
    [hoveredPair]
  );

  const nodeOpacity = useCallback(
    (node: NetworkNode) => {
      if (!hoveredPair) return 1;
      if (hoveredPair.catB === "__ALL__") return hoveredPair.catA === node.id ? 1 : 0.25;
      return hoveredPair.catA === node.id || hoveredPair.catB === node.id ? 1 : 0.25;
    },
    [hoveredPair]
  );

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} style={{ display: "block" }}>
        <defs>
          <marker id="arrow-lagged" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="8" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 3 L 0 6 z" fill="#F59E0B" opacity="0.7" />
          </marker>
          {/* Filter to recolor black SVG icons to white */}
          <filter id="icon-white">
            <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" />
          </filter>
        </defs>

        {links.map((link, i) => {
          const source = typeof link.source === "string" ? nodes.find((n) => n.id === link.source) : link.source;
          const target = typeof link.target === "string" ? nodes.find((n) => n.id === link.target) : link.target;
          if (!source?.x || !target?.x) return null;

          const strength = Math.abs(link.coefficient);
          const strokeWidth = 1 + strength * 5;
          const color = link.type === "lagged" ? "#F59E0B" : link.type === "positive" ? "#16a34a" : "#DC143C";
          const dashArray = link.type === "lagged" ? "6,4" : "none";
          const sId = typeof link.source === "string" ? link.source : link.source.id;
          const tId = typeof link.target === "string" ? link.target : link.target.id;

          return (
            <line
              key={i}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
              opacity={edgeOpacity(link)}
              style={{ transition: "opacity 200ms", cursor: "pointer" }}
              markerEnd={link.type === "lagged" ? "url(#arrow-lagged)" : undefined}
              onMouseEnter={() => setHoveredPair({ catA: sId, catB: tId })}
              onMouseLeave={() => setHoveredPair(null)}
            />
          );
        })}

        {nodes.map((node) => {
          if (!node.x || !node.y) return null;
          const iconSize = node.radius * 1.1;
          const fontSize = Math.max(7, Math.min(10, node.radius * 0.32));

          return (
            <g
              key={node.id}
              opacity={nodeOpacity(node)}
              style={{ transition: "opacity 200ms", cursor: "pointer" }}
              onMouseEnter={() => setHoveredPair({ catA: node.id, catB: "__ALL__" })}
              onMouseLeave={() => setHoveredPair(null)}
            >
              <circle cx={node.x} cy={node.y} r={node.radius} fill={node.color} opacity={0.85} />
              <image
                href={`/icons/ontology/${node.category}.svg`}
                x={node.x - iconSize / 2}
                y={node.y - iconSize / 2 - (node.radius > 24 ? 2 : 0)}
                width={iconSize}
                height={iconSize}
                filter="url(#icon-white)"
                opacity={0.95}
                style={{ pointerEvents: "none" }}
              />
              {node.radius > 24 && (
                <text
                  x={node.x}
                  y={node.y + node.radius - fontSize + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="rgba(255,255,255,0.8)"
                  fontFamily="'Inter', sans-serif"
                  fontWeight={600}
                  fontSize={fontSize}
                  letterSpacing="0.03em"
                  style={{ textTransform: "uppercase", pointerEvents: "none" }}
                >
                  {node.category.length > 9 ? node.category.slice(0, 8) + "." : node.category}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginTop: "0.75rem", flexWrap: "wrap" }}>
        {[
          { color: "#16a34a", label: "Rise together" },
          { color: "#DC143C", label: "Trade off" },
          { color: "#F59E0B", label: "Predicts (lagged)", dashed: true },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <div
              style={{
                width: 24,
                height: 3,
                background: item.color,
                borderTop: item.dashed ? `1px dashed ${item.color}` : undefined,
              }}
            />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "rgba(0,0,0,0.4)" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
