"use client";

import { BeliefCarousel } from "@/components/BeliefCarousel";
import { usePageEditing } from "@/lib/usePageEditing";
import { useEditMode } from "@/lib/useEditMode";
import { Editable } from "@/components/Editable";
import { fillStyle } from "@/lib/fills";

const CRIMSON = "#DC143C";

// Built-in fallbacks for every editable role on the home page. If Studio
// supplies an accent or a per-element override, those win.
const DEFAULT_CANVAS        = "#F5F0E8";
const DEFAULT_INK           = "#1A1A1A";
const DEFAULT_TITLE         = CRIMSON;
const DEFAULT_CARD          = "#FFFFFF";
const DEFAULT_SECTION_STRIP = "rgba(0,0,0,0.03)";

interface ExperimentCard {
  label: string;
  title: string;
  desc: string;
  status: "live" | "building" | "planned";
  href?: string;
}

const EXPERIMENTS: ExperimentCard[] = [
  {
    label: "NUTRITION",
    title: "Macro Tracker",
    desc: "Every ounce, every macro. Barcode scanning, rotation library, meal history with re-log. Built to replace MFP.",
    status: "live",
    href: "/nutrition",
  },
  {
    label: "SLEEP",
    title: "Sleep Dashboard",
    desc: "Daily score tracking with donut + area chart visualizations. ACM CHI research-backed design.",
    status: "live",
    href: "/sleep",
  },
  {
    label: "MOOD",
    title: "Emotion Check-in",
    desc: "Tap the wheel. Tag the trigger. Track how you feel over time.",
    status: "live",
    href: "/mood",
  },
  {
    label: "ONTOLOGY",
    title: "Adam's Ontology",
    desc: "How 13 life categories connect. Pearson correlations across 92 weeks of data.",
    status: "live",
    href: "/ontology",
  },
  {
    label: "BELIEFS",
    title: "Belief Library",
    desc: "Your personal connections — identity anchors, pattern interrupts, validated principles.",
    status: "live",
    href: "/beliefs",
  },
  {
    label: "PARABLES",
    title: "Field Essays",
    desc: "Patterns that trace back before modern society\nand still apply today.",
    status: "live",
    href: "/parables",
  },
  {
    label: "STUDIO",
    title: "Design Studio",
    desc: "Live theme editor for every room. Canvas, accents, fonts, component kind. Add, delete, rearrange features.",
    status: "live",
    href: "/studio",
  },
];

// QUOTE removed — replaced by live BeliefCarousel component

function StatusDot({ status }: { status: ExperimentCard["status"] }) {
  const color =
    status === "live"
      ? "#22C55E"
      : status === "building"
      ? CRIMSON
      : "rgba(0,0,0,0.2)";
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        marginRight: 8,
        flexShrink: 0,
      }}
    />
  );
}

