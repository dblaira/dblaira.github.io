"use client";

import { createContext, useContext, useState, ReactNode, createElement } from "react";

// The kinds of things that can be edited in-page. "accent" picks a slot in the
// theme.accents array; "canvas" edits the page background field.
export type EditableKind =
  | { type: "canvas" }
  | { type: "accent"; slot: number };

export type ActiveEdit = {
  kind: EditableKind;
  label: string;
  description: string;
  currentValue: string;
  onChange: (next: string) => void;
};

type EditModeContextValue = {
  enabled: boolean;
  toggle: () => void;
  active: ActiveEdit | null;
  setActive: (edit: ActiveEdit | null) => void;
};

const Ctx = createContext<EditModeContextValue | null>(null);

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState<ActiveEdit | null>(null);
  return createElement(
    Ctx.Provider,
    {
      value: {
        enabled,
        toggle: () => {
          setEnabled((v) => !v);
          setActive(null);
        },
        active,
        setActive,
      },
    },
    children
  );
}

export function useEditMode(): EditModeContextValue | null {
  return useContext(Ctx);
}
