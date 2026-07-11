"use client";

import React, { useRef, useState } from "react";
import { useReactFlow, getNodesBounds, getViewportForBounds } from "@xyflow/react";
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Save,
  FolderOpen,
  FilePlus2,
  Download,
  Upload,
  Settings2,
  PanelLeftClose,
  PanelLeft,
  PanelRightClose,
  PanelRight,
  Globe,
  Check,
  Layers,
  MousePointer2,
  Square,
  Lasso,
  Workflow,
  ImageDown,
  ChevronDown,
  Eraser,
  LibraryBig,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useDiagramStore } from "../store";
import { layoutWithDagre, layoutWithElk, type LayoutDirection } from "../utils/layout";
import { cn } from "@/lib/utils";
import { Combobox, type ComboboxOption } from "@/components/ui-custom/combobox";

// â”€â”€ Supported locales â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const LOCALES = [
  { code: "en", label: "English" },
  { code: "fa", label: "ÙØ§Ø±Ø³ÛŒ" },
] as const;

type SupportedLocale = (typeof LOCALES)[number]["code"];

// â”€â”€ Reusable toolbar button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Uses semantic design tokens so it adapts to light/dark mode automatically.
function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={cn(
        "flex size-8 items-center justify-center rounded-md transition-colors",
        "text-muted-foreground hover:bg-accent hover:text-foreground",
        "disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent",
        // Active state uses a subtle primary tint
        active && "bg-primary/10 text-primary hover:bg-primary/20",
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

// â”€â”€ Visual separator between toolbar groups â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Divider() {
  return <div className="mx-1 h-5 w-px bg-border" />;
}

// â”€â”€ Toolbar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function Toolbar({
  onOpenLibrary,
  onOpenNew,
  onSave,
  onOpenSettings,
}: {
  onOpenLibrary: () => void;
  onOpenNew: () => void;
  onSave: () => void;
  onOpenSettings: () => void;
}) {
  const t = useTranslations("Flow");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const pathname = usePathname();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [layoutMenuOpen, setLayoutMenuOpen] = useState(false);
  const [clearMenuOpen, setClearMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // â”€â”€ Diagram templates, listed from public/diagrams (see the API route at
  //     src/app/api/diagrams/route.ts, which walks that folder recursively â€”
  //     any .json saved anywhere under public/diagrams shows up here). â”€â”€â”€â”€â”€â”€
  const [templateOptions, setTemplateOptions] = useState<ComboboxOption[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/diagrams")
      .then((r) => (r.ok ? r.json() : { files: [] }))
      .then((data: { files?: string[] }) => {
        if (cancelled) return;
        const files = data.files ?? [];
        setTemplateOptions(files.map((f) => ({ value: f, label: f.replace(/\.json$/i, "") })));
      })
      .catch(() => { if (!cancelled) setTemplateOptions([]); });
    return () => { cancelled = true; };
  }, []);

  const handleLoadTemplate = async (relPath: string) => {
    if (!relPath) return;
    try {
      const res = await fetch(`/diagrams/${relPath}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      importJSON(text);
      setDiagramName(relPath.replace(/\.json$/i, "").split("/").pop() ?? relPath);
      setSelectedTemplate(relPath);
      toast.success(`Loaded "${relPath}"`);
    } catch (err) {
      toast.error(`Could not load "${relPath}"`);
      console.error(err);
    }
  };

  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const diagramName = useDiagramStore((s) => s.diagramName);
  const setDiagramName = useDiagramStore((s) => s.setDiagramName);
  const undo = useDiagramStore((s) => s.undo);
  const redo = useDiagramStore((s) => s.redo);
  const canUndo = useDiagramStore((s) => s.canUndo());
  const canRedo = useDiagramStore((s) => s.canRedo());
  const isPalettOpen = useDiagramStore((s) => s.isPalettOpen);
  const togglePalette = useDiagramStore((s) => s.togglePalette);
  const isSettingsPanelOpen = useDiagramStore((s) => s.isSettingsPanelOpen);
  const toggleSettingsPanel = useDiagramStore((s) => s.toggleSettingsPanel);
  const exportJSON = useDiagramStore((s) => s.exportJSON);
  const importJSON = useDiagramStore((s) => s.importJSON);
  const isSaving = useDiagramStore((s) => s.isSaving);
  const groupSelectedNodes = useDiagramStore((s) => s.groupSelectedNodes);
  const clearCanvas = useDiagramStore((s) => s.clearCanvas);
  const deleteAllNodes = useDiagramStore((s) => s.deleteAllNodes);
  const deleteAllEdges = useDiagramStore((s) => s.deleteAllEdges);
  const selectionTool = useDiagramStore((s) => s.selectionTool);
  const setSelectionTool = useDiagramStore((s) => s.setSelectionTool);
  const lassoMode = useDiagramStore((s) => s.lassoMode);
  const setLassoMode = useDiagramStore((s) => s.setLassoMode);
  const colorMode = useDiagramStore((s) => s.settings.colorMode);

  // â”€â”€ Export diagram as downloadable JSON file (save & restore) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleExport = () => {
    const json = exportJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${diagramName || "diagram"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  // â”€â”€ Read selected JSON file and load into store â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importJSON(reader.result as string);
      } catch {
        // Silently swallow invalid JSON â€” user will see unchanged canvas
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be re-imported if needed
    e.target.value = "";
  };

  // â”€â”€ Switch locale by replacing the locale segment in the current URL â”€â”€â”€â”€â”€
  // Pathname starts with "/<locale>/...", so segments[1] is the locale code.
  const handleLocaleChange = (newLocale: SupportedLocale) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
    setLangMenuOpen(false);
  };

  // â”€â”€ Auto-layout (https://reactflow.dev/examples/layout/dagre,
  //     /layout/elkjs, /layout/horizontal) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // NEW DEPENDENCIES REQUIRED: `npm install dagre elkjs` (+ `@types/dagre` for
  // TypeScript). Only top-level nodes are repositioned â€” nodes inside a
  // sub-flow keep their position relative to their group (see utils/layout.ts).
  const runDagreLayout = (direction: LayoutDirection) => {
    const { nodes, edges, setNodes, pushHistory } = useDiagramStore.getState();
    setNodes(layoutWithDagre(nodes, edges, direction));
    pushHistory();
    requestAnimationFrame(() => fitView({ duration: 300 }));
    setLayoutMenuOpen(false);
  };

  const runElkLayout = async (direction: LayoutDirection) => {
    const { nodes, edges, setNodes, pushHistory } = useDiagramStore.getState();
    setLayoutMenuOpen(false);
    const laidOut = await layoutWithElk(nodes, edges, direction);
    setNodes(laidOut);
    pushHistory();
    requestAnimationFrame(() => fitView({ duration: 300 }));
  };

  // â”€â”€ Destructive bulk actions â€” each guarded by a plain browser confirm() â”€â”€
  const handleClearCanvas = () => {
    setClearMenuOpen(false);
    if (window.confirm("Clear the entire canvas? This removes every node and connection.")) {
      clearCanvas();
    }
  };

  const handleDeleteAllNodes = () => {
    setClearMenuOpen(false);
    if (window.confirm("Delete all nodes? Their connections will be removed too.")) {
      deleteAllNodes();
    }
  };

  const handleDeleteAllEdges = () => {
    setClearMenuOpen(false);
    if (window.confirm("Delete all connections? Nodes will stay in place.")) {
      deleteAllEdges();
    }
  };

  // â”€â”€ Download as image (https://reactflow.dev/examples/misc/download-image) â”€â”€
  // NEW DEPENDENCY REQUIRED: `npm install html-to-image`.
  const handleDownloadImage = async () => {
    const { nodes } = useDiagramStore.getState();
    if (nodes.length === 0) return;
    const viewportEl = document.querySelector(".react-flow__viewport") as HTMLElement | null;
    if (!viewportEl) return;

    const { toPng } = await import("html-to-image");
    const imageWidth = 1600;
    const imageHeight = 1200;
    const bounds = getNodesBounds(nodes);
    const viewport = getViewportForBounds(bounds, imageWidth, imageHeight, 0.2, 2, 0.1);

    const dataUrl = await toPng(viewportEl, {
      backgroundColor: colorMode === "dark" ? "#0f172a" : "#ffffff",
      width: imageWidth,
      height: imageHeight,
      style: {
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    });

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${diagramName || "diagram"}.png`;
    a.click();
  };

  return (
    <div className="flex h-12 items-center gap-1 border-b border-border bg-background px-2">
      {/* Toggle left palette panel */}
      <ToolbarButton icon={isPalettOpen ? PanelLeftClose : PanelLeft} label={t("palette.basic")} onClick={togglePalette} />
      <Divider />

      {/* Editable diagram name */}
      <input
        value={diagramName}
        onChange={(e) => setDiagramName(e.target.value)}
        className={cn(
          "w-44 rounded-md border border-transparent bg-transparent px-2 py-1",
          "text-sm font-medium text-foreground outline-none",
          "hover:border-input hover:bg-muted",
          "focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary",
        )}
      />
      <Divider />

      {/* File operations */}
      <ToolbarButton icon={FilePlus2} label={t("editor.newDiagram")} onClick={onOpenNew} />
      <ToolbarButton icon={FolderOpen} label={t("editor.openDiagrams")} onClick={onOpenLibrary} />
      <ToolbarButton icon={Save} label={t("editor.save")} onClick={onSave} />
      <Divider />

      {/* Diagram templates â€” loaded from public/diagrams (any subfolder, any
          .json file) via the /api/diagrams route. */}
      <div className="flex items-center gap-1">
        <LibraryBig className="size-4 shrink-0 text-muted-foreground" />
        <Combobox
          options={templateOptions}
          value={selectedTemplate}
          onChange={handleLoadTemplate}
          placeholder={templateOptions.length ? "Templates..." : "No templates found"}
          searchPlaceholder="Search templates..."
          emptyText="No diagrams found in public/diagrams."
          className="w-44"
        />
      </div>
      <Divider />

      {/* History */}
      <ToolbarButton icon={Undo2} label={t("toolbar.undo")} onClick={undo} disabled={!canUndo} />
      <ToolbarButton icon={Redo2} label={t("toolbar.redo")} onClick={redo} disabled={!canRedo} />
      <Divider />

      {/* Viewport controls */}
      <ToolbarButton icon={ZoomIn} label={t("toolbar.zoomIn")} onClick={() => zoomIn()} />
      <ToolbarButton icon={ZoomOut} label={t("toolbar.zoomOut")} onClick={() => zoomOut()} />
      <ToolbarButton icon={Maximize} label={t("toolbar.fitView")} onClick={() => fitView({ duration: 300 })} />
      <Divider />

      {/* Selection tool (https://reactflow.dev/examples/whiteboard/rectangle,
          /whiteboard/lasso-selection): left mouse button behavior on empty canvas */}
      <ToolbarButton icon={MousePointer2} label="Pointer (pan)" active={selectionTool === "pointer"} onClick={() => setSelectionTool("pointer")} />
      <ToolbarButton icon={Square} label="Box select" active={selectionTool === "box"} onClick={() => setSelectionTool("box")} />
      <ToolbarButton icon={Lasso} label="Lasso select" active={selectionTool === "lasso"} onClick={() => setSelectionTool("lasso")} />
      {/* Lasso hit-test mode â€” only relevant once lasso is the active tool.
          Partial: selects anything the lasso touches. Full: only nodes it fully encloses. */}
      {selectionTool === "lasso" && (
        <div className="ms-1 flex items-center rounded-md bg-muted p-0.5 text-[11px]">
          <button
            onClick={() => setLassoMode("partial")}
            className={cn(
              "rounded px-2 py-1 font-medium transition-colors",
              lassoMode === "partial" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
            )}
            title="Select anything the lasso touches"
          >
            Partial
          </button>
          <button
            onClick={() => setLassoMode("full")}
            className={cn(
              "rounded px-2 py-1 font-medium transition-colors",
              lassoMode === "full" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
            )}
            title="Only select nodes fully inside the lasso"
          >
            Full
          </button>
        </div>
      )}
      <Divider />

      {/* Sub-flow: wraps the current multi-selection (shift/box/lasso-select) in a
          resizable, collapsible group container â€” Ctrl/Cmd+G. */}
      <ToolbarButton icon={Layers} label="Group into sub-flow (Ctrl+G)" onClick={groupSelectedNodes} />

      {/* Auto-layout (Dagre / ELK, vertical / horizontal) */}
      <div className="relative">
        <button
          onClick={() => setLayoutMenuOpen((o) => !o)}
          title="Auto layout"
          className={cn(
            "flex h-8 items-center gap-0.5 rounded-md px-1.5 transition-colors",
            "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <Workflow className="size-4" />
          <ChevronDown className="size-3" />
        </button>
        {layoutMenuOpen && (
          <div
            className="absolute top-9 start-0 z-20 w-48 rounded-md border border-border bg-popover py-1 shadow-md"
            onMouseLeave={() => setLayoutMenuOpen(false)}
          >
            <p className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Dagre</p>
            <button onClick={() => runDagreLayout("TB")} className="flex w-full items-center px-3 py-1.5 text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground">
              Vertical (top â†’ bottom)
            </button>
            <button onClick={() => runDagreLayout("LR")} className="flex w-full items-center px-3 py-1.5 text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground">
              Horizontal (left â†’ right)
            </button>
            <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">ELK</p>
            <button onClick={() => runElkLayout("TB")} className="flex w-full items-center px-3 py-1.5 text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground">
              Vertical (top â†’ bottom)
            </button>
            <button onClick={() => runElkLayout("LR")} className="flex w-full items-center px-3 py-1.5 text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground">
              Horizontal (left â†’ right)
            </button>
          </div>
        )}
      </div>
      <Divider />

      {/* Import / Export */}
      <ToolbarButton icon={Download} label={t("dialogs.exportJSON")} onClick={handleExport} />
      <ToolbarButton icon={Upload} label={t("dialogs.importJSON")} onClick={handleImportClick} />
      <ToolbarButton icon={ImageDown} label="Download as image" onClick={handleDownloadImage} />
      {/* Hidden file input â€” triggered programmatically by handleImportClick */}
      <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileChange} />
      <Divider />

      {/* Destructive bulk actions â€” each confirms before acting */}
      <div className="relative">
        <button
          onClick={() => setClearMenuOpen((o) => !o)}
          title="Clear"
          className="flex h-8 items-center gap-0.5 rounded-md px-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Eraser className="size-4" />
          <ChevronDown className="size-3" />
        </button>
        {clearMenuOpen && (
          <div
            className="absolute top-9 start-0 z-20 w-52 rounded-md border border-border bg-popover py-1 shadow-md"
            onMouseLeave={() => setClearMenuOpen(false)}
          >
            <button
              onClick={handleClearCanvas}
              className="flex w-full items-center px-3 py-1.5 text-xs text-popover-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              Clear entire canvas
            </button>
            <button
              onClick={handleDeleteAllNodes}
              className="flex w-full items-center px-3 py-1.5 text-xs text-popover-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              Delete all nodes
            </button>
            <button
              onClick={handleDeleteAllEdges}
              className="flex w-full items-center px-3 py-1.5 text-xs text-popover-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              Delete all connections
            </button>
          </div>
        )}
      </div>

      {/* â”€â”€ Right-side controls â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="ms-auto flex items-center gap-1">
        {/* Auto-save indicator â€” shown only while save is in progress */}
        {isSaving && <span className="me-1 text-xs text-muted-foreground">{t("editor.saving")}</span>}

        {/* Language switcher dropdown */}
        <div className="relative">
          <ToolbarButton icon={Globe} label="Language" onClick={() => setLangMenuOpen((o) => !o)} />
          {langMenuOpen && (
            // end-0 is a logical property: left-0 in RTL, right-0 in LTR
            <div
              className="absolute top-9 end-0 z-20 w-32 rounded-md border border-border bg-popover py-1 shadow-md"
              onMouseLeave={() => setLangMenuOpen(false)}
            >
              {LOCALES.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => handleLocaleChange(code)}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  {label}
                  {/* Checkmark for the currently active locale */}
                  {locale === code && <Check className="size-3 text-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Editor global settings dialog */}
        <ToolbarButton icon={Settings2} label={t("editorSettings.title")} onClick={onOpenSettings} />

        {/* Toggle right settings panel */}
        <ToolbarButton icon={isSettingsPanelOpen ? PanelRightClose : PanelRight} label={t("editor.settings")} onClick={toggleSettingsPanel} />
      </div>
    </div>
  );
}


