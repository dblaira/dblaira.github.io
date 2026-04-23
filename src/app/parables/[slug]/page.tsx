import { notFound } from "next/navigation";
import Link from "next/link";
import { SavySiteHeader } from "@/components/SavySiteHeader";
import { getAllParableSlugs, getParable } from "@/lib/parables";

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
    <div style={{ background: "#0A0A0A", color: "#F5F0E8", minHeight: "100vh" }}>
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
              color: "#DC143C",
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
            color: "#F5F0E8",
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
            color: "rgba(255,255,255,0.45)",
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
          color: rgba(245, 240, 232, 0.92);
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
          color: #F5F0E8;
          letter-spacing: -0.005em;
          margin-top: 2.2em;
          margin-bottom: 0.6em;
        }
        .parable-body strong { color: #F5F0E8; font-weight: 600; }
        .parable-body em { font-style: italic; }
        .parable-body a {
          color: #DC143C;
          text-decoration: underline;
          text-decoration-color: rgba(220, 20, 60, 0.4);
          text-underline-offset: 3px;
        }
        .parable-body a:hover { text-decoration-color: #DC143C; }
        .parable-body blockquote {
          margin: 1.6em 0;
          padding: 4px 0 4px 18px;
          border-left: 2px solid #DC143C;
          color: rgba(245, 240, 232, 0.78);
          font-style: italic;
        }
        .parable-body blockquote p { margin: 0; }
        .parable-body hr {
          border: none;
          border-top: 1px solid rgba(255, 255, 255, 0.14);
          margin: 3em 0 1.6em;
        }
        /* Any paragraph after the closing <hr> renders as a muted signature */
        .parable-body hr ~ p {
          font-size: 15px;
          line-height: 1.55;
          color: rgba(255, 255, 255, 0.45);
          font-style: italic;
        }
        .parable-body code {
          font-family: ui-monospace, Menlo, monospace;
          font-size: 0.92em;
          background: rgba(255,255,255,0.06);
          padding: 2px 6px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
