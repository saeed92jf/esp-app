"use client";

import React, { useRef, useState } from "react";
import { useReactFlow, getNodesBounds, getViewportForBounds } from "@xyflow/react";
import {
  Undo2,
  Redo2,
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
  Layers,
  MousePointer2,
  Square,
  Lasso,
  Workflow,
  ImageDown,
  ChevronDown,
  Eraser,
  LibraryBig,
  MousePointerClick,
  Spline,
  Group,
  Eye,
  EyeOff,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  StretchHorizontal,
  StretchVertical,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useDiagramStore } from "../store";
import { layoutWithDagre, layoutWithElk, type LayoutDirection } from "../utils/layout";
import { cn } from "@/lib/utils";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

// ── Reusable toolbar button ──────────────────────────────────────────────
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

// ── Visual separator between toolbar groups ──────────────────────────────
function Divider() {
  return <div className="mx-1 h-5 w-px bg-border" />;
}

/** Falls back to plain English if a `Flow.<key>` translation is missing yet. */
function safeT(t: ReturnType<typeof useTranslations>, key: string, fallback: string): string {
  try {
    return t(key);
  } catch {
    return fallback;
  }
}



// Large diagrams risk a slow/crashing export or layout pass — warn instead
// of silently hanging the tab.
const CROWDED_THRESHOLD = 300;
function warnIfCrowded(t: ReturnType<typeof useTranslations>) {
  const { nodes, edges } = useDiagramStore.getState();
  if (nodes.length + edges.length > CROWDED_THRESHOLD) {
    toast.warning(
      safeT(
        t,
        "toolbar.crowdedWarning",
        "This diagram is large — exporting or generating an image may be slow or crash the tab.",
      ),
    );
  }
}

