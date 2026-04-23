"use client";

import { useState, useCallback } from "react";
import { getSupabase } from "./supabase";
import { useTheme } from "./useTheme";
import { useEditMode } from "./useEditMode";
import { fillColor, type Fill } from "./fills";

/**
 * One-stop hook for a page that wants edit mode. Returns everything a page
 * needs to wire per-element color/pattern/image overrides against the
 * studio_themes row for its route.
 *
 * Usage in a page body component (must be rendered inside <EditModeProvider>):
 *
 *   const { theme, colorFor, fillFor, saveOverride } = usePageEditing("/mood");
 *
 * Then wrap elements with <Editable id="..." value={fillFor(...)}
 * onChange={(v) => saveOverride("...", "Label", v)}> etc.
 *
 * Optimistic updates mean the page repaints instantly; Supabase persists in
 * the background; the realtime subscription in useTheme reconciles.
 */
export function usePageEditing(route: string) {
  const theme = useTheme(route);
  const edit = useEditMode();
  const [localOverrides, setLocalOverrides] = useState<Record<string, Fill>>({});

  const fillFor = useCallback(
    (elementId: string, fallback: string): Fill =>
      localOverrides[elementId] ?? theme.overrides?.[elementId] ?? fallback,
    [localOverrides, theme.overrides]
  );

  const colorFor = useCallback(
    (elementId: string, fallback: string): string =>
      fillColor(fillFor(elementId, fallback), fallback),
    [fillFor]
  );

  const saveOverride = useCallback(
    async (
      elementId: string,
      label: string,
      next: Fill,
      opts?: { silent?: boolean }
    ): Promise<void> => {
      const previous = localOverrides[elementId] ?? theme.overrides?.[elementId];

      setLocalOverrides((curr) => ({ ...curr, [elementId]: next }));

      const merged: Record<string, Fill> = {
        ...(theme.overrides ?? {}),
        ...localOverrides,
        [elementId]: next,
      };
      await getSupabase()
        .from("studio_themes")
        .update({ overrides: merged })
        .eq("route", route);

      if (!opts?.silent) {
        edit?.showToast({
          label,
          message: "Saved",
          onUndo: async () => {
            if (previous === undefined) {
              setLocalOverrides((curr) => {
                const next = { ...curr };
                delete next[elementId];
                return next;
              });
              const cleared: Record<string, Fill> = {
                ...(theme.overrides ?? {}),
                ...localOverrides,
              };
              delete cleared[elementId];
              await getSupabase()
                .from("studio_themes")
                .update({ overrides: cleared })
                .eq("route", route);
            } else {
              await saveOverride(elementId, label, previous, { silent: true });
            }
          },
        });
      }
    },
    [route, theme.overrides, localOverrides, edit]
  );

  return { theme, edit, colorFor, fillFor, saveOverride };
}
