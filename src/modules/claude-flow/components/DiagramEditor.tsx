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
import { cn } from "@/lib/utils";

// Ã¢â€â‚¬Ã¢â€â‚¬ Transient save-confirmation toast Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
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

// Ã¢â€â‚¬Ã¢â€â‚¬ Inner shell Ã¢â‚¬â€ must be a descendant of ReactFlowProvider Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function EditorShell() {
  const t = useTranslations("Flow");
  const locale = useLocale();

  const isPalettOpen = useDiagramStore((s) => s.isPalettOpen);
  const isSettingsPanelOpen = useDiagramStore((s) => s.isSettingsPanelOpen);
  const selectedNodeId = useDiagramStore((s) => s.selectedNodeId);
  const selectedEdgeId = useDiagramStore((s) => s.selectedEdgeId);
  const saveDiagram = useDiagramStore((s) => s.saveDiagram);
  const autoSave = useDiagramStore((s) => s.settings.autoSave);
  const nodes = useDiagramStore((s) => s.nodes);
  const edges = useDiagramStore((s) => s.edges);
  const recomputeValues = useDiagramStore((s) => s.recomputeValues);
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

  // Computing flows: re-derive every operatorNode's result whenever the graph
  // topology or any numberNode/operatorNode data changes. recomputeValues()
  // is a no-op (skips its own setState) when nothing actually changed, so
  // this is safe to run on every nodes/edges change without looping.
  // See https://reactflow.dev/learn/advanced-use/computing-flows
  useEffect(() => {
    recomputeValues();
  }, [nodes, edges, recomputeValues]);

  // Settings panel opens automatically the moment something is selected
  // (a node, an edge, or a multi-node box/lasso selection) and closes again
  // the moment the selection is cleared â€” no manual toggling needed.
  const hasSelection = selectedNodeId !== null || selectedEdgeId !== null || nodes.some((n) => n.selected);
  useEffect(() => {
    useDiagramStore.setState({ isSettingsPanelOpen: hasSelection });
  }, [hasSelection]);

  // Theme sync: colorMode now FOLLOWS the site's own global dark/light
  // setting instead of being a separate manual toggle â€” same principle as
  // any other themed component in the app. Tailwind dark mode almost always
  // works by toggling a `dark` class on <html> (or sometimes <body>), so we
  // watch that directly via MutationObserver â€” this works regardless of
  // *which* theme-switcher mechanism (next-themes, a custom store, etc.) the
  // rest of the site uses to flip that class, no extra dependency needed.
  // prefers-color-scheme is kept as a fallback for the (rarer) case where the
  // site defers entirely to the OS setting instead of an explicit class.
  useEffect(() => {
    const root = document.documentElement;

    const syncFromDom = () => {
      const isDark = root.classList.contains("dark");
      useDiagramStore.setState((s) => (s.settings.colorMode === (isDark ? "dark" : "light") ? s : { settings: { ...s.settings, colorMode: isDark ? "dark" : "light" } }));
    };

    syncFromDom();

    const observer = new MutationObserver(syncFromDom);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    // Fallback for sites that rely purely on the OS preference with no class toggle at all.
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onMediaChange = () => {
      if (!root.classList.contains("dark") && !root.classList.contains("light")) syncFromDom();
    };
    media.addEventListener("change", onMediaChange);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", onMediaChange);
    };
  }, []);

  // Global keyboard shortcut: Ctrl/Cmd+S Ã¢â€ â€™ manual save with toast
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

  // dir is derived from next-intl locale Ã¢â‚¬â€ no local language state needed
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
        {/* Settings panel slides in/out from the end edge (right in LTR, left in
            RTL). Always mounted â€” width+translate are what animate, not
            mount/unmount â€” so internal state (scroll position, refs) survives
            open/close and the slide has something to actually transition.
            min-w-0 is required here: flex items default to min-width:auto,
            which means this container couldn't actually shrink below the
            fixed w-72 child's intrinsic width even while animating to w-0 â€”
            that's what left a stray fixed-width container behind visually. */}
        <div
          className={cn(
            "h-full min-w-0 shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out",
            isSettingsPanelOpen ? "w-72" : "w-0",
          )}
        >
          <div
            className={cn(
              "h-full w-72 transition-transform duration-300 ease-in-out",
              isSettingsPanelOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full",
            )}
          >
            <SettingsPanel />
          </div>
        </div>
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

// Ã¢â€â‚¬Ã¢â€â‚¬ Public API Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// `defaultLanguage` is intentionally absent Ã¢â‚¬â€ locale is controlled entirely
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





