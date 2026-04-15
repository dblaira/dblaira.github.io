"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";

const CONFIG_KEY = "default";

export interface EmotionConfig {
  emotionLabels: Record<string, string>;
  triggerLabels: Record<string, string>;
}

const DEFAULT_CONFIG: EmotionConfig = {
  emotionLabels: {},
  triggerLabels: {},
};

async function fetchConfig(): Promise<EmotionConfig> {
  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("emotion_config")
      .select("emotion_labels, trigger_labels")
      .eq("config_key", CONFIG_KEY)
      .single();
    if (error || !data) return DEFAULT_CONFIG;
    return {
      emotionLabels: data.emotion_labels ?? {},
      triggerLabels: data.trigger_labels ?? {},
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

async function persistConfig(config: EmotionConfig) {
  try {
    const sb = getSupabase();
    await sb.from("emotion_config").upsert(
      {
        config_key: CONFIG_KEY,
        emotion_labels: config.emotionLabels,
        trigger_labels: config.triggerLabels,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "config_key" }
    );
  } catch {
    // silent — UI still works with local state
  }
}

export function useEmotionConfig() {
  const [config, setConfig] = useState<EmotionConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    fetchConfig().then(setConfig);
  }, []);

  const setEmotionLabel = useCallback((canonical: string, custom: string) => {
    setConfig((prev) => {
      const next = {
        ...prev,
        emotionLabels: { ...prev.emotionLabels },
      };
      if (custom.trim() === "" || custom.trim() === canonical) {
        delete next.emotionLabels[canonical];
      } else {
        next.emotionLabels[canonical] = custom.trim();
      }
      persistConfig(next);
      return next;
    });
  }, []);

  const setTriggerLabel = useCallback((canonical: string, custom: string) => {
    setConfig((prev) => {
      const next = {
        ...prev,
        triggerLabels: { ...prev.triggerLabels },
      };
      if (custom.trim() === "" || custom.trim() === canonical) {
        delete next.triggerLabels[canonical];
      } else {
        next.triggerLabels[canonical] = custom.trim();
      }
      persistConfig(next);
      return next;
    });
  }, []);

  const getEmotionLabel = useCallback(
    (canonical: string) => config.emotionLabels[canonical] || canonical,
    [config.emotionLabels]
  );

  const getTriggerLabel = useCallback(
    (canonical: string) => config.triggerLabels[canonical] || canonical,
    [config.triggerLabels]
  );

  return { config, getEmotionLabel, getTriggerLabel, setEmotionLabel, setTriggerLabel };
}
