// src/app/diagram/page.tsx
// Next.js page that hosts the diagram editor.
// Handles save/load persistence via localStorage as a simple demo.

"use client";

import React, { useCallback } from "react";
import { DiagramEditor } from "@/modules/diagram-editor";
import type { DiagramDocument } from "@/modules/diagram-editor";

const STORAGE_KEY = "diagram-editor-autosave";

export default function DiagramPage() {
  // Load persisted diagram from localStorage on mount
  const getInitialDocument = (): DiagramDocument | undefined => {
    if (typeof window === "undefined") return undefined;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : undefined;
    } catch {
      return undefined;
    }
  };

  // Auto-save to localStorage on every change
  const handleChange = useCallback((doc: DiagramDocument) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    } catch {
      // Storage quota exceeded or unavailable — fail silently
    }
  }, []);

  // Explicit save handler (Ctrl+S) — could POST to an API here
  const handleSave = useCallback((doc: DiagramDocument) => {
    console.log("Saving diagram:", doc.id, doc.name);
    // TODO: replace with actual API call
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
  }, []);

  return (
    <DiagramEditor
      initialDocument={getInitialDocument()}
      onChange={handleChange}
      onSave={handleSave}
      height="100dvh"
    />
  );
}