// ── Toolbar ──────────────────────────────────────────────────────────────
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Diagram templates, listed from public/diagrams (see the API route at
  //     src/app/api/diagrams/route.ts, which walks that folder recursively —
  //     any .json saved anywhere under public/diagrams shows up here). ──────
  const [templateOptions, setTemplateOptions] = useState<ComboboxOption[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  // The shared Combobox component toggles OFF (calls onChange("")) when you
  // click the item that's already selected, instead of re-firing with the
  // same value — so re-picking the same template to reload it needs this to
  // remember what was actually loaded last.
  const lastLoadedTemplateRef = useRef("");
  // Set right before our own importJSON() call, so the very next nodes/edges
  // change (which is that same load taking effect) doesn't get mistaken for
  // a user edit and immediately clear the just-set selection.
  const skipNextCanvasChangeRef = useRef(false);

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

  // Once a template is loaded, editing the canvas at all (drag a node, type
  // a label, delete something, ...) clears the combobox back to its
  // placeholder — the canvas no longer matches that template, so it
  // shouldn't still look "selected". This also naturally lets re-picking the
  // same template from a blank combobox state work as a normal selection.
  const canvasNodes = useDiagramStore((s) => s.nodes);
  const canvasEdges = useDiagramStore((s) => s.edges);
  React.useEffect(() => {
    if (skipNextCanvasChangeRef.current) {
      skipNextCanvasChangeRef.current = false;
      return;
    }
    setSelectedTemplate((current) => (current ? "" : current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasNodes, canvasEdges]);

  const handleLoadTemplate = async (relPath: string) => {
    // Empty string arrives when the Combobox's own toggle-off behavior fires
    // (re-clicking the item that's already selected) — treat that the same
    // as re-picking it, and reset+reload that same template.
    const target = relPath || lastLoadedTemplateRef.current;
    if (!target) return;
    if (
      (canvasNodes.length > 0 || canvasEdges.length > 0) &&
      !window.confirm(safeT(t, "toolbar.confirmLoadTemplate", "Load this template? Your current canvas will be replaced."))
    ) {
      return;
    }
    try {
      const res = await fetch(`/diagrams/${target}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      skipNextCanvasChangeRef.current = true;
      importJSON(text);
      lastLoadedTemplateRef.current = target;
      setDiagramName(target.replace(/\.json$/i, "").split("/").pop() ?? target);
      setSelectedTemplate(target);
      toast.success(`${safeT(t, "toolbar.templateLoaded", "Loaded")} "${target}"`);
    } catch (err) {
      toast.error(`${safeT(t, "toolbar.templateLoadFailed", "Could not load")} "${target}"`);
      console.error(err);
    }
  };

  const { fitView, getViewport, screenToFlowPosition } = useReactFlow();

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
  const selectAllNodes = useDiagramStore((s) => s.selectAllNodes);
  const selectAllEdges = useDiagramStore((s) => s.selectAllEdges);
  const selectAllGroups = useDiagramStore((s) => s.selectAllGroups);
  const alignSelectedNodes = useDiagramStore((s) => s.alignSelectedNodes);
  const distributeSelectedNodes = useDiagramStore((s) => s.distributeSelectedNodes);
  const addGuide = useDiagramStore((s) => s.addGuide);
  const clearGuides = useDiagramStore((s) => s.clearGuides);
  const guidesCount = useDiagramStore((s) => s.guides.length);
  const globalHideHandles = useDiagramStore((s) => s.globalHideHandles);
  const toggleGlobalHandles = useDiagramStore((s) => s.toggleGlobalHandles);
  const clearCanvas = useDiagramStore((s) => s.clearCanvas);
  const deleteAllNodes = useDiagramStore((s) => s.deleteAllNodes);
  const deleteAllEdges = useDiagramStore((s) => s.deleteAllEdges);
  const selectionTool = useDiagramStore((s) => s.selectionTool);
  const setSelectionTool = useDiagramStore((s) => s.setSelectionTool);
  const lassoMode = useDiagramStore((s) => s.lassoMode);
  const setLassoMode = useDiagramStore((s) => s.setLassoMode);
  const colorMode = useDiagramStore((s) => s.settings.colorMode);

  // ── Export diagram as downloadable JSON file (save & restore) ────────────
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

  // ── Read selected JSON file and load into store ──────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { nodes, edges } = useDiagramStore.getState();
    if (
      (nodes.length > 0 || edges.length > 0) &&
      !window.confirm(safeT(t, "toolbar.confirmImport", "Import this file? Your current canvas will be replaced."))
    ) {
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importJSON(reader.result as string);
      } catch {
        // Silently swallow invalid JSON — user will see unchanged canvas
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be re-imported if needed
    e.target.value = "";
  };

  // ── Auto-layout (https://reactflow.dev/examples/layout/dagre,
  //     /layout/elkjs, /layout/horizontal) ──────────────────────────────────
  // NEW DEPENDENCIES REQUIRED: `npm install dagre elkjs` (+ `@types/dagre` for
  // TypeScript). Only top-level nodes are repositioned — nodes inside a
  // sub-flow keep their position relative to their group (see utils/layout.ts).
  // If anything is selected, only the selected nodes get rearranged (everything
  // else stays put); with nothing selected, it lays out the whole diagram.
  const runDagreLayout = (direction: LayoutDirection) => {
    warnIfCrowded(t);
    const { nodes, edges, setNodes, pushHistory } = useDiagramStore.getState();
    const selectedIds = new Set(nodes.filter((n) => n.selected).map((n) => n.id));
    setNodes(layoutWithDagre(nodes, edges, direction, selectedIds));
    pushHistory();
    requestAnimationFrame(() => fitView({ duration: 300 }));

  };

  const runElkLayout = async (direction: LayoutDirection) => {
    warnIfCrowded(t);
    const { nodes, edges, setNodes, pushHistory } = useDiagramStore.getState();
    const selectedIds = new Set(nodes.filter((n) => n.selected).map((n) => n.id));

    const laidOut = await layoutWithElk(nodes, edges, direction, selectedIds);
    setNodes(laidOut);
    pushHistory();
    requestAnimationFrame(() => fitView({ duration: 300 }));
  };

  // ── Destructive bulk actions — each guarded by a plain browser confirm() ──
  const handleClearCanvas = () => {

    if (window.confirm("Clear the entire canvas? This removes every node and connection.")) {
      clearCanvas();
    }
  };

  const handleDeleteAllNodes = () => {

    if (window.confirm("Delete all nodes? Their connections will be removed too.")) {
      deleteAllNodes();
    }
  };

  const handleDeleteAllEdges = () => {

    if (window.confirm("Delete all connections? Nodes will stay in place.")) {
      deleteAllEdges();
    }
  };

  // ── Download as image (https://reactflow.dev/examples/misc/download-image) ──
  // NEW DEPENDENCY REQUIRED: `npm install html-to-image`.
  const [isExportingImage, setIsExportingImage] = useState(false);

  const handleDownloadImage = async (format: "png" | "png-transparent" | "svg") => {
    warnIfCrowded(t);
    const { nodes } = useDiagramStore.getState();
    if (nodes.length === 0) return;
    const viewportEl = document.querySelector(".react-flow__viewport") as HTMLElement | null;
    if (!viewportEl) return;

    setIsExportingImage(true);
    // Large diagrams can genuinely take a few seconds to rasterize — without
    // this, the toolbar just sits there with no feedback and looks hung.
    const toastId = toast.loading(safeT(t, "toolbar.exportingImage", "Generating image…"));

    // Hide every connection handle for the duration of the export by default
    // — handles are an editing affordance, not something people want baked
    // into a shared/exported picture of the diagram. Restored afterward
    // regardless of success/failure.
    const prevHideHandles = useDiagramStore.getState().globalHideHandles;
    useDiagramStore.setState({ globalHideHandles: true });
    // Two animation frames so the "hide-all-handles" CSS class has actually
    // been painted before we start capturing the DOM.
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    // A short extra pause before the heavy synchronous clone/rasterize work
    // below, so the "Generating image…" toast has a chance to actually
    // render first — without this the tab can appear to hang before the
    // browser even shows the loading state, which read as a crash even
    // though the download eventually completed.
    await new Promise((r) => setTimeout(r, 50));

    try {
      const { toPng, toSvg } = await import("html-to-image");
      // Fixed logical frame the diagram is fit into, then rendered at a
      // moderate pixel density via pixelRatio — this keeps the exported file
      // sharp without the extreme (and crash-prone) memory spike of a very
      // high pixelRatio on top of an already-large logical canvas.
      const frameWidth = 1600;
      const frameHeight = 1200;
      const bounds = getNodesBounds(nodes);
      const viewport = getViewportForBounds(bounds, frameWidth, frameHeight, 0.2, 2, 0.1);
      const transparent = format === "png-transparent";
      const backgroundColor = transparent ? undefined : colorMode === "dark" ? "#0f172a" : "#ffffff";

      const commonOptions = {
        backgroundColor,
        width: frameWidth,
        height: frameHeight,
        // Lowered from 3 to 2: at pixelRatio 3 the rasterized canvas (4800×3600)
        // was large enough to intermittently freeze/crash the tab before the
        // browser recovered and still triggered the download — 2x keeps the
        // image crisp while cutting the pixel buffer to ~4/9ths the size.
        pixelRatio: format === "svg" ? undefined : 2,
        style: {
          width: `${frameWidth}px`,
          height: `${frameHeight}px`,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
      };

      // SVG-only options: skip embedding every @font-face as base64 (by far
      // the single biggest contributor to bloated/slow SVG exports) and drop
      // chrome elements (minimap/controls/attribution) that the user doesn't
      // see as part of the diagram itself — keeps the exported SVG close to
      // "just the diagram" instead of a full page snapshot.
      const svgOnlyOptions =
        format === "svg"
          ? {
              fontEmbedCSS: "",
              filter: (node: HTMLElement) => {
                const cls = node.classList;
                if (!cls) return true;
                return (
                  !cls.contains("react-flow__minimap") &&
                  !cls.contains("react-flow__controls") &&
                  !cls.contains("react-flow__attribution") &&
                  !cls.contains("react-flow__panel")
                );
              },
            }
          : {};

      const dataUrl =
        format === "svg"
          ? await toSvg(viewportEl, { ...commonOptions, ...svgOnlyOptions })
          : await toPng(viewportEl, commonOptions);

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${diagramName || "diagram"}.${format === "svg" ? "svg" : "png"}`;
      a.click();
      toast.success(safeT(t, "toolbar.imageExported", "Image downloaded"), { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(safeT(t, "toolbar.imageExportFailed", "Could not generate the image"), { id: toastId });
    } finally {
      useDiagramStore.setState({ globalHideHandles: prevHideHandles });
      setIsExportingImage(false);
    }
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

      {/* Diagram templates — loaded from public/diagrams (any subfolder, any
          .json file) via the /api/diagrams route. */}
      <div className="flex items-center gap-1">
        <LibraryBig className="size-4 shrink-0 text-muted-foreground" />
        <Combobox
          options={templateOptions}
          value={selectedTemplate}
          onChange={handleLoadTemplate}
          placeholder={templateOptions.length ? safeT(t, "toolbar.loadTemplate", "Load Template...") : safeT(t, "toolbar.noTemplate", "No template found")}
          searchPlaceholder={safeT(t, "toolbar.searchTemplate", "Search template")}
          emptyText={safeT(t, "toolbar.noTemplatesInFolder", "No diagrams found in public/diagrams.")}
          className="w-44"
        />
      </div>
      <Divider />

      {/* History */}
      <ToolbarButton icon={Undo2} label={t("toolbar.undo")} onClick={undo} disabled={!canUndo} />
      <ToolbarButton icon={Redo2} label={t("toolbar.redo")} onClick={redo} disabled={!canRedo} />
      <Divider />

      {/* Selection tool (https://reactflow.dev/examples/whiteboard/rectangle,
          /whiteboard/lasso-selection): left mouse button behavior on empty canvas */}
      <ToolbarButton icon={MousePointer2} label={safeT(t, "toolbar.pointerPan", "Pointer (pan)")} active={selectionTool === "pointer"} onClick={() => setSelectionTool("pointer")} />
      <ToolbarButton icon={Square} label={safeT(t, "toolbar.boxSelect", "Box select")} active={selectionTool === "box"} onClick={() => setSelectionTool("box")} />
      <ToolbarButton icon={Lasso} label={safeT(t, "toolbar.lassoSelect", "Lasso select")} active={selectionTool === "lasso"} onClick={() => setSelectionTool("lasso")} />
      {/* Lasso hit-test mode — only relevant once lasso is the active tool.
          Partial: selects anything the lasso touches. Full: only nodes it fully encloses. */}
      {selectionTool === "lasso" && (
        <div className="ms-1 flex items-center rounded-md bg-muted p-0.5 text-[11px]">
          <button
            onClick={() => setLassoMode("partial")}
            className={cn(
              "rounded px-2 py-1 font-medium transition-colors",
              lassoMode === "partial" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
            )}
            title={safeT(t, "toolbar.lassoPartial", "Select anything the lasso touches")}
          >
            {safeT(t, "toolbar.lassoPartial", "Partial")}
          </button>
          <button
            onClick={() => setLassoMode("full")}
            className={cn(
              "rounded px-2 py-1 font-medium transition-colors",
              lassoMode === "full" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
            )}
            title={safeT(t, "toolbar.lassoFull", "Only select nodes fully inside the lasso")}
          >
            {safeT(t, "toolbar.lassoFull", "Full")}
          </button>
        </div>
      )}
      <Divider />

      {/* Select-all — each option selects only its own kind (see the store's
          selectAllNodes/selectAllEdges/selectAllGroups: picking one clears
          any other selection so they never mix). */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            title={safeT(t, "toolbar.selectAllTitle", "Select all...")}
            className={cn(
              "flex h-8 items-center gap-0.5 rounded-md px-1.5 transition-colors",
              "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <MousePointerClick className="size-4" />
            <ChevronDown className="size-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          <DropdownMenuItem onClick={() => selectAllNodes()}>
            <Square className="size-3.5" /> {safeT(t, "toolbar.selectAllNodes", "All nodes")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => selectAllEdges()}>
            <Spline className="size-3.5" /> {safeT(t, "toolbar.selectAllEdges", "All connections")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => selectAllGroups()}>
            <Group className="size-3.5" /> {safeT(t, "toolbar.selectAllGroups", "All sub-flows")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Align/distribute — acts on the current multi-selection of nodes. */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            title={safeT(t, "toolbar.align", "Align")}
            className={cn(
              "flex h-8 items-center gap-0.5 rounded-md px-1.5 transition-colors",
              "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <AlignStartVertical className="size-4" />
            <ChevronDown className="size-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          {(
            [
              { edge: "left" as const, icon: AlignStartVertical, label: safeT(t, "toolbar.alignLeft", "Align left") },
              { edge: "centerH" as const, icon: AlignCenterVertical, label: safeT(t, "toolbar.alignCenterH", "Align center (horizontal)") },
              { edge: "right" as const, icon: AlignEndVertical, label: safeT(t, "toolbar.alignRight", "Align right") },
              { edge: "top" as const, icon: AlignStartHorizontal, label: safeT(t, "toolbar.alignTop", "Align top") },
              { edge: "centerV" as const, icon: AlignCenterHorizontal, label: safeT(t, "toolbar.alignCenterV", "Align middle (vertical)") },
              { edge: "bottom" as const, icon: AlignEndHorizontal, label: safeT(t, "toolbar.alignBottom", "Align bottom") },
            ]
          ).map(({ edge, icon: Icon, label }) => (
            <DropdownMenuItem key={edge} onClick={() => alignSelectedNodes(edge)}>
              <Icon className="size-3.5" /> {label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => distributeSelectedNodes("horizontal")}>
            <StretchHorizontal className="size-3.5" /> {safeT(t, "toolbar.distributeH", "Distribute horizontally")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => distributeSelectedNodes("vertical")}>
            <StretchVertical className="size-3.5" /> {safeT(t, "toolbar.distributeV", "Distribute vertically")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Infinite alignment guides — added at the current viewport center;
          drag them on the canvas to reposition, double-click to remove one. */}
      <ToolbarButton
        icon={StretchVertical}
        label={safeT(t, "toolbar.addVerticalGuide", "Add vertical guide")}
        onClick={() => {
          const { x, zoom } = getViewport();
          const centerFlowX = (window.innerWidth / 2 - x) / zoom;
          addGuide("vertical", centerFlowX);
        }}
      />
      <ToolbarButton
        icon={StretchHorizontal}
        label={safeT(t, "toolbar.addHorizontalGuide", "Add horizontal guide")}
        onClick={() => {
          const { y, zoom } = getViewport();
          const centerFlowY = (window.innerHeight / 2 - y) / zoom;
          addGuide("horizontal", centerFlowY);
        }}
      />
      {guidesCount > 0 && (
        <ToolbarButton icon={X} label={safeT(t, "toolbar.clearGuides", "Clear guides")} onClick={clearGuides} />
      )}

      {/* Hide/show every connection handle at once (a single global CSS
          switch — see the "hide-all-handles" class in DiagramCanvas.tsx). */}
      <ToolbarButton
        icon={globalHideHandles ? EyeOff : Eye}
        label={globalHideHandles ? safeT(t, "toolbar.showAllHandles", "Show all handles") : safeT(t, "toolbar.hideAllHandles", "Hide all handles")}
        active={globalHideHandles}
        onClick={toggleGlobalHandles}
      />

      <Divider />

      {/* Sub-flow: wraps the current multi-selection (shift/box/lasso-select) in a
          resizable, collapsible group container — Ctrl/Cmd+G. */}
      <ToolbarButton icon={Layers} label={safeT(t, "toolbar.groupSubflow", "Group into sub-flow (Ctrl+G)")} onClick={groupSelectedNodes} />

      {/* Auto-layout (Dagre / ELK, vertical / horizontal) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            title={safeT(t, "toolbar.autoLayout", "Auto layout")}
            className={cn(
              "flex h-8 items-center gap-0.5 rounded-md px-1.5 transition-colors",
              "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Workflow className="size-4" />
            <ChevronDown className="size-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <div className="px-2 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Dagre</div>
          <DropdownMenuItem onClick={() => runDagreLayout("TB")}>
            {safeT(t, "toolbar.layoutVertical", "Vertical (top → bottom)")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => runDagreLayout("LR")}>
            {safeT(t, "toolbar.layoutHorizontal", "Horizontal (left → right)")}
          </DropdownMenuItem>
          <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">ELK</div>
          <DropdownMenuItem onClick={() => runElkLayout("TB")}>
            {safeT(t, "toolbar.layoutVertical", "Vertical (top → bottom)")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => runElkLayout("LR")}>
            {safeT(t, "toolbar.layoutHorizontal", "Horizontal (left → right)")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Divider />

      {/* Import / Export */}
      <ToolbarButton icon={Download} label={t("dialogs.exportJSON")} onClick={handleExport} />
      <ToolbarButton icon={Upload} label={t("dialogs.importJSON")} onClick={handleImportClick} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            disabled={isExportingImage}
            title={safeT(t, "toolbar.exportImage", "Download as image")}
            className={cn(
              "flex h-8 items-center gap-0.5 rounded-md px-1.5 transition-colors disabled:opacity-50",
              "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <ImageDown className={cn("size-4", isExportingImage && "animate-pulse")} />
            <ChevronDown className="size-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onClick={() => handleDownloadImage("png")}>
            <ImageDown className="size-3.5" /> {safeT(t, "toolbar.exportPngBg", "PNG — with background")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownloadImage("png-transparent")}>
            <ImageDown className="size-3.5" /> {safeT(t, "toolbar.exportPngTransparent", "PNG — transparent")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownloadImage("svg")}>
            <ImageDown className="size-3.5" /> {safeT(t, "toolbar.exportSvg", "SVG (vector)")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Hidden file input — triggered programmatically by handleImportClick */}
      <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileChange} />
      <Divider />

      {/* Destructive bulk actions — each confirms before acting */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            title={safeT(t, "toolbar.clear", "Clear")}
            className="flex h-8 items-center gap-0.5 rounded-md px-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Eraser className="size-4" />
            <ChevronDown className="size-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuItem onClick={handleClearCanvas} variant="destructive">
            {safeT(t, "toolbar.clearCanvas", "Clear entire canvas")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDeleteAllNodes} variant="destructive">
            {safeT(t, "toolbar.deleteAllNodes", "Delete all nodes")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDeleteAllEdges} variant="destructive">
            {safeT(t, "toolbar.deleteAllEdges", "Delete all connections")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Right-side controls ── */}
      <div className="ms-auto flex items-center gap-1">
        {/* Auto-save indicator — shown only while save is in progress */}
        {isSaving && <span className="me-1 text-xs text-muted-foreground">{t("editor.saving")}</span>}

        {/* Editor global settings dialog */}
        <ToolbarButton icon={Settings2} label={t("editorSettings.title")} onClick={onOpenSettings} />

        {/* Toggle right settings panel */}
        <ToolbarButton icon={isSettingsPanelOpen ? PanelRightClose : PanelRight} label={t("editor.settings")} onClick={toggleSettingsPanel} />
      </div>
    </div>
  );
}
