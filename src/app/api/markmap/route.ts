import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase not configured");
  return createClient(url, key);
}

/** GET /api/markmap — returns the latest markdown for a given source */
export async function GET(req: NextRequest) {
  const source = req.nextUrl.searchParams.get("source") ?? "savy";
  const sb = getServerSupabase();

  const { data, error } = await sb
    .from("markmap_content")
    .select("id, markdown, title, source, updated_at")
    .eq("source", source)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? null });
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

  const sb = getServerSupabase();

  const { data, error } = await sb
    .from("markmap_content")
    .insert({
      markdown,
      title: title ?? null,
      source: source ?? "savy",
    })
    .select("id, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id, updated_at: data.updated_at });
}
