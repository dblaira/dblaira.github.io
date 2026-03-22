"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import type { BeliefEntry } from "@/lib/types";

const CRIMSON = "#DC143C";
const ROTATION_MS = 8000;

const FALLBACK_BELIEFS: Pick<BeliefEntry, "headline">[] = [
  { headline: "Anything that gives me a feeling of momentum is worthwhile. Anything that gives me the feeling of stagnation is worth avoiding." },
  { headline: "The structure is identical no matter the goal. Success allows you to choose the goal." },
  { headline: "You don\u2019t outwork the problem. You find the structural edge, build the simplest possible system around it, and let it compound." },
];

export function BeliefCarousel() {
  const [beliefs, setBeliefs] = useState<Pick<BeliefEntry, "headline">[]>(FALLBACK_BELIEFS);
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const pausedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartRef = useRef<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createSupabaseBrowser();
        const { data } = await supabase
          .from("entries")
          .select("id, headline, content, entry_type, connection_type, pinned_at, created_at")
          .eq("entry_type", "connection")
          .order("pinned_at", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false })
          .limit(7);

        if (data && data.length > 0) {
          setBeliefs(data as BeliefEntry[]);
        }
      } catch {
        // Keep fallback beliefs
      }
    }
    load();
  }, []);

  const advance = useCallback(
    (dir: 1 | -1) => {
      setFading(true);
      setTimeout(() => {
        setIndex((prev) => (prev + dir + beliefs.length) % beliefs.length);
        setFading(false);
      }, 200);
    },
    [beliefs.length]
  );

  useEffect(() => {
    if (beliefs.length <= 1) return;
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) advance(1);
    }, ROTATION_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [beliefs.length, advance]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
    pausedRef.current = true;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartRef.current;
    if (Math.abs(diff) > 40) advance(diff < 0 ? 1 : -1);
    touchStartRef.current = null;
    pausedRef.current = false;
  };

  const current = beliefs[index];

  return (
    <div
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div style={{ display: "flex", gap: 16 }}>
        <div
          style={{
            width: 3,
            background: CRIMSON,
            borderRadius: 2,
            flexShrink: 0,
          }}
        />
        <p
          style={{
            fontFamily: "Georgia, 'Playfair Display', serif",
            fontSize: 20,
            fontStyle: "italic",
            color: "#1A1A1A",
            lineHeight: 1.5,
            margin: 0,
            minHeight: 60,
            opacity: fading ? 0 : 1,
            transition: "opacity 0.2s ease",
          }}
        >
          &ldquo;{current.headline}&rdquo;
        </p>
      </div>

      {/* Pagination */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginTop: 20,
        }}
      >
        {beliefs.map((_, i) => (
          <span
            key={i}
            onClick={() => { setFading(true); setTimeout(() => { setIndex(i); setFading(false); }, 200); }}
            style={{
              width: i === index ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background: i === index ? CRIMSON : "rgba(0,0,0,0.12)",
              cursor: "pointer",
              transition: "width 0.2s, background 0.2s",
            }}
          />
        ))}
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            color: "rgba(0,0,0,0.3)",
            marginLeft: 8,
          }}
        >
          {index + 1} / {beliefs.length}
        </span>
      </div>
    </div>
  );
}
