// Toolbar.tsx - Unified minimal toolbar with all controls
"use client";

import { useCallback, useRef } from "react";
import type { Node, Edge } from "@xyflow/react";
import {
  Plus,
  Circle,
  Square,
  Hexagon,
  Download,
  Upload,
  Save,
  RotateCcw,
  Trash2,
  Undo2,
  Redo2,
} from "lucide-react";
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

  // Generate unique ID for new nodes
  const generateId = () =>
    `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add Hub node
  const addHub = useCallback(() => {
    const newNode: Node = {
      id: generateId(),
      type: "hub",
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        label: "New Hub",
        description: "Hub description",
      },
    };
    onAddNode(newNode);
  }, [onAddNode]);

  // Add Category node
  const addCategory = useCallback(() => {
    const newNode: Node = {
      id: generateId(),
      type: "category",
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        label: "New Category",
        categoryLabel: "Category Group",
      },
    };
    onAddNode(newNode);
  }, [onAddNode]);

  // Add Standard node
  const addStandard = useCallback(() => {
    const newNode: Node = {
      id: generateId(),
      type: "standard",
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        label: "NEW-STD",
        fullName: "New Standard",
        description: "Standard description",
        type: "OTHER",
        url: "",
      },
    };
    onAddNode(newNode);
  }, [onAddNode]);

  // Handle export to JSON file
  const handleExport = useCallback(() => {
    const filename = `equipment-diagram-${new Date().toISOString().slice(0, 10)}.json`;
    exportFlowState(nodes, edges, filename);
  }, [nodes, edges]);

  // Handle import from JSON file
  const handleImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const state = await importFlowState(file);
        onImport(state.nodes, state.edges);
        alert("دیاگرام با موفقیت وارد شد!");
      } catch (error) {
        console.error("Import failed:", error);
        alert("خطا در وارد کردن فایل. لطفاً فرمت فایل را بررسی کنید.");
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [onImport],
  );

  // Trigger file input click
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle reset with confirmation
  const handleReset = useCallback(() => {
    if (
      confirm(
        "آیا مطمئن هستید که می‌خواهید دیاگرام را به حالت اولیه بازگردانید? تمام تغییرات از بین می‌رود.",
      )
    ) {
      onReset();
      clearFlowState();
    }
  }, [onReset]);

  // Handle clear saved state
  const handleClearSaved = useCallback(() => {
    if (confirm("پاک کردن دیاگرام ذخیره شده از مرورگر?")) {
      clearFlowState();
      alert("وضعیت ذخیره شده پاک شد!");
    }
  }, []);

  return (
    <div className="flex h-12 w-full items-center justify-between border-b border-warm-border bg-surface-primary px-4 shadow-sm">
      {/* Left section: Add nodes */}
      <div className="flex items-center gap-1">
        <button
          onClick={addHub}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-warm-border/30"
          title="افزودن Hub"
        >
          <Circle className="h-4 w-4" />
          <span className="hidden sm:inline">Hub</span>
        </button>

        <button
          onClick={addCategory}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-warm-border/30"
          title="افزودن Category"
        >
          <Square className="h-4 w-4" />
          <span className="hidden sm:inline">Category</span>
        </button>

        <button
          onClick={addStandard}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-warm-border/30"
          title="افزودن Standard"
        >
          <Hexagon className="h-4 w-4" />
          <span className="hidden sm:inline">Standard</span>
        </button>

        <div className="mx-2 h-6 w-px bg-warm-border" />

        {/* Undo/Redo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          className="rounded-md p-1.5 text-ink transition-colors hover:bg-warm-border/30 disabled:cursor-not-allowed disabled:opacity-30"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          className="rounded-md p-1.5 text-ink transition-colors hover:bg-warm-border/30 disabled:cursor-not-allowed disabled:opacity-30"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>

      {/* Right section: File operations */}
      <div className="flex items-center gap-1">
        <button
          onClick={onSave}
          className="rounded-md p-1.5 text-ink transition-colors hover:bg-warm-border/30"
          title="ذخیره در مرورگر"
        >
          <Save className="h-4 w-4" />
        </button>

        <button
          onClick={handleExport}
          className="rounded-md p-1.5 text-ink transition-colors hover:bg-warm-border/30"
          title="خروجی JSON"
        >
          <Download className="h-4 w-4" />
        </button>

        <button
          onClick={triggerFileInput}
          className="rounded-md p-1.5 text-ink transition-colors hover:bg-warm-border/30"
          title="ورود JSON"
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

        <div className="mx-2 h-6 w-px bg-warm-border" />

        <button
          onClick={handleReset}
          className="rounded-md p-1.5 text-ink transition-colors hover:bg-warm-border/30"
          title="بازگشت به حالت اولیه"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        <button
          onClick={handleClearSaved}
          className="rounded-md p-1.5 text-ink transition-colors hover:bg-warm-border/30"
          title="پاک کردن ذخیره"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
