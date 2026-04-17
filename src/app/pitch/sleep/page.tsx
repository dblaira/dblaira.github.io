"use client";

import { useState } from "react";
import Link from "next/link";
import { SavyMobileMenu } from "@/components/SavyMobileMenu";
import { useAuth } from "@/lib/useAuth";

const BG = "#000000";
const BG_BROWN = "#E8E2D8";
const BG_WHITE = "#FFFFFF";
const INK = "#F5F0E8";
const INK_DARK = "#1A1A1A";
const SURFACE = "rgba(255,255,255,0.04)";
const SURFACE_BORDER = "rgba(255,255,255,0.08)";
const CRIMSON = "#DC143C";
const CRIMSON_DARK = "#B01030";
const MUTED = "rgba(255,255,255,0.55)";
const MUTED_SOFT = "rgba(255,255,255,0.4)";
const INK_MUTED_LIGHT = "rgba(0,0,0,0.55)";
const INK_MUTED_SOFT = "rgba(0,0,0,0.42)";
const BORDER_LIGHT = "rgba(0,0,0,0.08)";

const FONT_SERIF = "'Playfair Display', Georgia, serif";
const FONT_SANS = "'Inter', -apple-system, sans-serif";

type Night = {
  date: string;
  score: number;
  label: string;
  note: string;
};

const SLEEP_RATINGS = [
  { score: 10, label: "Perfect",       desc: "Peak sleep. Fully restored, sharp, energized." },
  { score: 9,  label: "Excellent",     desc: "Slept through, woke up feeling strong." },
  { score: 8,  label: "Very Good",     desc: "Deep sleep, well rested, minor nothing." },
  { score: 7,  label: "Good",          desc: "Solid sleep. Woke once maybe, still recovered." },
  { score: 6,  label: "Decent",        desc: "Mostly solid. Minor disruption or early wake." },
  { score: 5,  label: "Average",       desc: "Slept but not deeply. Functional." },
  { score: 4,  label: "Below Average", desc: "Light sleep, some disruption, a bit flat." },
  { score: 3,  label: "Poor",          desc: "Restless. Under 5 hours or broken throughout." },
  { score: 2,  label: "Very Poor",     desc: "Multiple wake-ups. Unrefreshed." },
  { score: 1,  label: "Terrible",      desc: "Barely slept. Noticeable impairment." },
];

function ratingFor(score: number): { label: string; desc: string } {
  const r = SLEEP_RATINGS.find((x) => x.score === score);
  return { label: r?.label ?? "", desc: r?.desc ?? "" };
}

const DEMO_SCORES: { date: string; score: number }[] = [
  { date: "2026-04-03", score: 3 },
  { date: "2026-04-04", score: 3 },
  { date: "2026-04-05", score: 4 },
  { date: "2026-04-06", score: 5 },
  { date: "2026-04-07", score: 5 },
  { date: "2026-04-08", score: 6 },
  { date: "2026-04-09", score: 6 },
  { date: "2026-04-10", score: 6 },
  { date: "2026-04-11", score: 7 },
  { date: "2026-04-12", score: 7 },
  { date: "2026-04-13", score: 8 },
  { date: "2026-04-14", score: 7 },
  { date: "2026-04-15", score: 7 },
  { date: "2026-04-16", score: 8 },
];

const DEMO_NIGHTS: Night[] = DEMO_SCORES.map((n) => {
  const r = ratingFor(n.score);
  return { date: n.date, score: n.score, label: r.label, note: r.desc };
});

const STATS = {
  streak: 14,
  weekAvg: 7.1,
  sinceLow: 5.0,
  lastNight: 8,
  lastLabel: "Very Good",
};

type Range = "week" | "month" | "year";

function formatLongDate(iso: string): string {
  return new Date(iso + "T12:00:00")
    .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    .toUpperCase();
}

