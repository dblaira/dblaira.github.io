import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { brief } = await req.json();

  if (!brief || typeof brief !== "string") {
    return NextResponse.json({ error: "Missing brief" }, { status: 400 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json({ error: "Telegram not configured" }, { status: 500 });
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: brief,
      parse_mode: "Markdown",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Telegram error:", err);
    return NextResponse.json({ error: "Telegram send failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
