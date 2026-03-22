"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "savy-emotion-config";

export interface EmotionConfig {
  emotionLabels: Record<string, string>;
  triggerLabels: Record<string, string>;
}

const DEFAULT_CONFIG: EmotionConfig = {
  emotionLabels: {},
  triggerLabels: {},
};

function readConfig(): EmotionConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

function writeConfig(config: EmotionConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function useEmotionConfig() {
  const [config, setConfig] = useState<EmotionConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    setConfig(readConfig());
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
      writeConfig(next);
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
      writeConfig(next);
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
