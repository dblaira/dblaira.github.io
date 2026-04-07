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

/** GET /api/chat
 *  ?status=pending&agent=po  → pending messages for an agent (Hermes polling)
 *  ?limit=10                 → recent chat history (web UI) */
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const agent = req.nextUrl.searchParams.get("agent") ?? "po";
  const limit = Math.min(
    Math.max(parseInt(req.nextUrl.searchParams.get("limit") ?? "10", 10) || 10, 1),
    50,
  );

  let url: string;
  if (status) {
    // Hermes polling: get pending messages for this agent
    url =
      `${SUPABASE_URL}/rest/v1/agent_chat` +
      `?status=eq.${encodeURIComponent(status)}` +
      `&agent=eq.${encodeURIComponent(agent)}` +
      `&order=created_at.asc&limit=${limit}`;
  } else {
    // Web UI: get recent history
    url =
      `${SUPABASE_URL}/rest/v1/agent_chat` +
      `?agent=eq.${encodeURIComponent(agent)}` +
      `&order=created_at.desc&limit=${limit}`;
  }

  const res = await fetch(url, { headers: HEADERS, cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json({ error: await res.text() }, { status: res.status });
  }
  const rows = await res.json();
  return NextResponse.json({ data: rows });
}

/** POST /api/chat — send a new message (from web UI) */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message, agent } = body as { message?: string; agent?: string };

  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/agent_chat`, {
    method: "POST",
    headers: { ...HEADERS, Prefer: "return=representation" },
    cache: "no-store",
    body: JSON.stringify({
      message: message.trim(),
      agent: agent ?? "po",
      status: "pending",
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: await res.text() }, { status: res.status });
  }

  const [row] = await res.json();
  return NextResponse.json({ ok: true, id: row?.id, created_at: row?.created_at });
}

/** PATCH /api/chat — update with response (from Hermes) */
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, response, status, metadata } = body as {
    id?: string;
    response?: string;
    status?: string;
    metadata?: Record<string, unknown>;
  };

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (response !== undefined) update.response = response;
  if (status) update.status = status;
  if (metadata) update.metadata = metadata;
  if (response) update.responded_at = new Date().toISOString();

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/agent_chat?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { ...HEADERS, Prefer: "return=representation" },
      cache: "no-store",
      body: JSON.stringify(update),
    },
  );

  if (!res.ok) {
    return NextResponse.json({ error: await res.text() }, { status: res.status });
  }

  const [row] = await res.json();
  return NextResponse.json({ ok: true, data: row });
}
