"use client";

import { ReactNode } from "react";
import { EditModeProvider } from "@/lib/useEditMode";
import { EditColorSheet } from "@/components/EditColorSheet";
import { EditToast } from "@/components/EditToast";

/**
 * One-line setup for edit mode on any page. Wrap the page's body in this and
 * the pencil icon (in SavySiteHeader) + color sheet + undo toast all become
 * available to anything inside.
 */
export function EditingShell({ children }: { children: ReactNode }) {
  return (
    <EditModeProvider>
      {children}
      <EditColorSheet />
      <EditToast />
    </EditModeProvider>
  );
}
