import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { brief } = await req.json();

  if (!brief || typeof brief !== "string") {
    return NextResponse.json({ error: "Missing brief" }, { status: 400 });
  }

  const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL ?? "http://127.0.0.1:18789";
  const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN;

  if (!gatewayToken) {
    return NextResponse.json({ error: "OpenClaw gateway not configured" }, { status: 500 });
  }

  const res = await fetch(`${gatewayUrl}/tools/invoke`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${gatewayToken}`,
    },
    body: JSON.stringify({
      tool: "sessions_send",
      args: {
        sessionKey: "agent:main:telegram:direct:8201014705",
        message: brief,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("OpenClaw gateway error:", err);
    return NextResponse.json({ error: "Gateway send failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
