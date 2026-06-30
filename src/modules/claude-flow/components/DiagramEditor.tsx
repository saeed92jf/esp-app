"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { useDiagramStore } from "../store";
import { Toolbar } from "./Toolbar";
import { NodePalette } from "./NodePalette";
import { SettingsPanel } from "./SettingsPanel";
import { DiagramCanvas } from "./DiagramCanvas";
import { NewDiagramDialog, DiagramLibraryDialog } from "./Dialogs";
import { EditorSettingsDialog } from "./EditorSettingsDialog";
import { Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

// ── Transient save-confirmation toast ─────────────────────────────────────────
// Rendered at the bottom-center of the viewport; invisible when message is null.
function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    // Use flex + justify-center on a full-width fixed strip to avoid
    // manual translate hacks that break under RTL logical properties.
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-60 flex justify-center">
      <div className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-lg">
        <Check className="size-3.5 text-emerald-400" />
        {message}
      </div>
    </div>
  );
}

// ── Inner shell — must be a descendant of ReactFlowProvider ──────────────────
function EditorShell() {
  const t = useTranslations("Flow");
  const locale = useLocale();

  const isPalettOpen = useDiagramStore((s) => s.isPalettOpen);
  const isSettingsPanelOpen = useDiagramStore((s) => s.isSettingsPanelOpen);
  const saveDiagram = useDiagramStore((s) => s.saveDiagram);
  const autoSave = useDiagramStore((s) => s.settings.autoSave);
  const nodes = useDiagramStore((s) => s.nodes);
  const edges = useDiagramStore((s) => s.edges);
  // NOTE: colorMode is consumed by DiagramCanvas via the store directly;
  //       no need to read it here.

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showLibraryDialog, setShowLibraryDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Shared helper: save + show toast for2 seconds
  const triggerSave = useCallback(() => {
    saveDiagram();
    setToast(t("messages.savedSuccessfully"));
    setTimeout(() => setToast(null), 2000);
  }, [saveDiagram, t]);

  // Auto-save: debounced1.5 s after any node/edge mutation when enabled
  useEffect(() => {
    if (!autoSave || nodes.length === 0) return;
    const id = setTimeout(() => saveDiagram(), 1500);
    return () => clearTimeout(id);
  }, [autoSave, nodes, edges, saveDiagram]);

  // Global keyboard shortcut: Ctrl/Cmd+S → manual save with toast
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        triggerSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [triggerSave]);

  // dir is derived from next-intl locale — no local language state needed
  const dir = locale === "fa" ? "rtl" : "ltr";

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden bg-background"
      dir={dir}
    >
      <Toolbar
        onOpenLibrary={() => setShowLibraryDialog(true)}
        onOpenNew={() => setShowNewDialog(true)}
        onSave={triggerSave}
        onOpenSettings={() => setShowSettingsDialog(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {isPalettOpen && <NodePalette />}
        <div className="relative flex-1">
          <DiagramCanvas />
        </div>
        {isSettingsPanelOpen && <SettingsPanel />}
      </div>

      {showNewDialog && (
        <NewDiagramDialog onClose={() => setShowNewDialog(false)} />
      )}
      {showLibraryDialog && (
        <DiagramLibraryDialog onClose={() => setShowLibraryDialog(false)} />
      )}
      {showSettingsDialog && (
        <EditorSettingsDialog onClose={() => setShowSettingsDialog(false)} />
      )}

      <Toast message={toast} />
    </div>
  );
}

// ── Public API ────────────────────────────────────────────────────────────────
// `defaultLanguage` is intentionally absent — locale is controlled entirely
// by next-intl URL-routing middleware.
export interface DiagramEditorProps {
  className?: string;
  height?: string | number;
}

export function DiagramEditor({
  className = "",
  height = "100vh",
}: DiagramEditorProps) {
  return (
    <div className={className} style={{ height, width: "100%" }}>
      {/* ReactFlowProvider must wrap EditorShell so useReactFlow() works inside */}
      <ReactFlowProvider>
        <EditorShell />
      </ReactFlowProvider>
    </div>
  );
}
