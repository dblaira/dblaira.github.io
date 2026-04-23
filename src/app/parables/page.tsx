import Link from "next/link";
import { SavySiteHeader } from "@/components/SavySiteHeader";
import { getAllParables } from "@/lib/parables";

export const metadata = {
  title: "Parables · SAVY",
  description: "Patterns that trace back before modern society and still apply today.",
};

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
    <div style={{ background: "#0A0A0A", color: "#F5F0E8", minHeight: "100vh" }}>
      <SavySiteHeader />

      <div className="content-width" style={{ padding: "64px 24px 40px", maxWidth: 720 }}>
        <div
          style={{
            fontFamily: "'Inter', -apple-system, sans-serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#DC143C",
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
            color: "#F5F0E8",
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
            color: "rgba(255,255,255,0.7)",
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
                borderTop: "1px solid rgba(255,255,255,0.1)",
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
                    fontWeight: 500,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.45)",
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
                    color: "#F5F0E8",
                  }}
                >
                  {p.title}
                </h2>
                <p
                  style={{
                    fontFamily: "Georgia, 'Playfair Display', serif",
                    fontSize: 16,
                    lineHeight: 1.55,
                    color: "rgba(255,255,255,0.7)",
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
