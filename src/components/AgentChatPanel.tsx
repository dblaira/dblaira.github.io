"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Transformer } from "markmap-lib";
import { Markmap } from "markmap-view";

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
            borderRadius: 6,
            padding: "4px 8px",
            fontSize: 11,
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
            borderRadius: 6,
            padding: "4px 8px",
            fontSize: 11,
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

export default function AgentChatPanel({ agent = "po" }: { agent?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [hasPending, setHasPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch recent messages
  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat?agent=${agent}&limit=10`);
      const json = await res.json();
      if (json.data) {
        // API returns desc order, reverse for display
        setMessages(json.data.reverse());
        setHasPending(json.data.some((m: ChatMessage) => m.status === "pending" || m.status === "processing"));
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
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, agent }),
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
      {/* Section label */}
      <div style={{ marginBottom: 12 }}>
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
          Talk to {agent === "po" ? "Po" : "Savy"}
        </span>
      </div>

      {/* Input */}
      <div
        style={{
          display: "flex",
          gap: 8,
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
            fontSize: 14,
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.1)",
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
            fontSize: 13,
            fontWeight: 600,
            padding: "12px 20px",
            borderRadius: 12,
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
            No messages yet. Ask Po something.
          </div>
        )}
      </div>
    </div>
  );
}
