import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)!;

async function query(sql: string, params: Record<string, unknown> = {}) {
  // Use PostgREST RPC with a raw sql wrapper if available,
  // otherwise fall back to the pg-meta SQL endpoint
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_latest_markmap`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      // Force schema cache miss by preferring count
      Prefer: "return=representation",
    },
    body: JSON.stringify(params),
  });
  return res;
}

/** GET /api/markmap — returns the latest markdown for a given source */
export async function GET(req: NextRequest) {
  const source = req.nextUrl.searchParams.get("source") ?? "savy";

  // Direct REST call to PostgREST, bypassing JS client cache
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/markmap_content?source=eq.${encodeURIComponent(source)}&order=updated_at.desc&limit=1`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
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
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      markdown,
      title: title ?? null,
      source: source ?? "savy",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text }, { status: res.status });
  }

  const [row] = await res.json();
  return NextResponse.json({
    ok: true,
    id: row?.id,
    updated_at: row?.updated_at,
  });
}
