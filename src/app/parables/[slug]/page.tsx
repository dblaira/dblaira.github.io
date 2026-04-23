import { notFound } from "next/navigation";
import Link from "next/link";
import { SavySiteHeader } from "@/components/SavySiteHeader";
import { EditingShell } from "@/components/EditingShell";
import { EditablePageBackground } from "@/components/EditablePageBackground";
import { getAllParableSlugs, getParable } from "@/lib/parables";

// Palette mirrored from the Ontology theme. Cream paper reads well in bright
// environments; dark serif body at 19px/1.7 is the long-form target.
const BG = "#F5F0E8";
const INK = "#1A1A1A";
const CRIMSON = "#DC143C";
const TEAL = "#0E918C";
const INK_MUTED = "rgba(26, 26, 26, 0.62)";
const INK_FAINT = "rgba(26, 26, 26, 0.45)";
const RULE = "rgba(26, 26, 26, 0.14)";

export async function generateStaticParams() {
  return getAllParableSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const parable = await getParable(slug);
  if (!parable) return { title: "Parables · SAVY" };
  return {
    title: `${parable.title} · Parables · SAVY`,
    description: parable.summary,
  };
}

function formatDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ParablePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const parable = await getParable(slug);
  if (!parable) notFound();

  return (
    <EditingShell>
    <EditablePageBackground route="/parables" fallback={BG}>
      <div style={{ color: INK }}>
      <SavySiteHeader />

      <article className="parable-article" style={{ padding: "56px 24px 96px", maxWidth: 680, margin: "0 auto" }}>
        <div style={{ marginBottom: 40 }}>
          <Link
            href="/parables"
            style={{
              fontFamily: "'Inter', -apple-system, sans-serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: CRIMSON,
              textDecoration: "none",
            }}
          >
            ← Parables
          </Link>
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(32px, 6.5vw, 46px)",
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
            color: INK,
            margin: "0 0 14px",
          }}
        >
          {parable.title}
        </h1>

        <div
          style={{
            fontFamily: "'Inter', -apple-system, sans-serif",
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: INK_FAINT,
            marginBottom: 48,
          }}
        >
          {formatDate(parable.date)}
        </div>

        <div
          className="parable-body"
          dangerouslySetInnerHTML={{ __html: parable.body }}
        />
      </article>

      <style>{`
        .parable-body {
          font-family: Georgia, 'Playfair Display', serif;
          font-size: 19px;
          line-height: 1.7;
          color: ${INK};
        }
        @media (max-width: 520px) {
          .parable-body { font-size: 17.5px; line-height: 1.65; }
        }
        .parable-body p,
        .parable-body blockquote,
        .parable-body ul,
        .parable-body ol { margin: 0; }
        .parable-body p + p,
        .parable-body p + blockquote,
        .parable-body blockquote + p,
        .parable-body h2 + p,
        .parable-body p + ul,
        .parable-body p + ol,
        .parable-body ul + p,
        .parable-body ol + p { margin-top: 1.4em; }
        .parable-body h2 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 26px;
          font-weight: 500;
          line-height: 1.25;
          color: ${INK};
          letter-spacing: -0.005em;
          margin-top: 2.2em;
          margin-bottom: 0.6em;
        }
        .parable-body strong { color: ${INK}; font-weight: 700; }
        .parable-body em { font-style: italic; }
        .parable-body a {
          color: ${CRIMSON};
          text-decoration: underline;
          text-decoration-color: rgba(220, 20, 60, 0.4);
          text-underline-offset: 3px;
        }
        .parable-body a:hover { text-decoration-color: ${CRIMSON}; }
        .parable-body blockquote {
          margin: 1.6em 0;
          padding: 4px 0 4px 18px;
          border-left: 2px solid ${TEAL};
          color: ${INK_MUTED};
          font-style: italic;
        }
        .parable-body blockquote p { margin: 0; }
        .parable-body hr {
          border: none;
          border-top: 1px solid ${RULE};
          margin: 3em 0 1.6em;
        }
        /* Any paragraph after the closing <hr> renders as a muted signature */
        .parable-body hr ~ p {
          font-size: 15px;
          line-height: 1.55;
          color: ${INK_FAINT};
          font-style: italic;
        }
        .parable-body code {
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.92em;
          background: rgba(26,26,26,0.06);
          padding: 2px 6px;
          border-radius: 4px;
        }
      `}</style>
      </div>
    </EditablePageBackground>
    </EditingShell>
  );
}
