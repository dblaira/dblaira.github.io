"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
  createElement,
} from "react";

import type { Fill } from "./fills";

// A single editable thing identified by a unique string id (e.g. "headline",
// "trend-label", "accent-3", "canvas"). The onChange is provided by whoever
// wrapped the region; it decides where the new fill gets stored.
//
// allowFills controls whether the sheet shows only the Color tab (false —
// text elements) or all three tabs Color/Pattern/Image (true — cards, page
// background).
export type ActiveEdit = {
  id: string;
  label: string;
  description: string;
  currentValue: Fill;
  onChange: (next: Fill) => void;
  allowFills?: boolean;
};

export type EditToast = {
  id: number;
  label: string;
  message: string;
  // Called when the user taps Undo inside the toast. Provided by whoever
  // called showToast; typically reverts the change by re-saving the previous
  // value.
  onUndo?: () => void | Promise<void>;
};

type EditModeContextValue = {
  enabled: boolean;
  toggle: () => void;
  active: ActiveEdit | null;
  setActive: (edit: ActiveEdit | null) => void;
  toast: EditToast | null;
  showToast: (toast: Omit<EditToast, "id">) => void;
  dismissToast: () => void;
  recentColors: string[];
  addRecentColor: (hex: string) => void;
};

const Ctx = createContext<EditModeContextValue | null>(null);

const RECENT_KEY = "savy.editMode.recentColors";
const RECENT_MAX = 6;

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((v) => typeof v === "string").slice(0, RECENT_MAX);
  } catch {
    // ignore
  }
  return [];
}

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState<ActiveEdit | null>(null);
  const [toast, setToast] = useState<EditToast | null>(null);
  const [recentColors, setRecentColors] = useState<string[]>(() => loadRecent());

  const toggle = useCallback(() => {
    setEnabled((v) => !v);
    setActive(null);
    setToast(null);
  }, []);

  const showToast = useCallback((t: Omit<EditToast, "id">) => {
    setToast({ ...t, id: Date.now() });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const addRecentColor = useCallback((hex: string) => {
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
    setRecentColors((prev) => {
      const next = [hex, ...prev.filter((c) => c.toUpperCase() !== hex.toUpperCase())].slice(0, RECENT_MAX);
      try {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        // ignore quota errors
      }
      return next;
    });
  }, []);

  // Auto-dismiss the toast after ~4s.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast((curr) => (curr && curr.id === toast.id ? null : curr)), 4200);
    return () => clearTimeout(t);
  }, [toast]);

  // Escape key: close the active sheet if one is open; otherwise exit edit mode.
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (active) setActive(null);
      else setEnabled(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, active]);

  return createElement(
    Ctx.Provider,
    {
      value: {
        enabled,
        toggle,
        active,
        setActive,
        toast,
        showToast,
        dismissToast,
        recentColors,
        addRecentColor,
      },
    },
    children
  );
}

export function useEditMode(): EditModeContextValue | null {
  return useContext(Ctx);
}
