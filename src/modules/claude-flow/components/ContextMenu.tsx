"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Copy,
  Trash2,
  Maximize,
  CheckSquare,
  ClipboardPaste,
  Layers,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { DiagramNodeType } from "../types";

export interface ContextMenuState {
  x: number;
  y: number;
  target: "pane" | "node" | "edge";
}

/** Minimal shape needed to render a quick-add item — matches DiagramCanvas's QUICK_ADD_ITEMS. */
export interface QuickAddItem {
  type: DiagramNodeType;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

// Menu dimensions used for edge-clamping calculations
const MENU_W = 176; // w-44 = 11rem = 176px
const MENU_H = 160; // approximate max height (5 items Ã— ~32px)

/**
 * Clamps the menu position so it never overflows the viewport.
 * Returns adjusted { x, y } coordinates.
 */
function clampPosition(x: number, y: number): { x: number; y: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return {
    x: Math.min(x, vw - MENU_W - 8),
    y: Math.min(y, vh - MENU_H - 8),
  };
}

export function ContextMenu({
  state,
  onClose,
  onDuplicate,
  onDelete,
  onFitView,
  onSelectAll,
  onPaste,
  canPaste,
  onGroup,
  onUngroup,
  isGroupNode,
  onAddNode,
  quickAddItems,
}: {
  state: ContextMenuState;
  onClose: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onFitView: () => void;
  onSelectAll: () => void;
  onPaste: () => void;
  canPaste: boolean;
  /** Wraps the current multi-selection in a new sub-flow container. */
  onGroup?: () => void;
  /** Ungroups the right-clicked sub-flow, promoting its children back out. */
  onUngroup?: () => void;
  /** Whether the right-clicked node is itself a sub-flow/group node. */
  isGroupNode?: boolean;
  /** Creates a node of the given type at the right-clicked position. */
  onAddNode?: (type: DiagramNodeType) => void;
  /** Short list of node types offered under "Add node here" on the pane menu. */
  quickAddItems?: QuickAddItem[];
}) {
  const t = useTranslations("Flow");
  const ref = useRef<HTMLDivElement>(null);

  // Clamped position â€” recalculated whenever the menu appears at a new spot
  const { x, y } = clampPosition(state.x, state.y);

  // Tiny mount flag drives the entrance animation via opacity/scale transition
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    // Defer one frame so the CSS transition has a starting state to animate from
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Close on any outside click or right-click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener("mousedown", handler);
    window.addEventListener("contextmenu", handler);
    return () => {
      window.removeEventListener("mousedown", handler);
      window.removeEventListener("contextmenu", handler);
    };
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  /**
   * Renders a single menu item button.
   * Calls onClick then immediately closes the menu.
   */
  const item = (
    Icon: React.ComponentType<{ className?: string }>,
    label: string,
    onClick: () => void,
    disabled = false,
  ) => (
    <button
      key={label}
      onClick={() => {
        if (!disabled) {
          onClick();
          onClose();
        }
      }}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5",
        "text-start text-xs text-slate-600",
        "transition-colors hover:bg-slate-100 hover:text-slate-900",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-600",
        // Focus ring for keyboard navigation
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );

  // â”€â”€ Section: destructive actions (delete) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const hasDestructive = state.target === "node" || state.target === "edge";

  // â”€â”€ Section: node-only actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const hasNodeActions = state.target === "node";

  // â”€â”€ Section: pane-only actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const hasPaneActions = state.target === "pane";

  return (
    <div
      ref={ref}
      style={{ top: y, left: x }}
      className={cn(
        // Positioning
        "fixed z-50 w-44",
        // Visual shell
        "rounded-lg border border-slate-200 bg-white p-1 shadow-lg",
        // Entrance animation â€” starts at opacity-0 scale-95, transitions to full
        "transition-[opacity,transform] duration-100",
        visible ? "scale-100 opacity-100" : "scale-95 opacity-0",
      )}
      // Stop propagation so the outside-click handler doesn't immediately close
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* ── Node actions ─────────────────────────────────────────────── */}
      {hasNodeActions && (
        <div className="space-y-0.5">
          {item(Copy, t("contextMenu.duplicate"), onDuplicate)}
          {isGroupNode
            ? onUngroup && item(Layers, "Ungroup", onUngroup)
            : onGroup && item(Layers, "Group into sub-flow", onGroup)}
        </div>
      )}

      {/* Separator between node actions and destructive section */}
      {hasNodeActions && hasDestructive && (
        <div className="my-1 border-t border-slate-100" />
      )}

      {/* â”€â”€ Destructive actions (node + edge) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {hasDestructive && (
        <div className="space-y-0.5">
          {item(Trash2, t("contextMenu.delete"), onDelete)}
        </div>
      )}

      {/* â”€â”€ Pane actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {hasPaneActions && (
        <div className="space-y-0.5">
          {item(ClipboardPaste, t("contextMenu.paste"), onPaste, !canPaste)}
          {item(CheckSquare, t("contextMenu.selectAll"), onSelectAll)}
          <div className="my-1 border-t border-slate-100" />
          {item(Maximize, t("contextMenu.fitView"), onFitView)}
          {onAddNode && quickAddItems && quickAddItems.length > 0 && (
            <>
              <div className="my-1 border-t border-slate-100" />
              <p className="px-2.5 pb-0.5 pt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Add node here</p>
              {quickAddItems.map((qi) => item(qi.icon, qi.label, () => onAddNode(qi.type)))}
            </>
          )}
        </div>
      )}
    </div>
  );
}