export default function SandboxHome() {
  const { theme, colorFor, fillFor, saveOverride } = usePageEditing("/");

  const canvas   = theme.canvas || DEFAULT_CANVAS;
  const ink      = theme.accents[0] ?? DEFAULT_INK;
  const titleC   = theme.accents[1] ?? DEFAULT_TITLE;
  const cardBg   = theme.accents[2] ?? DEFAULT_CARD;
  const stripBg  = theme.accents[3] ?? DEFAULT_SECTION_STRIP;

  return (
    <div style={{ minHeight: "100vh", ...fillStyle(fillFor("canvas", canvas), canvas) }}>
      <HomeEditPencil />
      <HomePageToolbar
        canvasValue={fillFor("canvas", canvas)}
        canvasFallback={canvas}
        onSaveCanvas={(v) => saveOverride("canvas", "Page Background", v)}
      />
      <div>

      {/* Hero section */}
      <div
        className="content-width"
        style={{
          padding: "40px 24px 28px",
        }}
      >
        <Editable
          id="home-title"
          label="SAVY Title"
          description="The big italic SAVY title at the top."
          value={colorFor("home-title", titleC)}
          onChange={(v) => saveOverride("home-title", "SAVY Title", v)}
          allowFills={false}
        >
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(42px, 8vw, 58px)",
              fontWeight: 400,
              fontStyle: "italic",
              color: colorFor("home-title", titleC),
              lineHeight: 1.1,
              margin: "0 0 8px 0",
            }}
          >
            SAVY
          </h1>
        </Editable>
        <Editable
          id="home-subtitle"
          label="Subtitle"
          description="The small 'EXPERIMENTS IN PROGRESS' line under the SAVY title."
          value={colorFor("home-subtitle", "rgba(0,0,0,0.4)")}
          onChange={(v) => saveOverride("home-subtitle", "Subtitle", v)}
          allowFills={false}
        >
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: colorFor("home-subtitle", "rgba(0,0,0,0.4)"),
              margin: 0,
            }}
          >
            EXPERIMENTS IN PROGRESS
          </p>
        </Editable>
      </div>

      {/* Beliefs carousel */}
      <div
        className="content-width"
        style={{
          padding: "0 24px 32px",
        }}
      >
        <Editable
          id="carousel-card-bg"
          label="Belief Card Background"
          description="The white card surrounding the rotating belief quote."
          value={fillFor("carousel-card-bg", cardBg)}
          onChange={(v) => saveOverride("carousel-card-bg", "Belief Card Background", v)}
        >
          <div
            style={{
              ...fillStyle(fillFor("carousel-card-bg", cardBg), cardBg),
              borderRadius: 12,
              padding: "32px 28px 24px",
            }}
          >
            <BeliefCarousel />
          </div>
        </Editable>
      </div>

      {/* Section header */}
      <Editable
        id="section-strip-bg"
        label="Section Strip Background"
        description="The thin gray band behind the 'LATEST EXPERIMENTS' header."
        value={fillFor("section-strip-bg", stripBg)}
        onChange={(v) => saveOverride("section-strip-bg", "Section Strip Background", v)}
      >
        <div
          className="content-width"
          style={{
            padding: "12px 24px 12px",
            ...fillStyle(fillFor("section-strip-bg", stripBg), stripBg),
          }}
        >
          <Editable
            id="section-strip-label"
            label="Section Label"
            description="The 'LATEST EXPERIMENTS' uppercase text."
            value={colorFor("section-strip-label", ink)}
            onChange={(v) => saveOverride("section-strip-label", "Section Label", v)}
            allowFills={false}
          >
            <h2
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: colorFor("section-strip-label", ink),
                margin: 0,
              }}
            >
              LATEST EXPERIMENTS
            </h2>
          </Editable>
        </div>
      </Editable>

      {/* Experiment cards */}
      <div
        className="content-width"
        style={{
          padding: "12px 24px 80px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {EXPERIMENTS.map((card, idx) => {
          const inner = (
            <div
              key={card.label}
              style={{
                ...fillStyle(fillFor("experiment-card-bg", cardBg), cardBg),
                borderRadius: 12,
                padding: "24px",
                cursor: card.href ? "pointer" : "default",
                transition: "box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 4px 20px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Status + label row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <StatusDot status={card.status} />
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: colorFor("experiment-card-label", "rgba(0,0,0,0.4)"),
                  }}
                >
                  {card.label}
                </span>
              </div>

              <h3
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 22,
                  fontWeight: 400,
                  color: colorFor("experiment-card-title", ink),
                  margin: "0 0 8px 0",
                }}
              >
                {card.title}
              </h3>

              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  color: colorFor("experiment-card-desc", "rgba(0,0,0,0.5)"),
                  lineHeight: 1.6,
                  margin: 0,
                  whiteSpace: "pre-line",
                }}
              >
                {card.desc}
              </p>
            </div>
          );

          // Only wrap the first card with an Editable so the outline/label
          // appear once — the override still applies to every card because
          // they all read from the same id via colorFor/fillFor.
          const wrapped =
            idx === 0 ? (
              <Editable
                key={card.label}
                id="experiment-card-bg"
                label="Experiment Card Background"
                description="The white background behind every experiment tile (nutrition, sleep, mood, etc.). One override applies to all cards."
                value={fillFor("experiment-card-bg", cardBg)}
                onChange={(v) => saveOverride("experiment-card-bg", "Experiment Card Background", v)}
              >
                {inner}
              </Editable>
            ) : (
              inner
            );

          return card.href ? (
            <a
              key={card.label}
              href={card.href}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {wrapped}
            </a>
          ) : (
            wrapped
          );
        })}
      </div>

      {/* FAB */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: colorFor("home-fab", CRIMSON),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(220, 20, 60, 0.3)",
          cursor: "pointer",
        }}
      >
        <span style={{ color: "#FFF", fontSize: 28, lineHeight: 1 }}>+</span>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid rgba(0,0,0,0.06)",
          padding: "20px 24px",
          textAlign: "center",
        }}
      >
        <Editable
          id="home-footer"
          label="Footer Text"
          description="The small tagline at the bottom of the page."
          value={colorFor("home-footer", "rgba(0,0,0,0.3)")}
          onChange={(v) => saveOverride("home-footer", "Footer Text", v)}
          allowFills={false}
        >
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              color: colorFor("home-footer", "rgba(0,0,0,0.3)"),
            }}
          >
            Built with Understood · Powered by curiosity
          </p>
        </Editable>
      </div>

      </div>{/* end cream wrapper */}
    </div>
  );
}

