"use client";

import { useState, useCallback } from "react";
import { SavySiteHeader } from "@/components/SavySiteHeader";
import { type EmotionSelection } from "@/components/EmotionWheel";
import { EmotionGrid } from "@/components/EmotionGrid";
import { EmotionHistory } from "@/components/EmotionHistory";
import { EmotionCustomize } from "@/components/EmotionCustomize";
import { getSupabase } from "@/lib/supabase";
import { useEmotionConfig } from "@/lib/useEmotionConfig";
import { useTheme } from "@/lib/useTheme";

const CRIMSON = "#DC143C";

const TRIGGER_TAGS = [
  "Work",
  "Relationship",
  "Health",
  "Money",
  "Uncertainty",
  "Boredom",
  "Rejection",
  "Momentum",
];

export default function MoodCheckin() {
  const emotionConfig = useEmotionConfig();
  const { getEmotionLabel, getTriggerLabel } = emotionConfig;
  const theme = useTheme("/mood");

  const [view, setView] = useState<"checkin" | "history" | "customize">("checkin");
  const [step, setStep] = useState<1 | 2>(1);
  const [emotion, setEmotion] = useState<EmotionSelection | null>(null);
  const [trigger, setTrigger] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLog = useCallback(async () => {
    if (!emotion) return;
    setSaving(true);
    try {
      const supabase = getSupabase();
      await supabase.from("emotion_logs").insert({
        emotion: emotion.emotion,
        energy: emotion.energy,
        valence: emotion.valence,
        trigger_tag: trigger,
      });

      setDone(true);
      setRefreshKey((k) => k + 1);
      setTimeout(() => {
        setDone(false);
        setStep(1);
        setEmotion(null);
        setTrigger(null);
        setView("history");
      }, 1200);
    } catch {
      setSaving(false);
    }
  }, [emotion, trigger]);

  if (done) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0A" }}>
        <SavySiteHeader />
        <div
          style={{
            background: theme.canvas,
            minHeight: "calc(100vh - 60px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#22C55E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "savyMenuFadeIn 0.3s ease-out",
            }}
          >
            <span style={{ color: "#fff", fontSize: 32 }}>&#10003;</span>
          </div>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              color: "rgba(0,0,0,0.4)",
              fontWeight: 500,
            }}
          >
            Logged
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A" }}>
      <SavySiteHeader />
      <div style={{ background: theme.canvas, minHeight: "calc(100vh - 60px)" }}>
        <div className="content-width" style={{ padding: "40px 24px 16px" }}>
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
            MOOD
          </span>
          <h1
            style={{
              fontFamily: theme.heading_font,
              fontSize: "clamp(28px, 6vw, 40px)",
              fontWeight: 400,
              fontStyle: "italic",
              color: theme.ink,
              lineHeight: 1.15,
              margin: "8px 0 0 0",
            }}
          >
            {view === "history"
              ? "Your Patterns"
              : view === "customize"
              ? "Your Words"
              : step === 1
              ? "How Are You Feeling?"
              : "What\u2019s Driving It?"}
          </h1>

          {/* View toggle */}
          <div style={{ display: "flex", gap: 4, marginTop: 20 }}>
            {(["checkin", "history", "customize"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                style={{
                  padding: "8px 20px",
                  background: view === v ? "#1A1A1A" : "rgba(0,0,0,0.04)",
                  color: view === v ? "#FFFFFF" : "rgba(0,0,0,0.4)",
                  border: "none",
                  borderRadius: 20,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {v === "checkin" ? "Check In" : v === "history" ? "History" : "Customize"}
              </button>
            ))}
          </div>
        </div>

        {view === "checkin" && (
          <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 24px 40px" }}>
            {step === 1 && (
              <>
                <EmotionGrid selected={emotion} onSelect={setEmotion} getLabel={getEmotionLabel} />
                <div style={{ textAlign: "center", marginTop: 24 }}>
                  <button
                    type="button"
                    onClick={() => { if (emotion) setStep(2); }}
                    disabled={!emotion}
                    style={{
                      padding: "14px 48px",
                      background: emotion ? CRIMSON : "rgba(0,0,0,0.1)",
                      color: emotion ? "#FFFFFF" : "rgba(0,0,0,0.3)",
                      border: "none",
                      borderRadius: 8,
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 15,
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      cursor: emotion ? "pointer" : "default",
                      transition: "background 0.2s, color 0.2s",
                    }}
                  >
                    Next &rarr;
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: 32,
                    padding: "16px",
                    background: "#FFFFFF",
                    borderRadius: 12,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: 24,
                      fontStyle: "italic",
                      color: CRIMSON,
                    }}
                  >
                    {emotion?.emotion}
                  </span>
                  <span
                    style={{
                      display: "block",
                      marginTop: 4,
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12,
                      color: "rgba(0,0,0,0.4)",
                    }}
                  >
                    {emotion?.family}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    justifyContent: "center",
                  }}
                >
                  {TRIGGER_TAGS.map((tag) => {
                    const displayTag = getTriggerLabel(tag);
                    const active = trigger === displayTag;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setTrigger(active ? null : displayTag)}
                        style={{
                          padding: "10px 20px",
                          background: active ? CRIMSON : "#FFFFFF",
                          color: active ? "#FFFFFF" : "#1A1A1A",
                          border: active ? `2px solid ${CRIMSON}` : "2px solid rgba(0,0,0,0.1)",
                          borderRadius: 24,
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {displayTag}
                      </button>
                    );
                  })}
                </div>

                <div style={{ textAlign: "center", marginTop: 32 }}>
                  <button
                    type="button"
                    onClick={handleLog}
                    disabled={saving}
                    style={{
                      padding: "14px 48px",
                      background: CRIMSON,
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: 8,
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 15,
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      cursor: saving ? "default" : "pointer",
                      opacity: saving ? 0.6 : 1,
                      transition: "opacity 0.2s",
                    }}
                  >
                    {saving ? "Logging..." : "Log It"}
                  </button>
                </div>

                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "rgba(0,0,0,0.35)",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    &larr; Back to wheel
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {view === "history" && (
          <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 24px 40px" }}>
            <EmotionHistory key={refreshKey} />
          </div>
        )}

        {view === "customize" && (
          <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 24px 40px" }}>
            <EmotionCustomize config={emotionConfig} />
          </div>
        )}
      </div>
    </div>
  );
}
