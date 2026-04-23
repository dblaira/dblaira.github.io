import Link from "next/link";
import { SavySiteHeader } from "@/components/SavySiteHeader";
import { getAllParables } from "@/lib/parables";

export const metadata = {
  title: "Parables · SAVY",
  description: "Patterns that trace back before modern society and still apply today.",
};

// Palette mirrored from the Ontology theme — warm cream paper for reading in
// bright environments, dark ink, crimson as the primary accent.
const BG = "#F5F0E8";
const INK = "#1A1A1A";
const INK_MUTED = "rgba(26, 26, 26, 0.62)";
const INK_FAINT = "rgba(26, 26, 26, 0.45)";
const CRIMSON = "#DC143C";
const RULE = "rgba(26, 26, 26, 0.1)";

function formatDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ParablesIndex() {
  const parables = getAllParables();

  return (
    <div style={{ background: BG, color: INK, minHeight: "100vh" }}>
      <SavySiteHeader />

      <div style={{ padding: "64px 24px 40px", maxWidth: 720, margin: "0 auto" }}>
        <div
          style={{
            fontFamily: "'Inter', -apple-system, sans-serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: CRIMSON,
            marginBottom: 18,
          }}
        >
          Parables
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(36px, 7vw, 56px)",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            color: INK,
            margin: "0 0 18px",
          }}
        >
          Field Essays
        </h1>

        <p
          style={{
            fontFamily: "Georgia, 'Playfair Display', serif",
            fontSize: 18,
            lineHeight: 1.55,
            color: INK_MUTED,
            margin: "0 0 64px",
            maxWidth: 520,
          }}
        >
          Patterns that trace back before modern society
          <br />
          and still apply today.
        </p>

        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {parables.map((p) => (
            <li
              key={p.slug}
              style={{
                borderTop: `1px solid ${RULE}`,
                paddingTop: 24,
                paddingBottom: 24,
              }}
            >
              <Link
                href={`/parables/${p.slug}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "block",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Inter', -apple-system, sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: INK_FAINT,
                    marginBottom: 8,
                  }}
                >
                  {formatDate(p.date)}
                </div>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 26,
                    fontWeight: 400,
                    lineHeight: 1.2,
                    margin: "0 0 8px",
                    color: INK,
                  }}
                >
                  {p.title}
                </h2>
                <p
                  style={{
                    fontFamily: "Georgia, 'Playfair Display', serif",
                    fontSize: 16,
                    lineHeight: 1.55,
                    color: INK_MUTED,
                    margin: 0,
                  }}
                >
                  {p.summary}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
