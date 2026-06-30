// src/modules/diagram-editor/DiagramEditor.tsx
// Root component for the diagram editor module.
// Composes Toolbar, NodePalette, Canvas, InspectorPanel, and StatusBar
// into a complete editor layout.

"use client";

import React, { useEffect } from "react";
import { ReactFlowProvider } from "@xyflow/react";
// src/modules/diagram-editor/DiagramEditor.tsx (ادامه)

import { NodePalette } from "./components/NodePalette/NodePalette";
import { DiagramCanvas } from "./components/Canvas/DiagramCanvas";
import { StatusBar } from "./components/StatusBar/StatusBar";
import { DiagramNameEditor } from "./components/Header/DiagramNameEditor";
import { useDiagramStore } from "./store/diagramStore";
import type { DiagramDocument } from "./types/diagram.types";
import InspectorPanel from "./components/Inspector/InspectorPanel";

interface DiagramEditorProps {
  /** Initial document to load on mount (optional) */
  initialDocument?: DiagramDocument;
  /** Called whenever the diagram changes — receives the latest document */
  onChange?: (doc: DiagramDocument) => void;
  /** Called when user explicitly requests a save (Ctrl+S) */
  onSave?: (doc: DiagramDocument) => void;
  /** Fixed height for the editor container; defaults to 100vh */
  height?: string;
  /** Whether to show the minimap */
  showMinimap?: boolean;
  /** Whether the editor is in read-only mode */
  readOnly?: boolean;
}

export const DiagramEditor: React.FC<DiagramEditorProps> = ({
  initialDocument,
  onChange,
  onSave,
  height = "100vh",
  readOnly = false,
}) => {
  const { loadDocument, buildDocument, nodes, edges, isDirty } =
    useDiagramStore();

  // Load initial document on mount if provided
  useEffect(() => {
    if (initialDocument) {
      loadDocument(initialDocument);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Notify parent of changes whenever nodes/edges update
  useEffect(() => {
    if (onChange && isDirty) {
      onChange(buildDocument());
    }
  }, [nodes, edges, isDirty]); // eslint-disable-line react-hooks/exhaustive-deps

  // Global Ctrl+S save handler
  useEffect(() => {
    if (!onSave) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        onSave(buildDocument());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSave, buildDocument]);

  return (
    <div
      className="flex flex-col bg-background text-foreground overflow-hidden"
      style={{ height }}
      role="main"
      aria-label="ویرایشگر دیاگرام"
    >
      {/* ── Top header bar: name editor + toolbar ── */}
      <header
        className="flex items-center gap-2 px-3 py-2 border-b border-border
                   bg-background/95 backdrop-blur-sm shrink-0 z-10"
      >
        <DiagramNameEditor />
        <div className="w-px h-5 bg-border mx-1" aria-hidden="true" />
      </header>

      {/* ── Main content area: palette + canvas + inspector ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Node palette — left sidebar */}
        {!readOnly && (
          <aside
            className="w-36 shrink-0 overflow-hidden"
            aria-label="پنل اشکال"
          >
            <NodePalette />
          </aside>
        )}

        {/* Canvas — center fill */}
        <main className="flex-1 overflow-hidden relative">
          <DiagramCanvas />
        </main>

        {/* Inspector panel — right sidebar */}
        <aside
          className="w-64 shrink-0 overflow-hidden border-s border-border"
          aria-label="پنل خصوصیات"
        >
          <InspectorPanel readOnly={readOnly} />
        </aside>
      </div>

      {/* ── Status bar at the bottom ── */}
      <StatusBar />
    </div>
  );
};

// ─── Wrapped export with ReactFlowProvider ────────────────────────────────────
// ReactFlowProvider must wrap any component that uses useReactFlow hooks.
// We export this as the public API of the module.

export const DiagramEditorWithProvider: React.FC<DiagramEditorProps> = (
  props,
) => {
  return (
    <ReactFlowProvider>
      <DiagramEditor {...props} />
    </ReactFlowProvider>
  );
};
