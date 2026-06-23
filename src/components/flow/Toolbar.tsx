// src/components/flow/Toolbar.tsx
// Unified minimal toolbar with all controls.
"use client";

import { useCallback, useRef, useState } from "react";
import type { Node, Edge } from "@xyflow/react";
import {
  Circle,
  Square,
  Hexagon,
  Pentagon,
  Download,
  Upload,
  Save,
  RotateCcw,
  Trash2,
  Undo2,
  Redo2,
} from "lucide-react";
import { toast } from "sonner";
import {
  exportFlowState,
  importFlowState,
  clearFlowState,
} from "@/lib/flowStorage";

interface UnifiedToolbarProps {
  onAddNode: (node: Node) => void;
  nodes: Node[];
  edges: Edge[];
  onImport: (nodes: Node[], edges: Edge[]) => void;
  onReset: () => void;
  onSave: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const genId = () =>
  `node-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const randomPos = () => ({
  x: Math.random() * 400 + 100,
  y: Math.random() * 300 + 100,
});

// ─── Component ────────────────────────────────────────────────────────────────
export function UnifiedToolbar({
  onAddNode,
  nodes,
  edges,
  onImport,
  onReset,
  onSave,
  undo,
  redo,
  canUndo,
  canRedo,
}: UnifiedToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // ── Add node helpers ────────────────────────────────────────────────────────
  const addHub = useCallback(() => {
    onAddNode({
      id: genId(),
      type: "hub",
      position: randomPos(),
      data: { label: "New Hub" },
    });
  }, [onAddNode]);

  const addCategory = useCallback(() => {
    onAddNode({
      id: genId(),
      type: "category",
      position: randomPos(),
      data: { label: "New Category", categoryLabel: "Category Group" },
    });
  }, [onAddNode]);

  const addSubcategory = useCallback(() => {
    onAddNode({
      id: genId(),
      type: "subcategory",
      position: randomPos(),
      data: { label: "New Subcategory" },
    });
  }, [onAddNode]);

  const addStandard = useCallback(() => {
    onAddNode({
      id: genId(),
      type: "standard",
      position: randomPos(),
      data: {
        label: "NEW-STD",
        standardType: "OTHER", // ← correct field name
        standardNumber: "",
        fullName: "New Standard",
        description: "",
        url: "",
      },
    });
  }, [onAddNode]);

  // ── File operations ─────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const filename = `equipment-diagram-${new Date().toISOString().slice(0, 10)}.json`;
    exportFlowState(nodes, edges, filename);
    toast.success("دیاگرام صادر شد");
  }, [nodes, edges]);

  const handleImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const state = await importFlowState(file);
        onImport(state.nodes, state.edges);
        toast.success("دیاگرام با موفقیت وارد شد");
      } catch {
        toast.error("خطا در وارد کردن فایل. لطفاً فرمت فایل را بررسی کنید.");
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [onImport],
  );

  const handleSave = useCallback(() => {
    onSave();
    toast.success("ذخیره در مرورگر انجام شد");
  }, [onSave]);

  const handleReset = useCallback(() => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000); // auto-cancel after 3 s
      return;
    }
    onReset();
    clearFlowState();
    setConfirmReset(false);
    toast.info("دیاگرام به حالت اولیه بازگشت");
  }, [confirmReset, onReset]);

  const handleClearSaved = useCallback(() => {
    clearFlowState();
    toast.info("وضعیت ذخیره‌شده پاک شد");
  }, []);

  // ── Shared button class ─────────────────────────────────────────────────────
  const iconBtn =
    "rounded-md p-1.5 text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30";
  const labelBtn =
    "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted";
  const divider = "mx-1 h-6 w-px bg-border";

  return (
    <div className="flex h-12 w-full items-center justify-between border-b border-border bg-card px-4 shadow-sm">
      {/* ── Left: add nodes + undo/redo ────────────────────────────────────── */}
      <div className="flex items-center gap-0.5">
        <button onClick={addHub} className={labelBtn} title="افزودن Hub">
          <Circle className="h-4 w-4 text-amber-500" />
          <span className="hidden sm:inline">Hub</span>
        </button>
        <button
          onClick={addCategory}
          className={labelBtn}
          title="افزودن Category"
        >
          <Square className="h-4 w-4 text-blue-500" />
          <span className="hidden sm:inline">Category</span>
        </button>
        <button
          onClick={addSubcategory}
          className={labelBtn}
          title="افزودن Subcategory"
        >
          <Pentagon className="h-4 w-4 text-violet-500" />
          <span className="hidden sm:inline">Subcategory</span>
        </button>
        <button
          onClick={addStandard}
          className={labelBtn}
          title="افزودن Standard"
        >
          <Hexagon className="h-4 w-4 text-green-500" />
          <span className="hidden sm:inline">Standard</span>
        </button>

        <div className={divider} />

        <button
          onClick={undo}
          disabled={!canUndo}
          className={iconBtn}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className={iconBtn}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>

      {/* ── Right: file operations ──────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={handleSave}
          className={iconBtn}
          title="ذخیره در مرورگر"
        >
          <Save className="h-4 w-4" />
        </button>
        <button onClick={handleExport} className={iconBtn} title="خروجی JSON">
          <Download className="h-4 w-4" />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className={iconBtn}
          title="ورودی JSON"
        >
          <Upload className="h-4 w-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        <div className={divider} />

        {/* Reset with inline confirm */}
        <button
          onClick={handleReset}
          className={`${iconBtn} ${confirmReset ? "text-destructive ring-1 ring-destructive" : ""}`}
          title={
            confirmReset
              ? "دوباره کلیک کنید تا تأیید شود"
              : "بازگشت به حالت اولیه"
          }
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        <button
          onClick={handleClearSaved}
          className={iconBtn}
          title="پاک کردن ذخیره"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
