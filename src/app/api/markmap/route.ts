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

/** GET /api/markmap — returns the latest markdown for a given source */
export async function GET(req: NextRequest) {
  const source = req.nextUrl.searchParams.get("source") ?? "savy";

  const url = `${SUPABASE_URL}/rest/v1/markmap_content?source=eq.${encodeURIComponent(source)}&order=updated_at.desc&limit=1`;

  console.log("[markmap GET]", url.replace(SUPABASE_KEY, "***"));

  const res = await fetch(url, {
    headers: HEADERS,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[markmap GET] error:", res.status, text);
    // If schema cache is stale, return null data instead of error
    if (text.includes("schema cache")) {
      return NextResponse.json({ data: null, _cache_stale: true });
    }
    return NextResponse.json({ error: text }, { status: res.status });
  }

  const rows = await res.json();
  return NextResponse.json({ data: rows[0] ?? null });
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
