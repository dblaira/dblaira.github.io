import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)!;

const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  "Accept-Profile": "public",
  Accept: "application/json",
};

/** GET /api/markmap
 *  ?id=<uuid>        → single row with full markdown
 *  ?limit=1 (default)→ latest row with full markdown
 *  ?limit=N          → N most-recent rows (metadata only, no markdown) */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (id) {
    const url = `${SUPABASE_URL}/rest/v1/markmap_content?id=eq.${encodeURIComponent(id)}&limit=1`;
    const res = await fetch(url, { headers: HEADERS, cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ error: await res.text() }, { status: res.status });
    }
    const rows = await res.json();
    return NextResponse.json({ data: rows[0] ?? null });
  }

  const source = req.nextUrl.searchParams.get("source") ?? "savy";
  const limit = Math.min(
    Math.max(parseInt(req.nextUrl.searchParams.get("limit") ?? "1", 10) || 1, 1),
    50,
  );
  const select = limit === 1
    ? "id,title,markdown,updated_at,source"
    : "id,title,updated_at,source";

  const url =
    `${SUPABASE_URL}/rest/v1/markmap_content?source=eq.${encodeURIComponent(source)}` +
    `&select=${select}&order=updated_at.desc&limit=${limit}`;

  console.log("[markmap GET]", url.replace(SUPABASE_KEY, "***"));

  const res = await fetch(url, {
    headers: HEADERS,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[markmap GET] error:", res.status, text);
    if (text.includes("schema cache")) {
      return NextResponse.json({ data: null, _cache_stale: true });
    }
    return NextResponse.json({ error: text }, { status: res.status });
  }

  const rows = await res.json();
  if (limit === 1) {
    return NextResponse.json({ data: rows[0] ?? null });
  }
  return NextResponse.json({ data: rows });
}

/** POST /api/markmap — push new markdown content */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { markdown, title, source } = body as {
    markdown?: string;
    title?: string;
    source?: string;
  };

  if (!markdown || typeof markdown !== "string") {
    return NextResponse.json({ error: "Missing markdown" }, { status: 400 });
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/markmap_content`, {
    method: "POST",
    headers: { ...HEADERS, Prefer: "return=representation" },
    cache: "no-store",
    body: JSON.stringify({
      markdown,
      title: title ?? null,
      source: source ?? "savy",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[markmap POST] error:", res.status, text);
    return NextResponse.json({ error: text }, { status: res.status });
  }

  const [row] = await res.json();
  return NextResponse.json({
    ok: true,
    id: row?.id,
    updated_at: row?.updated_at,
  });
}
