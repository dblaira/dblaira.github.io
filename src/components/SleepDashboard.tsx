"use client";

const CRIMSON = "#DC143C";
const CREAM = "#F5F0E8";

interface SleepEntry {
  date: string;
  score: number;
  label: string;
}

// Sleep data — update as new scores come in
const SLEEP_DATA: SleepEntry[] = [
  { date: "2026-03-18", score: 8, label: "Mar 18" },
  { date: "2026-03-19", score: 5, label: "Mar 19" },
  { date: "2026-03-20", score: 7, label: "Mar 20" },
  { date: "2026-03-21", score: 6, label: "Mar 21" },
  { date: "2026-03-22", score: 8, label: "Mar 22" },
];

function DonutChart({ score }: { score: number }) {
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 10) * circumference;
  const color =
    score >= 8 ? "#22C55E" : score >= 6 ? "#F59E0B" : CRIMSON;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference - progress}`}
          strokeDashoffset={circumference * 0.25}
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      {/* Center text */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 48,
            fontWeight: 400,
            color: "#1A1A1A",
            lineHeight: 1,
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(0,0,0,0.35)",
            marginTop: 4,
          }}
        >
          / 10
        </span>
      </div>
    </div>
  );
}

function AreaChart({ data }: { data: SleepEntry[] }) {
  const width = 320;
  const height = 140;
  const padX = 32;
  const padTop = 16;
  const padBottom = 28;
  const chartW = width - padX * 2;
  const chartH = height - padTop - padBottom;

  const points = data.map((d, i) => ({
    x: padX + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW),
    y: padTop + chartH - (d.score / 10) * chartH,
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padTop + chartH} L ${points[0].x} ${padTop + chartH} Z`;

  // Gridlines at 2, 4, 6, 8
  const gridLines = [2, 4, 6, 8].map((v) => padTop + chartH - (v / 10) * chartH);

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block" }}
    >
      {/* Grid lines */}
      {gridLines.map((y, i) => (
        <line
          key={i}
          x1={padX}
          y1={y}
          x2={width - padX}
          y2={y}
          stroke="rgba(0,0,0,0.06)"
          strokeWidth={1}
        />
      ))}

      {/* Area fill */}
      <path d={areaPath} fill={`${CRIMSON}15`} />

      {/* Line */}
      <path d={linePath} fill="none" stroke={CRIMSON} strokeWidth={2.5} strokeLinejoin="round" />

      {/* Data points + labels */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="#FFFFFF" stroke={CRIMSON} strokeWidth={2} />
          <text
            x={p.x}
            y={p.y - 12}
            textAnchor="middle"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              fill: "#1A1A1A",
            }}
          >
            {p.score}
          </text>
          <text
            x={p.x}
            y={height - 6}
            textAnchor="middle"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 10,
              fill: "rgba(0,0,0,0.35)",
            }}
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function SleepDashboard() {
  const today = SLEEP_DATA[SLEEP_DATA.length - 1];
  const avg = (SLEEP_DATA.reduce((s, d) => s + d.score, 0) / SLEEP_DATA.length).toFixed(1);

  return (
    <div style={{ background: CREAM, minHeight: "100vh" }}>
      {/* Nav */}
      <div style={{ background: "#0A0A0A", paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div
          style={{
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            maxWidth: 720,
            margin: "0 auto",
            gap: 12,
          }}
        >
          <a href="/" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 14 }}>
            ← Back
          </a>
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "#FFFFFF",
            }}
          >
            TODIEFOR.
          </span>
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: "40px 24px 24px", maxWidth: 720, margin: "0 auto" }}>
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
          SLEEP
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
          How You Slept
        </h1>
      </div>

      {/* Today's score — donut */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 24px" }}>
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "32px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(0,0,0,0.35)",
            }}
          >
            TODAY — {today.label.toUpperCase()}
          </span>
          <DonutChart score={today.score} />
          <div style={{ display: "flex", gap: 24, marginTop: 8 }}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 24,
                  color: "#1A1A1A",
                }}
              >
                {avg}
              </div>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(0,0,0,0.35)",
                  marginTop: 2,
                }}
              >
                AVG
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 24,
                  color: "#1A1A1A",
                }}
              >
                {SLEEP_DATA.length}
              </div>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(0,0,0,0.35)",
                  marginTop: 2,
                }}
              >
                NIGHTS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Area chart — trend */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 24px" }}>
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "24px 16px",
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(0,0,0,0.35)",
              paddingLeft: 8,
            }}
          >
            TREND
          </span>
          <div style={{ marginTop: 16 }}>
            <AreaChart data={SLEEP_DATA} />
          </div>
        </div>
      </div>

      {/* CHI research note */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 40px" }}>
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "24px",
            display: "flex",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 3,
              background: CRIMSON,
              borderRadius: 2,
              flexShrink: 0,
            }}
          />
          <div>
            <p
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 15,
                fontStyle: "italic",
                color: "#1A1A1A",
                lineHeight: 1.6,
                margin: "0 0 8px 0",
              }}
            >
              &ldquo;Visuals beat text in 7 of 8 sleep insight categories. Area charts work best for weekly trends. Donut charts for single-night scores.&rdquo;
            </p>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                color: "rgba(0,0,0,0.3)",
              }}
            >
              ACM CHI 2022 — Sleep Visualization Research
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