function formatShortDate(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function FacadeHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  return (
    <>
      <div
        style={{
          background: BG,
          paddingTop: "env(safe-area-inset-top, 0px)",
          borderBottom: `1px solid ${SURFACE_BORDER}`,
        }}
      >
        <div
          style={{
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: FONT_SERIF,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: INK,
              lineHeight: 1,
              textDecoration: "none",
            }}
          >
            SAVY.
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <span aria-hidden style={{ color: INK, display: "inline-flex" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16.5" y2="16.5" />
              </svg>
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                color: INK,
                display: "inline-flex",
                cursor: "pointer",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <SavyMobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} user={user} onSignOut={signOut} />
    </>
  );
}

function MiniDonut({ score }: { score: number }) {
  const size = 120;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = (score / 10) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={CRIMSON}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${progress} ${c - progress}`}
        strokeDashoffset={c * 0.25}
      />
      <text
        x={size / 2}
        y={size / 2 + 12}
        textAnchor="middle"
        style={{ fontFamily: FONT_SERIF, fontSize: 36, fontWeight: 400, fill: INK_DARK }}
      >
        {score}
      </text>
    </svg>
  );
}

function ComebackAreaChart({ data }: { data: Night[] }) {
  const width = 640;
  const height = 180;
  const padX = 24;
  const padTop = 18;
  const padBottom = 30;
  const chartW = width - padX * 2;
  const chartH = height - padTop - padBottom;

  const points = data.map((d, i) => ({
    x: padX + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW),
    y: padTop + chartH - (d.score / 10) * chartH,
    score: d.score,
    date: d.date,
  }));

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${points[points.length - 1].x} ${padTop + chartH} L ${points[0].x} ${padTop + chartH} Z`;
  const grid = [2, 4, 6, 8, 10].map((v) => padTop + chartH - (v / 10) * chartH);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id="comeback" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={CRIMSON} stopOpacity="0.42" />
          <stop offset="100%" stopColor={CRIMSON} stopOpacity="0" />
        </linearGradient>
      </defs>
      {grid.map((y, i) => (
        <line key={i} x1={padX} y1={y} x2={width - padX} y2={y} stroke="rgba(0,0,0,0.07)" strokeWidth={1} />
      ))}
      <path d={area} fill="url(#comeback)" />
      <path d={line} fill="none" stroke={CRIMSON} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => {
        const isEnd = i === points.length - 1;
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={isEnd ? 5 : 3} fill={isEnd ? CRIMSON : BG_WHITE} stroke={CRIMSON} strokeWidth={2} />
          </g>
        );
      })}
      <text
        x={points[0].x}
        y={points[0].y - 10}
        textAnchor="start"
        style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, fill: INK_MUTED_LIGHT, letterSpacing: "0.08em" }}
      >
        {points[0].score}
      </text>
      <text
        x={points[points.length - 1].x}
        y={points[points.length - 1].y - 12}
        textAnchor="end"
        style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 700, fill: CRIMSON, letterSpacing: "0.08em" }}
      >
        {points[points.length - 1].score}
      </text>
    </svg>
  );
}

function LogSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [score, setScore] = useState(9);
  const [logged, setLogged] = useState(false);

  function handleLog() {
    setLogged(true);
    setTimeout(() => {
      setLogged(false);
      onClose();
    }, 1200);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      <div
        onClick={onClose}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(6px)",
        }}
      />
      <div
        style={{
          position: "relative",
          background: "#121212",
          borderTop: `1px solid ${SURFACE_BORDER}`,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: "24px 24px calc(32px + env(safe-area-inset-bottom, 0px))",
          boxShadow: "0 -24px 60px rgba(0,0,0,0.5)",
          transform: "translateY(0)",
          animation: "sheetSlide 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
      >
        <style>{`
          @keyframes sheetSlide { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        `}</style>
        <div style={{ width: 42, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.14)", margin: "0 auto 18px" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <span
            style={{
              fontFamily: FONT_SANS,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: CRIMSON,
            }}
          >
            Log a Night
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "transparent",
              border: "none",
              color: MUTED,
              fontFamily: FONT_SANS,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>

        <h2
          style={{
            fontFamily: FONT_SERIF,
            fontSize: 32,
            fontWeight: 400,
            color: INK,
            lineHeight: 1.1,
            margin: "0 0 20px",
          }}
        >
          How did you sleep?
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span
              style={{
                fontFamily: FONT_SANS,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: MUTED,
              }}
            >
              Date
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                fontFamily: FONT_SANS,
                fontSize: 15,
                padding: "12px 14px",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${SURFACE_BORDER}`,
                borderRadius: 10,
                color: INK,
                colorScheme: "dark",
                outline: "none",
              }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span
              style={{
                fontFamily: FONT_SANS,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: MUTED,
              }}
            >
              Score
            </span>
            <select
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              style={{
                fontFamily: FONT_SANS,
                fontSize: 15,
                padding: "12px 14px",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${SURFACE_BORDER}`,
                borderRadius: 10,
                color: INK,
                appearance: "none",
                outline: "none",
              }}
            >
              {SLEEP_RATINGS.map((r) => (
                <option key={r.score} value={r.score} style={{ background: "#121212", color: INK }}>
                  {r.score} — {r.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="button"
          onClick={handleLog}
          disabled={logged}
          style={{
            width: "100%",
            marginTop: 22,
            padding: "14px 18px",
            background: logged ? "rgba(255,255,255,0.08)" : CRIMSON,
            color: INK,
            border: "none",
            borderRadius: 999,
            fontFamily: FONT_SANS,
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.04em",
            cursor: logged ? "default" : "pointer",
            transition: "background 0.2s ease",
          }}
        >
          {logged ? "✓ Logged" : "Log Night"}
        </button>
      </div>
    </div>
  );
}

export default function PitchSleepPage() {
  const [range, setRange] = useState<Range>("week");
  const [sheetOpen, setSheetOpen] = useState(false);

  const latest = DEMO_NIGHTS[DEMO_NIGHTS.length - 1];
  const recent4 = [...DEMO_NIGHTS].slice(-4).reverse();

  function rangeCopy(): { streakLabel: string; avgLabel: string; liftLabel: string } {
    if (range === "month") return { streakLabel: "Night Streak", avgLabel: "30-Day Avg", liftLabel: "Since Low" };
    if (range === "year") return { streakLabel: "Best Streak", avgLabel: "Year Avg", liftLabel: "Full Recovery" };
    return { streakLabel: "Night Streak", avgLabel: "7-Day Avg", liftLabel: "Since Low" };
  }
  const labels = rangeCopy();

  return (
    <div style={{ minHeight: "100vh", background: BG_WHITE }}>
      <FacadeHeader />

      {/* ================= BLACK BAND: hero + stats ================= */}
      <div style={{ background: BG, color: INK }}>

      {/* HERO */}
      <section className="content-width" style={{ padding: "28px 24px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <span
            style={{
              fontFamily: FONT_SANS,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: CRIMSON,
            }}
          >
            Last Night
          </span>
          <span
            style={{
              fontFamily: FONT_SANS,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: MUTED_SOFT,
            }}
          >
            {formatLongDate(latest.date)}
          </span>
        </div>

        <h1
          style={{
            fontFamily: FONT_SERIF,
            fontSize: "clamp(44px, 10vw, 88px)",
            fontWeight: 400,
            lineHeight: 0.98,
            letterSpacing: "-0.01em",
            color: INK,
            margin: "0 0 20px",
          }}
        >
          The Quiet Climb
        </h1>

        <p
          style={{
            fontFamily: FONT_SANS,
            fontSize: 15,
            lineHeight: 1.55,
            color: INK,
            margin: "0 0 22px",
          }}
        >
          Score: <strong style={{ fontWeight: 600 }}>{latest.score}</strong> ·{" "}
          <span style={{ color: CRIMSON, fontWeight: 600 }}>{latest.label}</span>
        </p>

        <a
          href="#report"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: CRIMSON,
            color: INK,
            padding: "12px 18px",
            borderRadius: 6,
            fontFamily: FONT_SANS,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.02em",
            textDecoration: "none",
            boxShadow: "0 8px 24px rgba(220,20,60,0.25)",
          }}
        >
          View Full Report
          <span aria-hidden>→</span>
        </a>
      </section>

      {/* STAT STRIP */}
      <section
        className="content-width"
        style={{ padding: "24px 24px 12px", borderTop: `1px solid ${SURFACE_BORDER}`, marginTop: 28 }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 0,
          }}
        >
          {[
            { value: String(STATS.streak), label: labels.streakLabel },
            { value: STATS.weekAvg.toFixed(1), label: labels.avgLabel },
            { value: `+${STATS.sinceLow.toFixed(1)}`, label: labels.liftLabel },
          ].map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: "18px 16px 22px",
                borderLeft: i === 0 ? "none" : `1px solid ${SURFACE_BORDER}`,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <span
                style={{
                  fontFamily: FONT_SERIF,
                  fontSize: "clamp(36px, 9vw, 56px)",
                  fontWeight: 400,
                  lineHeight: 1,
                  color: INK,
                  letterSpacing: "-0.02em",
                }}
              >
                {s.value}
              </span>
              <span
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: MUTED,
                }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      </div>
      {/* ================= END BLACK BAND ================= */}

      {/* ================= BROWN BAND: trend chart ================= */}
      <div style={{ background: BG_BROWN, color: INK_DARK }}>

      {/* TREND CHART */}
      <section id="report" className="content-width" style={{ padding: "36px 24px 40px" }}>
        <div
          style={{
            background: BG_WHITE,
            borderRadius: 16,
            padding: "20px 20px 16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span
              style={{
                fontFamily: FONT_SANS,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: CRIMSON,
              }}
            >
              The Comeback
            </span>
            <span
              style={{
                fontFamily: FONT_SANS,
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: INK_MUTED_SOFT,
              }}
            >
              14 Nights
            </span>
          </div>
          <ComebackAreaChart data={DEMO_NIGHTS} />
          <div
            style={{
              marginTop: 6,
              display: "flex",
              justifyContent: "space-between",
              fontFamily: FONT_SANS,
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: INK_MUTED_SOFT,
            }}
          >
            <span>{formatShortDate(DEMO_NIGHTS[0].date)}</span>
            <span>{formatShortDate(DEMO_NIGHTS[DEMO_NIGHTS.length - 1].date)}</span>
          </div>
        </div>
      </section>

      </div>
      {/* ================= END BROWN BAND ================= */}

      {/* ================= WHITE BAND: nights + range + quote ================= */}
      <div style={{ background: BG_WHITE, color: INK_DARK }}>

      {/* LATEST NIGHTS */}
      <section className="content-width" style={{ padding: "40px 24px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span
            style={{
              fontFamily: FONT_SANS,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: INK_DARK,
            }}
          >
            Latest Nights
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 16,
          }}
        >
          {recent4.map((n) => (
            <article
              key={n.date}
              style={{
                background: BG_WHITE,
                border: `1px solid ${BORDER_LIGHT}`,
                borderRadius: 14,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  background: BG_BROWN,
                  aspectRatio: "1 / 1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderBottom: `1px solid ${BORDER_LIGHT}`,
                }}
              >
                <MiniDonut score={n.score} />
              </div>
              <div style={{ padding: "14px 14px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                <span
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: CRIMSON,
                  }}
                >
                  {n.label}
                </span>
                <h3
                  style={{
                    fontFamily: FONT_SERIF,
                    fontSize: 20,
                    fontWeight: 400,
                    lineHeight: 1.15,
                    color: INK_DARK,
                    margin: 0,
                  }}
                >
                  {n.note}
                </h3>
                <span
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 12,
                    color: INK_MUTED_SOFT,
                    marginTop: 4,
                  }}
                >
                  {formatShortDate(n.date)}, 2026
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* BY RANGE */}
      <section className="content-width" style={{ padding: "28px 24px 12px" }}>
        <span
          style={{
            fontFamily: FONT_SANS,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: INK_DARK,
            display: "block",
            marginBottom: 12,
          }}
        >
          By Range
        </span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(
            [
              { id: "week", label: "This Week" },
              { id: "month", label: "This Month" },
              { id: "year", label: "This Year" },
            ] as { id: Range; label: string }[]
          ).map((r) => {
            const active = r.id === range;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRange(r.id)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 999,
                  border: active ? `1px solid ${CRIMSON}` : `1px solid rgba(0,0,0,0.14)`,
                  background: active ? CRIMSON : "transparent",
                  color: active ? "#FFFFFF" : INK_MUTED_LIGHT,
                  fontFamily: FONT_SANS,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                }}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Trailing spacer so the FAB doesn't overlap the last row of cards / pills */}
      <div style={{ height: 120 }} />

      </div>
      {/* ================= END WHITE BAND ================= */}

      {/* FAB */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        aria-label="Log a night"
        style={{
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: CRIMSON,
          color: INK,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 12px 32px rgba(220,20,60,0.45), 0 0 0 1px rgba(255,255,255,0.06) inset",
          zIndex: 40,
          transition: "transform 0.18s ease, background 0.18s ease",
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = "translateX(-50%) scale(0.96)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "translateX(-50%) scale(1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(-50%) scale(1)")}
        onFocus={(e) => (e.currentTarget.style.background = CRIMSON_DARK)}
        onBlur={(e) => (e.currentTarget.style.background = CRIMSON)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <LogSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
