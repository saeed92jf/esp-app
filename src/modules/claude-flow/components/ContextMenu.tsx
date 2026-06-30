"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Copy,
  Trash2,
  Maximize,
  CheckSquare,
  ClipboardPaste,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface ContextMenuState {
  x: number;
  y: number;
  target: "pane" | "node" | "edge";
}

// Menu dimensions used for edge-clamping calculations
const MENU_W = 176; // w-44 = 11rem = 176px
const MENU_H = 160; // approximate max height (5 items × ~32px)

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
}: {
  state: ContextMenuState;
  onClose: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onFitView: () => void;
  onSelectAll: () => void;
  onPaste: () => void;
  canPaste: boolean;
}) {
  const t = useTranslations("Flow");
  const ref = useRef<HTMLDivElement>(null);

  // Clamped position — recalculated whenever the menu appears at a new spot
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

  // ── Section: destructive actions (delete) ──────────────────────────────────
  const hasDestructive = state.target === "node" || state.target === "edge";

  // ── Section: node-only actions ─────────────────────────────────────────────
  const hasNodeActions = state.target === "node";

  // ── Section: pane-only actions ─────────────────────────────────────────────
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
        // Entrance animation — starts at opacity-0 scale-95, transitions to full
        "transition-[opacity,transform] duration-100",
        visible ? "scale-100 opacity-100" : "scale-95 opacity-0",
      )}
      // Stop propagation so the outside-click handler doesn't immediately close
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* ── Node actions ──────────────────────────────────────────────────── */}
      {hasNodeActions && (
        <div className="space-y-0.5">
          {item(Copy, t("contextMenu.duplicate"), onDuplicate)}
        </div>
      )}

      {/* Separator between node actions and destructive section */}
      {hasNodeActions && hasDestructive && (
        <div className="my-1 border-t border-slate-100" />
      )}

      {/* ── Destructive actions (node + edge) ─────────────────────────────── */}
      {hasDestructive && (
        <div className="space-y-0.5">
          {item(Trash2, t("contextMenu.delete"), onDelete)}
        </div>
      )}

      {/* ── Pane actions ──────────────────────────────────────────────────── */}
      {hasPaneActions && (
        <div className="space-y-0.5">
          {item(ClipboardPaste, t("contextMenu.paste"), onPaste, !canPaste)}
          {item(CheckSquare, t("contextMenu.selectAll"), onSelectAll)}
          <div className="my-1 border-t border-slate-100" />
          {item(Maximize, t("contextMenu.fitView"), onFitView)}
        </div>
      )}
    </div>
  );
}