/**
 * Tiny pencil button placed in the top-right corner of the home page since
 * home has no SavySiteHeader to host it. Only visible on hover when edit
 * mode is off; becomes a red X once edit mode is on.
 */
function HomeEditPencil() {
  const edit = useEditMode();
  if (!edit) return null;
  const active = edit.enabled;
  return (
    <button
      type="button"
      onClick={edit.toggle}
      aria-label={active ? "Exit edit mode" : "Enter edit mode"}
      aria-pressed={active}
      style={{
        position: "fixed",
        top: "calc(16px + env(safe-area-inset-top, 0px))",
        right: 16,
        zIndex: 50,
        width: 36,
        height: 36,
        borderRadius: 999,
        background: active ? "#DC143C" : "rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.08)",
        color: active ? "#FFFFFF" : "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "background 0.15s ease, color 0.15s ease",
      }}
    >
      {active ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
      )}
    </button>
  );
}

/**
 * Floating page-colors toolbar that appears below the top of the page when
 * edit mode is on. Currently carries one chip — Page Background — since home
 * is flat cream; more chips can be added later (atmosphere, etc).
 */
function HomePageToolbar({
  canvasValue,
  canvasFallback,
  onSaveCanvas,
}: {
  canvasValue: import("@/lib/fills").Fill;
  canvasFallback: string;
  onSaveCanvas: (v: import("@/lib/fills").Fill) => void;
}) {
  const edit = useEditMode();
  if (!edit?.enabled) return null;
  const swatchColor =
    typeof canvasValue === "string"
      ? canvasValue
      : canvasValue.kind === "color"
        ? canvasValue.value
        : canvasValue.kind === "pattern"
          ? canvasValue.bg
          : canvasFallback;
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        display: "flex",
        justifyContent: "center",
        padding: "10px 16px",
      }}
    >
      <button
        type="button"
        onClick={() =>
          edit.setActive({
            id: "canvas",
            label: "Page Background",
            description:
              "The cream color behind everything. Solid, pattern, or a full-page image.",
            currentValue: canvasValue,
            onChange: onSaveCanvas,
            allowFills: true,
          })
        }
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 12px 6px 6px",
          background: "rgba(0,0,0,0.55)",
          color: "#FFFFFF",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 999,
          fontFamily: "'Inter', -apple-system, sans-serif",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        <span
          aria-hidden
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: swatchColor,
            border: "1px solid rgba(255,255,255,0.22)",
            display: "inline-block",
          }}
        />
        Page Background
      </button>
    </div>
  );
}
