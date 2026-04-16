"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "./supabase";

export type ComponentKind =
  | "feed-tiles"
  | "meal-blocks"
  | "rings-grid"
  | "emotion-wheel"
  | "graph-nodes"
  | "card-stack";

export type Theme = {
  route: string;
  label: string;
  canvas: string;
  ink: string;
  accents: string[];
  heading_font: string;
  body_font: string;
  component_kind: ComponentKind;
  notes: string;
};

const FALLBACK: Theme = {
  route: "/",
  label: "",
  canvas: "#F5F0E8",
  ink: "#1A1A1A",
  accents: ["#DC143C"],
  heading_font: "'Playfair Display', Georgia, serif",
  body_font: "'Inter', -apple-system, sans-serif",
  component_kind: "feed-tiles",
  notes: "",
};

export function useTheme(route: string): Theme {
  const [theme, setTheme] = useState<Theme>({ ...FALLBACK, route });

  useEffect(() => {
    let cancelled = false;
    const supabase = getSupabase();

    const load = async () => {
      const { data } = await supabase
        .from("studio_themes")
        .select("*")
        .eq("route", route)
        .maybeSingle();
      if (!cancelled && data) setTheme(data as Theme);
    };

    load();

    const channel = supabase
      .channel(`studio_themes:${route}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "studio_themes", filter: `route=eq.${route}` },
        (payload) => {
          if (!cancelled) setTheme(payload.new as Theme);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [route]);

  return theme;
}
