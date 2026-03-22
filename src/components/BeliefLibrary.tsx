"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import { SavySiteHeader } from "@/components/SavySiteHeader";
import type { BeliefEntry, ConnectionType } from "@/lib/types";

const CRIMSON = "#DC143C";

const CONNECTION_TYPES: { value: ConnectionType; label: string; color: string }[] = [
  { value: "identity_anchor", label: "Identity Anchor", color: "#8B5CF6" },
  { value: "pattern_interrupt", label: "Pattern Interrupt", color: "#F59E0B" },
  { value: "validated_principle", label: "Validated Principle", color: "#10B981" },
  { value: "process_anchor", label: "Process Anchor", color: "#3B82F6" },
];

export default function BeliefLibrary() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);
  const [beliefs, setBeliefs] = useState<BeliefEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [headline, setHeadline] = useState("");
  const [connType, setConnType] = useState<ConnectionType>("identity_anchor");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("entries")
        .select("id, headline, content, entry_type, connection_type, pinned_at, created_at")
        .eq("entry_type", "connection")
        .order("pinned_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (data) setBeliefs(data as BeliefEntry[]);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!headline.trim()) return;
    setSaving(true);
    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("entries").insert({
        user_id: user.id,
        headline: headline.trim(),
        content: headline.trim(),
        category: "Spiritual",
        entry_type: "connection",
        connection_type: connType,
      });

      setHeadline("");
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const togglePin = async (belief: BeliefEntry) => {
    const supabase = getSupabase();
    await supabase
      .from("entries")
      .update({ pinned_at: belief.pinned_at ? null : new Date().toISOString() })
      .eq("id", belief.id);
    load();
  };

  const typeInfo = (ct: ConnectionType | null) =>
    CONNECTION_TYPES.find((t) => t.value === ct) || CONNECTION_TYPES[0];

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A" }}>
      <SavySiteHeader />
      <div style={{ background: "#F5F0E8", minHeight: "calc(100vh - 60px)" }}>
        <div style={{ padding: "40px 24px 16px", maxWidth: 720, margin: "0 auto" }}>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: CRIMSON,
            }}
          >
            BELIEFS
          </span>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(32px, 7vw, 44px)",
              fontWeight: 400,
              fontStyle: "italic",
              color: "#1A1A1A",
              lineHeight: 1.15,
              margin: "8px 0 0 0",
            }}
          >
            Belief Library
          </h1>
        </div>

        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 40px" }}>
          {/* Add button */}
          <div style={{ marginBottom: 24 }}>
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              style={{
                padding: "12px 24px",
                background: showForm ? "rgba(0,0,0,0.06)" : CRIMSON,
                color: showForm ? "#1A1A1A" : "#FFFFFF",
                border: "none",
                borderRadius: 8,
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {showForm ? "Cancel" : "+ New Belief"}
            </button>
          </div>

          {/* Create form */}
          {showForm && (
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 12,
                padding: 24,
                marginBottom: 24,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <textarea
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Write your belief..."
                rows={3}
                style={{
                  width: "100%",
                  padding: 16,
                  border: "2px solid rgba(0,0,0,0.08)",
                  borderRadius: 8,
                  fontFamily: "Georgia, 'Playfair Display', serif",
                  fontSize: 16,
                  fontStyle: "italic",
                  lineHeight: 1.5,
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(220,20,60,0.3)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)"; }}
              />

              {/* Type picker */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "16px 0" }}>
                {CONNECTION_TYPES.map((ct) => (
                  <button
                    key={ct.value}
                    type="button"
                    onClick={() => setConnType(ct.value)}
                    style={{
                      padding: "8px 16px",
                      background: connType === ct.value ? ct.color : "rgba(0,0,0,0.04)",
                      color: connType === ct.value ? "#FFFFFF" : "rgba(0,0,0,0.6)",
                      border: "none",
                      borderRadius: 20,
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {ct.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCreate}
                disabled={!headline.trim() || saving}
                style={{
                  padding: "12px 32px",
                  background: headline.trim() ? CRIMSON : "rgba(0,0,0,0.1)",
                  color: headline.trim() ? "#FFFFFF" : "rgba(0,0,0,0.3)",
                  border: "none",
                  borderRadius: 8,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: headline.trim() ? "pointer" : "default",
                  transition: "all 0.15s",
                }}
              >
                {saving ? "Saving..." : "Save Belief"}
              </button>
            </div>
          )}

          {/* Beliefs list */}
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(0,0,0,0.3)", fontFamily: "'Inter', sans-serif", fontSize: 14 }}>
              Loading beliefs...
            </div>
          )}

          {!loading && beliefs.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(0,0,0,0.3)", fontFamily: "'Inter', sans-serif", fontSize: 14 }}>
              No beliefs yet. Create your first one above.
            </div>
          )}

          {beliefs.map((b) => {
            const info = typeInfo(b.connection_type);
            return (
              <div
                key={b.id}
                style={{
                  background: "#FFFFFF",
                  borderRadius: 12,
                  padding: "20px 24px",
                  marginBottom: 12,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                }}
              >
                {/* Crimson accent */}
                <div
                  style={{
                    width: 3,
                    minHeight: 40,
                    background: b.pinned_at ? CRIMSON : "rgba(0,0,0,0.08)",
                    borderRadius: 2,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontFamily: "Georgia, 'Playfair Display', serif",
                      fontSize: 16,
                      fontStyle: "italic",
                      color: "#1A1A1A",
                      lineHeight: 1.5,
                      margin: "0 0 8px 0",
                    }}
                  >
                    &ldquo;{b.headline}&rdquo;
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span
                      style={{
                        padding: "3px 10px",
                        background: info.color,
                        color: "#FFFFFF",
                        borderRadius: 12,
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {info.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => togglePin(b)}
                      style={{
                        padding: "3px 10px",
                        background: b.pinned_at ? "rgba(220,20,60,0.08)" : "rgba(0,0,0,0.04)",
                        color: b.pinned_at ? CRIMSON : "rgba(0,0,0,0.35)",
                        border: "none",
                        borderRadius: 12,
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 10,
                        fontWeight: 600,
                        cursor: "pointer",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {b.pinned_at ? "★ Pinned" : "Pin to home"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
