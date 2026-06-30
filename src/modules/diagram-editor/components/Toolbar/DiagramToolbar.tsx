import React, { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import {
  MousePointer2, Hand, Zap, Undo2, Redo2,
  Trash2, ZoomIn, ZoomOut, Maximize2,
  Download, Upload, RotateCcw, Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDiagramStore } from "../../store/diagramStore";
import { selectCanUndo, selectCanRedo } from "../../store/diagramStore";
import { exportDiagramAsJson } from "../../utils/exportImport";
import { KEYBOARD_SHORTCUTS } from "../../constants/defaults";
interface DiagramToolbarProps {
  onImport: () => void;
  onSave?: () => void;
}
// Top toolbar with mode toggles, undo/redo, zoom controls,
// delete, save, import and export actions.
export default function DiagramToolbar({ onImport, onSave }: DiagramToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const editorMode   = useDiagramStore((s) => s.editorMode);
  const setMode      = useDiagramStore((s) => s.setEditorMode);
  const undo         = useDiagramStore((s) => s.undo);
  const redo         = useDiagramStore((s) => s.redo);
  const canUndo      = useDiagramStore(selectCanUndo);
  const canRedo      = useDiagramStore(selectCanRedo);
  const deleteNodes  = useDiagramStore((s) => s.deleteSelectedNodes);
  const buildDoc     = useDiagramStore((s) => s.buildDocument);
  const resetDiagram = useDiagramStore((s) => s.resetDiagram);
  const selection    = useDiagramStore((s) => s.selection);
  const hasSelection =
    selection.nodeIds.length > 0 || selection.edgeIds.length > 0;
  const handleExport = useCallback(() => {
    exportDiagramAsJson(buildDoc());
  }, [buildDoc]);
  // Reusable toolbar button with tooltip
  const ToolbarBtn = ({
    icon: Icon,
    label,
    shortcut,
    onClick,
    disabled,
    active,
    danger,
  }: {
    icon: React.ElementType;
    label: string;
    shortcut?: string;
    onClick: () => void;
    disabled?: boolean;
    active?: boolean;
    danger?: boolean;
  }) => (
    <TooltipProvider delayDuration={400}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={active ? "secondary" : "ghost"}
            size="icon"
            className={cn(
              "h-8 w-8",
              danger && "hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
            )}
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            aria-pressed={active}
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <p>{label}</p>
          {shortcut && <p className="text-zinc-400">{shortcut}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
  return (
    <div
      className="flex items-center gap-1 px-2 h-10
                 bg-white dark:bg-zinc-900
                 border-b border-zinc-200 dark:border-zinc-800"
      role="toolbar"
      aria-label="Diagram editor toolbar"
    >
      {/* Editor mode group */}
      <ToolbarBtn
        icon={MousePointer2}
        label="Select"
        shortcut={KEYBOARD_SHORTCUTS.selectMode}
        onClick={() => setMode("select")}
        active={editorMode === "select"}
      />
      <ToolbarBtn
        icon={Hand}
        label="Pan"
        shortcut={KEYBOARD_SHORTCUTS.panMode}
        onClick={() => setMode("pan")}
        active={editorMode === "pan"}
      />
      <ToolbarBtn
        icon={Zap}
        label="Connect"
        shortcut={KEYBOARD_SHORTCUTS.connectMode}
        onClick={() => setMode("connect")}
        active={editorMode === "connect"}
      />
      <Separator orientation="vertical" className="h-5 mx-1" />
      {/* History group */}
      <ToolbarBtn
        icon={Undo2}
        label="Undo"
        shortcut={KEYBOARD_SHORTCUTS.undo}
        onClick={undo}
        disabled={!canUndo}
      />
      <ToolbarBtn
        icon={Redo2}
        label="Redo"
        shortcut={KEYBOARD_SHORTCUTS.redo}
        onClick={redo}
        disabled={!canRedo}
      />
      <Separator orientation="vertical" className="h-5 mx-1" />
      {/* Zoom group */}
      <ToolbarBtn
        icon={ZoomIn}
        label="Zoom In"
        shortcut={KEYBOARD_SHORTCUTS.zoomIn}
        onClick={() => zoomIn()}
      />
      <ToolbarBtn
        icon={ZoomOut}
        label="Zoom Out"
        shortcut={KEYBOARD_SHORTCUTS.zoomOut}
        onClick={() => zoomOut()}
      />
      <ToolbarBtn
        icon={Maximize2}
        label="Fit View"
        shortcut={KEYBOARD_SHORTCUTS.fitView}
        onClick={() => fitView({ padding: 0.1 })}
      />
      <Separator orientation="vertical" className="h-5 mx-1" />
      {/* Destructive actions */}
      <ToolbarBtn
        icon={Trash2}
        label="Delete Selected"
        shortcut={KEYBOARD_SHORTCUTS.delete}
        onClick={deleteNodes}
        disabled={!hasSelection}
        danger
      />
      <ToolbarBtn
        icon={RotateCcw}
        label="Reset Canvas"
        onClick={resetDiagram}
        danger
      />
      <Separator orientation="vertical" className="h-5 mx-1" />
      {/* File group */}
      <ToolbarBtn icon={Upload} label="Import JSON" onClick={onImport} />
      <ToolbarBtn icon={Download} label="Export JSON" onClick={handleExport} />
      {onSave && (
        <ToolbarBtn icon={Save} label="Save" shortcut={KEYBOARD_SHORTCUTS.undo} onClick={onSave} />
      )}
    </div>
  );
}
// Local cn helper to avoid circular imports in toolbar
function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
