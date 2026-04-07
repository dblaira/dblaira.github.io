"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Transformer } from "markmap-lib";
import { Markmap } from "markmap-view";
import { getSupabase } from "@/lib/supabase";

const CRIMSON = "#DC143C";
const INTER = "'Inter', sans-serif";
const PLAYFAIR = "'Playfair Display', Georgia, serif";

const PRESET_COLORS = [
  "#DC143C", "#E85D04", "#F4A261", "#2A9D8F",
  "#264653", "#6A4C93", "#1982C4", "#8AC926",
  "#FF595E", "#606060",
];

interface ChatMessage {
  id: string;
  agent: string;
  message: string;
  response: string | null;
  status: string;
  created_at: string;
  responded_at: string | null;
  metadata: Record<string, unknown>;
}

/* ── Inline MindMap for a single response ───────────────────────────── */

function ResponseMindMap({ markdown }: { markdown: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const mmRef = useRef<Markmap | null>(null);
  const [colorOverrides, setColorOverrides] = useState<Record<string, string>>({});
  const [colorTarget, setColorTarget] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const transformer = new Transformer();
    const { root } = transformer.transform(markdown);

    if (mmRef.current) {
      mmRef.current.setData(root);
      mmRef.current.fit();
    } else {
      mmRef.current = Markmap.create(svgRef.current, {
        autoFit: true,
        duration: 300,
        spacingHorizontal: 80,
        spacingVertical: 5,
        paddingX: 12,
        maxWidth: 240,
        color: (node: { state?: { path?: string } }) => {
          const p = node.state?.path ?? "";
          return colorOverrides[p] ?? undefined;
        },
      }, root);
    }
  }, [markdown, colorOverrides]);

  // Export to MindNode
  const handleExport = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `response-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ position: "relative" }}>
      <svg
        ref={svgRef}
        style={{
          width: "100%",
          height: 320,
          background: "#FFFFFF",
          borderRadius: 8,
        }}
      />
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: 6,
          position: "absolute",
          top: 8,
          right: 8,
        }}
      >
        {/* Color picker */}
        <button
          onClick={() => setColorTarget(colorTarget ? null : "root")}
          style={{
            background: "rgba(0,0,0,0.05)",
            border: "none",
            borderRadius: 8,
            padding: "8px 14px",
            fontSize: 14,
            fontFamily: INTER,
            cursor: "pointer",
            color: "rgba(0,0,0,0.5)",
          }}
        >
          Color
        </button>
        {/* Export */}
        <button
          onClick={handleExport}
          style={{
            background: "rgba(0,0,0,0.05)",
            border: "none",
            borderRadius: 8,
            padding: "8px 14px",
            fontSize: 14,
            fontFamily: INTER,
            cursor: "pointer",
            color: "rgba(0,0,0,0.5)",
          }}
        >
          Export
        </button>
      </div>
      {/* Color palette */}
      {colorTarget && (
        <div
          style={{
            position: "absolute",
            top: 36,
            right: 8,
            display: "flex",
            gap: 4,
            background: "#FFFFFF",
            padding: 6,
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}
        >
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColorOverrides((prev) => ({ ...prev, [colorTarget]: c }));
                setColorTarget(null);
              }}
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: c,
                border: "2px solid rgba(255,255,255,0.8)",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Short card for simple answers ──────────────────────────────────── */

function ResponseCard({ text }: { text: string }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 12,
        padding: "20px 24px",
        borderLeft: `3px solid ${CRIMSON}`,
      }}
    >
      <p
        style={{
          fontFamily: INTER,
          fontSize: 15,
          fontWeight: 500,
          color: "#1A1A1A",
          margin: 0,
          lineHeight: 1.6,
        }}
      >
        {text}
      </p>
    </div>
  );
}

/* ── Main Chat Panel ────────────────────────────────────────────────── */

const AGENTS = [
  { id: "savy", label: "Savy", emoji: "🦊" },
  { id: "po", label: "Po", emoji: "🐼" },
  { id: "all", label: "All", emoji: "" },
];

/* ── Chat History (for activity feed section) ───────────────────────── */

export function ChatHistory() {
  const [filter, setFilter] = useState("all");
  const [history, setHistory] = useState<ChatMessage[]>([]);

  const fetchHistory = useCallback(async () => {
    try {
      const sb = getSupabase();
      let q = sb
        .from("agent_chat")
        .select("*")
        .eq("status", "complete")
        .order("created_at", { ascending: false })
        .limit(20);
      if (filter !== "all") q = q.eq("agent", filter);
      const { data } = await q;
      if (data) setHistory(data);
    } catch {
      // silent
    }
  }, [filter]);

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, [fetchHistory]);

  return (
    <div>
      {/* Label + filter */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <span
          style={{
            fontFamily: INTER,
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "rgba(0,0,0,0.35)",
          }}
        >
          Chat History
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {AGENTS.map((a) => (
            <button
              key={a.id}
              onClick={() => setFilter(a.id)}
              style={{
                fontFamily: INTER,
                fontSize: 14,
                fontWeight: filter === a.id ? 700 : 500,
                padding: "8px 16px",
                borderRadius: 20,
                border: filter === a.id ? `1.5px solid ${CRIMSON}` : "1.5px solid rgba(0,0,0,0.08)",
                background: filter === a.id ? "rgba(220,20,60,0.06)" : "transparent",
                color: filter === a.id ? CRIMSON : "rgba(0,0,0,0.35)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {a.emoji}{a.emoji ? " " : ""}{a.label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 12,
          padding: "8px 0",
        }}
      >
        {history.length === 0 && (
          <div
            style={{
              fontFamily: INTER,
              fontSize: 13,
              color: "rgba(0,0,0,0.25)",
              textAlign: "center",
              padding: "24px 0",
            }}
          >
            No completed conversations yet.
          </div>
        )}
        {history.map((msg, i) => {
          const agentInfo = AGENTS.find((a) => a.id === msg.agent);
          const snippet = msg.response
            ? msg.response.replace(/^#+ /gm, "").replace(/[*_`]/g, "").slice(0, 80)
            : "";
          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                padding: "14px 24px",
                borderBottom: i < history.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
              }}
            >
              <div style={{ position: "relative", paddingTop: 4 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: CRIMSON,
                    flexShrink: 0,
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: INTER,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#1A1A1A",
                    marginBottom: 2,
                  }}
                >
                  {agentInfo?.emoji} {agentInfo?.label} · {msg.message.length > 60 ? msg.message.slice(0, 57) + "..." : msg.message}
                </div>
                <div
                  style={{
                    fontFamily: INTER,
                    fontSize: 12,
                    color: "rgba(0,0,0,0.4)",
                  }}
                >
                  {snippet}{snippet.length >= 80 ? "..." : ""}
                </div>
              </div>
              <div
                style={{
                  fontFamily: INTER,
                  fontSize: 11,
                  fontWeight: 500,
                  color: "rgba(0,0,0,0.3)",
                  flexShrink: 0,
                  paddingTop: 2,
                }}
              >
                {new Date(msg.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main Chat Panel ────────────────────────────────────────────────── */

export default function AgentChatPanel({ agent = "savy" }: { agent?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [hasPending, setHasPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch recent messages via Supabase client
  const fetchMessages = useCallback(async () => {
    try {
      const sb = getSupabase();
      const { data, error } = await sb
        .from("agent_chat")
        .select("*")
        .eq("agent", agent)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) {
        console.error("[chat] fetch error:", error.message);
        return;
      }
      if (data) {
        setMessages(data.reverse());
        setHasPending(data.some((m: ChatMessage) => m.status === "pending" || m.status === "processing"));
      }
    } catch {
      // silent
    }
  }, [agent]);

  // Poll — 3s when waiting for response, 15s otherwise
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, hasPending ? 3000 : 15000);
    return () => clearInterval(interval);
  }, [fetchMessages, hasPending]);

  // Send message
  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");

    try {
      const sb = getSupabase();
      await sb.from("agent_chat").insert({
        message: text,
        agent,
        status: "pending",
      });
      await fetchMessages();
      setHasPending(true);
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  const isShortAnswer = (text: string) => text.length < 120 && !text.includes("\n") && !text.includes("#");

  // Convert response to markdown with a root heading if it doesn't have one
  const toMindmapMarkdown = (msg: ChatMessage) => {
    const r = msg.response ?? "";
    if (r.startsWith("#")) return r;
    // Wrap in a heading derived from the question
    const heading = msg.message.length > 50
      ? msg.message.slice(0, 47) + "..."
      : msg.message;
    return `# ${heading}\n${r}`;
  };

  return (
    <div>
      {/* Input — large touch targets */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 24,
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask something..."
          disabled={sending}
          style={{
            flex: 1,
            fontFamily: INTER,
            fontSize: 17,
            padding: "16px 20px",
            borderRadius: 14,
            border: "1.5px solid rgba(0,0,0,0.1)",
            background: "#FFFFFF",
            outline: "none",
            color: "#1A1A1A",
          }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          style={{
            fontFamily: INTER,
            fontSize: 16,
            fontWeight: 600,
            padding: "16px 28px",
            borderRadius: 14,
            border: "none",
            background: sending ? "rgba(0,0,0,0.1)" : CRIMSON,
            color: sending ? "rgba(0,0,0,0.3)" : "#FFFFFF",
            cursor: sending ? "default" : "pointer",
            transition: "background 0.2s",
          }}
        >
          {sending ? "..." : "Send"}
        </button>
      </div>

      {/* Messages */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.map((msg) => (
          <div key={msg.id}>
            {/* User message */}
            <div
              style={{
                fontFamily: INTER,
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(0,0,0,0.5)",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ color: CRIMSON }}>You</span>
              <span style={{ color: "rgba(0,0,0,0.2)", fontWeight: 400 }}>
                {new Date(msg.created_at).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div
              style={{
                fontFamily: INTER,
                fontSize: 14,
                color: "#1A1A1A",
                marginBottom: 12,
                lineHeight: 1.5,
              }}
            >
              {msg.message}
            </div>

            {/* Response */}
            {msg.status === "pending" || msg.status === "processing" ? (
              <div
                style={{
                  fontFamily: INTER,
                  fontSize: 12,
                  color: "rgba(0,0,0,0.3)",
                  fontStyle: "italic",
                  padding: "16px 0",
                }}
              >
                {msg.status === "processing" ? "Thinking..." : "Waiting for agent..."}
              </div>
            ) : msg.response ? (
              isShortAnswer(msg.response) ? (
                <ResponseCard text={msg.response} />
              ) : (
                <ResponseMindMap markdown={toMindmapMarkdown(msg)} />
              )
            ) : null}
          </div>
        ))}

        {messages.length === 0 && (
          <div
            style={{
              fontFamily: INTER,
              fontSize: 13,
              color: "rgba(0,0,0,0.25)",
              textAlign: "center",
              padding: "32px 0",
            }}
          >
            No messages yet. Ask {AGENTS.find(a => a.id === agent)?.label ?? agent} something.
          </div>
        )}
      </div>
    </div>
  );
}
