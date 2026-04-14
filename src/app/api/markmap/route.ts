import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("markmap_content")
    .select("id, markdown, title, source, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { markdown, title, source } = body;

  if (!markdown || typeof markdown !== "string") {
    return NextResponse.json({ error: "Missing markdown" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("markmap_content")
    .insert({
      markdown,
      title: title || "Untitled",
      source: source || "spark",
      updated_at: new Date().toISOString(),
    })
    .select("id, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
